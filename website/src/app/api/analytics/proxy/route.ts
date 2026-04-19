import { ANALYTICS_AUTH_COOKIE } from "@/lib/analytics-auth";
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

  const upstream = await fetch(upstreamUrl.toString(), {
    headers: {
      "x-analytics-secret": ANALYTICS_API_SECRET,
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
