import { ANALYTICS_AUTH_COOKIE } from "@/lib/analytics-auth";
import { NextRequest, NextResponse } from "next/server";

const ANALYTICS_PASSWORD = process.env.ANALYTICS_PASSWORD;

export async function GET(req: NextRequest) {
  return NextResponse.json({
    authed: req.cookies.get(ANALYTICS_AUTH_COOKIE)?.value === "1",
  });
}

export async function POST(req: NextRequest) {
  if (!ANALYTICS_PASSWORD) {
    return NextResponse.json({ error: "Analytics password not configured" }, { status: 500 });
  }

  const { password } = await req.json();
  if (!password || password !== ANALYTICS_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ANALYTICS_AUTH_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
  return response;
}

