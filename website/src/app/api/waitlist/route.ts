import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

const MAX_BODY_LENGTH = 4096;
const WINDOW_MS = 5 * 60 * 1000;
// Best-effort protection per server instance, alongside the honeypot. This is
// deliberately bounded; it is not a replacement for a shared WAF rate limit.
const attempts = new Map<string, { count: number; expires: number }>();

function rateLimited(req: NextRequest) {
  const ip = (
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]
  )
    ?.trim()
    .slice(0, 64);
  if (!ip) return false;
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && entry.expires > now) {
    entry.count += 1;
    return entry.count > 8;
  }
  if (attempts.size >= 2000) {
    for (const [key, value] of attempts)
      if (value.expires <= now) attempts.delete(key);
    if (attempts.size >= 2000) attempts.delete(attempts.keys().next().value!);
  }
  attempts.set(ip, { count: 1, expires: now + WINDOW_MS });
  return false;
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin && origin !== req.nextUrl.origin) {
    return NextResponse.json(
      { error: "Please sign up from our website." },
      { status: 403 },
    );
  }
  if (rateLimited(req)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": "300" } },
    );
  }
  if (Number(req.headers.get("content-length")) > MAX_BODY_LENGTH) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_LENGTH)
      return NextResponse.json(
        { error: "Request too large." },
        { status: 413 },
      );
    body = req.headers
      .get("content-type")
      ?.includes("application/x-www-form-urlencoded")
      ? Object.fromEntries(new URLSearchParams(raw))
      : JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }
  const fields = body as Record<string, unknown>;
  if (fields.website)
    return NextResponse.json({ success: true, alreadySubscribed: true });
  const email =
    typeof fields.email === "string" ? fields.email.trim().toLowerCase() : "";

  if (
    !email ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return NextResponse.json(
      { error: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  try {
    const { error } = await createAdminClient()
      .from("waitlist")
      .insert({ email });

    if (error?.code === "23505") {
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }
    if (error) throw new Error("Waitlist insert failed");
    return NextResponse.json(
      { success: true, alreadySubscribed: false },
      { status: 201 },
    );
  } catch {
    // Do not log email addresses, credentials, or raw database responses.
    console.error("Waitlist signup could not be saved.");
    return NextResponse.json(
      { error: "We couldn’t save your email just now. Please try again." },
      { status: 503 },
    );
  }
}
