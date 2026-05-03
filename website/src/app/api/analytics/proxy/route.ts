import { ANALYTICS_AUTH_COOKIE } from "@/lib/analytics-auth";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const ANALYTICS_API_SECRET = process.env.ANALYTICS_API_SECRET;

export async function GET(req: NextRequest) {
  if (req.cookies.get(ANALYTICS_AUTH_COOKIE)?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ANALYTICS_API_SECRET) {
    return NextResponse.json({ error: "Analytics secret not configured" }, { status: 500 });
  }

  const upstreamUrl = new URL("/api/analytics", req.url);
  upstreamUrl.search = req.nextUrl.search;
  const requestedUserId = req.nextUrl.searchParams.get("user_id");
  let userId: string | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch (error) {
    console.error("Analytics proxy user lookup failed:", error);
  }

  const upstream = await fetch(upstreamUrl.toString(), {
    headers: {
      "x-analytics-secret": ANALYTICS_API_SECRET,
      ...((userId ?? requestedUserId) ? { "x-analytics-user-id": userId ?? requestedUserId! } : {}),
    },
    cache: "no-store",
  });

  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
