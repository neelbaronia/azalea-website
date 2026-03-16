import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

type PeriodType = "daily" | "weekly" | "monthly";

interface AggRow {
  content_type: string;
  content_id: string;
  content_name: string;
  content_author: string;
  total_seconds: number;
  event_count: number;
  period_start: string;
}

function getPeriodStart(date: Date, period: PeriodType): string {
  if (period === "daily") {
    return date.toISOString().slice(0, 10);
  }
  if (period === "weekly") {
    const d = new Date(date);
    const day = d.getUTCDay();
    d.setUTCDate(d.getUTCDate() - day); // Sunday start
    return d.toISOString().slice(0, 10);
  }
  // monthly
  return `${date.toISOString().slice(0, 7)}-01`;
}

function aggregate(
  sessions: Array<{
    content_type: string;
    content_id: string;
    content_name: string;
    content_author: string;
    seconds_listened: number;
    started_at: string;
  }>,
  period: PeriodType
): { rows: AggRow[]; periods: string[] } {
  const map = new Map<string, AggRow>();
  const periodSet = new Set<string>();

  for (const s of sessions) {
    const ps = getPeriodStart(new Date(s.started_at), period);
    periodSet.add(ps);
    const key = `${ps}|${s.content_type}|${s.content_id}`;
    const existing = map.get(key);
    if (existing) {
      existing.total_seconds += s.seconds_listened;
      existing.event_count += 1;
    } else {
      map.set(key, {
        content_type: s.content_type,
        content_id: s.content_id,
        content_name: s.content_name,
        content_author: s.content_author,
        total_seconds: s.seconds_listened,
        event_count: 1,
        period_start: ps,
      });
    }
  }

  const rows = [...map.values()].sort((a, b) => b.total_seconds - a.total_seconds);
  const periods = [...periodSet].sort((a, b) => b.localeCompare(a));
  return { rows, periods };
}

export async function GET(req: NextRequest) {
  const period = (req.nextUrl.searchParams.get("period") || "daily") as PeriodType;
  const periodStart = req.nextUrl.searchParams.get("period_start");

  if (!["daily", "weekly", "monthly"].includes(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Fetch both tables in parallel
  const [audiobookRes, podcastRes] = await Promise.all([
    supabase
      .from("listening_sessions")
      .select("audiobook_id, audiobook_title, audiobook_author, seconds_listened, started_at"),
    supabase
      .from("podcast_listening_sessions")
      .select("episode_id, episode_title, show_id, show_title, show_author, seconds_listened, started_at"),
  ]);

  if (audiobookRes.error || podcastRes.error) {
    console.error("Analytics query error:", audiobookRes.error || podcastRes.error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }

  // Normalize into a common shape
  const allSessions = [
    ...(audiobookRes.data ?? []).map((s) => ({
      content_type: "audiobook",
      content_id: s.audiobook_id,
      content_name: s.audiobook_title,
      content_author: s.audiobook_author,
      seconds_listened: s.seconds_listened,
      started_at: s.started_at,
    })),
    ...(podcastRes.data ?? []).map((s) => ({
      content_type: "podcast",
      content_id: s.show_id,
      content_name: `${s.show_title} — ${s.episode_title}`,
      content_author: s.show_author,
      seconds_listened: s.seconds_listened,
      started_at: s.started_at,
    })),
  ];

  const { rows, periods } = aggregate(allSessions, period);

  // Filter to selected period
  const filtered = periodStart ? rows.filter((r) => r.period_start === periodStart) : rows.filter((r) => r.period_start === periods[0]);

  return NextResponse.json({ data: filtered, periods });
}
