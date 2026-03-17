import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

type PeriodType = "daily" | "weekly" | "monthly";

function getPeriodStart(date: Date, period: PeriodType): string {
  if (period === "daily") {
    return date.toISOString().slice(0, 10);
  }
  if (period === "weekly") {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() - d.getUTCDay()); // Sunday start
    return d.toISOString().slice(0, 10);
  }
  return `${date.toISOString().slice(0, 7)}-01`;
}

export async function GET(req: NextRequest) {
  const period = (req.nextUrl.searchParams.get("period") || "daily") as PeriodType;
  const periodStart = req.nextUrl.searchParams.get("period_start");

  if (!["daily", "weekly", "monthly"].includes(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const LIBRARY_URL = "https://pub-ee342152cf1149298fc3cb54a286f268.r2.dev/library.json";

  const [audiobookRes, podcastRes, showsRes, libraryRes] = await Promise.all([
    supabase
      .from("listening_sessions")
      .select("audiobook_id, audiobook_title, audiobook_author, seconds_listened, started_at, device_id"),
    supabase
      .from("podcast_listening_sessions")
      .select("episode_id, episode_title, show_id, show_title, show_author, seconds_listened, started_at, device_id"),
    supabase
      .from("shows")
      .select("id, image_url"),
    fetch(LIBRARY_URL).then((r) => r.ok ? r.json() : []).catch(() => []),
  ]);

  if (audiobookRes.error || podcastRes.error) {
    console.error("Analytics query error:", audiobookRes.error || podcastRes.error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }

  // Build image lookup maps
  const showImageMap = new Map<string, string>();
  for (const show of showsRes.data ?? []) {
    if (show.image_url) showImageMap.set(show.id, show.image_url.trim());
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const libraryBooks = libraryRes as any[];
  const audiobookImageMap = new Map<string, string>();
  for (const book of libraryBooks) {
    const baseUrl = book.remoteBaseURL || book.remoteBaseUrl;
    if (baseUrl) {
      audiobookImageMap.set(book.title, `${baseUrl}/cover.png`);
    }
  }

  // Build a set of known audiobook titles from library.json to filter out podcasts logged in listening_sessions
  const knownAudiobookTitles = new Set(libraryBooks.map((b: { title: string }) => b.title));

  // Collect all period starts
  const periodSet = new Set<string>();

  // Aggregate audiobooks by period (only include titles that exist in library.json)
  const audiobookMap = new Map<string, { id: string; title: string; author: string; image_url: string | null; total_seconds: number; listeners: Set<string> }>();
  for (const s of audiobookRes.data ?? []) {
    if (!knownAudiobookTitles.has(s.audiobook_title)) continue;
    const ps = getPeriodStart(new Date(s.started_at), period);
    periodSet.add(ps);
    const key = `${ps}|${s.audiobook_id}`;
    const existing = audiobookMap.get(key);
    if (existing) {
      existing.total_seconds += s.seconds_listened;
      existing.listeners.add(s.device_id);
    } else {
      audiobookMap.set(key, {
        id: s.audiobook_id,
        title: s.audiobook_title,
        author: s.audiobook_author,
        image_url: audiobookImageMap.get(s.audiobook_title) ?? null,
        total_seconds: s.seconds_listened,
        listeners: new Set([s.device_id]),
      });
    }
  }

  // Aggregate podcasts: show-level and episode-level
  const showMap = new Map<string, {
    show_id: string;
    show_title: string;
    show_author: string;
    image_url: string | null;
    total_seconds: number;
    listeners: Set<string>;
    episodes: Map<string, { episode_id: string; episode_title: string; total_seconds: number; listeners: Set<string> }>;
  }>();
  for (const s of podcastRes.data ?? []) {
    const ps = getPeriodStart(new Date(s.started_at), period);
    periodSet.add(ps);
    const showKey = `${ps}|${s.show_id}`;
    const existing = showMap.get(showKey);
    if (existing) {
      existing.total_seconds += s.seconds_listened;
      existing.listeners.add(s.device_id);
      const ep = existing.episodes.get(s.episode_id);
      if (ep) {
        ep.total_seconds += s.seconds_listened;
        ep.listeners.add(s.device_id);
      } else {
        existing.episodes.set(s.episode_id, {
          episode_id: s.episode_id,
          episode_title: s.episode_title,
          total_seconds: s.seconds_listened,
          listeners: new Set([s.device_id]),
        });
      }
    } else {
      const episodes = new Map();
      episodes.set(s.episode_id, {
        episode_id: s.episode_id,
        episode_title: s.episode_title,
        total_seconds: s.seconds_listened,
        listeners: new Set([s.device_id]),
      });
      showMap.set(showKey, {
        show_id: s.show_id,
        show_title: s.show_title,
        show_author: s.show_author,
        image_url: showImageMap.get(s.show_id) ?? null,
        total_seconds: s.seconds_listened,
        listeners: new Set([s.device_id]),
        episodes,
      });
    }
  }

  // For shows missing images, look up artwork via iTunes Search API
  const showsMissingImages = [...showMap.values()].filter((s) => !s.image_url);
  const uniqueTitles = [...new Set(showsMissingImages.map((s) => s.show_title))];
  if (uniqueTitles.length > 0) {
    const lookups = await Promise.all(
      uniqueTitles.map(async (title) => {
        try {
          const res = await fetch(
            `https://itunes.apple.com/search?${new URLSearchParams({ term: title, media: "podcast", limit: "1" })}`
          );
          const json = await res.json();
          const artworkUrl = json.results?.[0]?.artworkUrl600 || json.results?.[0]?.artworkUrl100;
          return { title, artworkUrl: artworkUrl ?? null };
        } catch {
          return { title, artworkUrl: null };
        }
      })
    );
    const itunesMap = new Map(lookups.map((l) => [l.title, l.artworkUrl]));
    for (const show of showMap.values()) {
      if (!show.image_url) {
        show.image_url = itunesMap.get(show.show_title) ?? null;
      }
    }
  }

  const allPeriods = [...periodSet].sort((a, b) => b.localeCompare(a));
  const targetPeriod = periodStart || allPeriods[0];

  // Filter to target period and serialize Sets to counts
  const filteredAudiobooks = [...audiobookMap.entries()]
    .filter(([key]) => key.startsWith(`${targetPeriod}|`))
    .map(([, v]) => ({
      id: v.id,
      title: v.title,
      author: v.author,
      image_url: v.image_url,
      total_seconds: v.total_seconds,
      unique_listeners: v.listeners.size,
    }))
    .sort((a, b) => b.total_seconds - a.total_seconds);

  const filteredPodcasts = [...showMap.entries()]
    .filter(([key]) => key.startsWith(`${targetPeriod}|`))
    .map(([, v]) => ({
      show_id: v.show_id,
      show_title: v.show_title,
      show_author: v.show_author,
      image_url: v.image_url,
      total_seconds: v.total_seconds,
      unique_listeners: v.listeners.size,
      episodes: [...v.episodes.values()]
        .map((ep) => ({
          episode_id: ep.episode_id,
          episode_title: ep.episode_title,
          total_seconds: ep.total_seconds,
          unique_listeners: ep.listeners.size,
        }))
        .sort((a, b) => b.total_seconds - a.total_seconds),
    }))
    .sort((a, b) => b.total_seconds - a.total_seconds);

  // --- Revenue & Payout Calculation ---
  // For daily/weekly views, fetch the full month's revenue and prorate
  let revenue = { gross: 0, royalty_pool: 0, royalty_rate: 0.50 };

  if (targetPeriod) {
    const periodDate = new Date(targetPeriod + "T00:00:00Z");

    // Always fetch the full month's charges
    const monthStart = new Date(Date.UTC(periodDate.getUTCFullYear(), periodDate.getUTCMonth(), 1));
    const monthEnd = new Date(Date.UTC(periodDate.getUTCFullYear(), periodDate.getUTCMonth() + 1, 1));
    const daysInMonth = (monthEnd.getTime() - monthStart.getTime()) / (86400 * 1000);

    const gte = Math.floor(monthStart.getTime() / 1000);
    const lt = Math.floor(monthEnd.getTime() / 1000);

    try {
      const stripe = getStripe();
      let grossCents = 0;
      let hasMore = true;
      let startingAfter: string | undefined;

      while (hasMore) {
        const params: Stripe.ChargeListParams = {
          created: { gte, lt },
          limit: 100,
        };
        if (startingAfter) params.starting_after = startingAfter;

        const charges = await stripe.charges.list(params);
        for (const charge of charges.data) {
          if (charge.status === "succeeded") {
            grossCents += charge.amount;
          }
        }
        hasMore = charges.has_more;
        if (charges.data.length > 0) {
          startingAfter = charges.data[charges.data.length - 1].id;
        }
      }

      const monthlyGross = grossCents / 100;

      // Prorate based on period length
      let prorateFactor = 1;
      if (period === "daily") {
        prorateFactor = 1 / daysInMonth;
      } else if (period === "weekly") {
        prorateFactor = 7 / daysInMonth;
      }

      const gross = monthlyGross * prorateFactor;
      revenue = { gross, royalty_pool: gross * 0.50, royalty_rate: 0.50 };
    } catch (e) {
      console.error("Stripe revenue fetch error:", e);
    }
  }

  // Calculate per-item payouts based on share of total platform seconds
  const totalPlatformSeconds =
    filteredAudiobooks.reduce((s, a) => s + a.total_seconds, 0) +
    filteredPodcasts.reduce((s, p) => s + p.total_seconds, 0);

  const audiobooksWithPayout = filteredAudiobooks.map((a) => ({
    ...a,
    payout: totalPlatformSeconds > 0
      ? (a.total_seconds / totalPlatformSeconds) * revenue.royalty_pool
      : 0,
  }));

  const podcastsWithPayout = filteredPodcasts.map((show) => {
    const showPayout = totalPlatformSeconds > 0
      ? (show.total_seconds / totalPlatformSeconds) * revenue.royalty_pool
      : 0;
    return {
      ...show,
      payout: showPayout,
      episodes: show.episodes.map((ep) => ({
        ...ep,
        payout: show.total_seconds > 0
          ? (ep.total_seconds / show.total_seconds) * showPayout
          : 0,
      })),
    };
  });

  // Fetch active subscriber count from Stripe
  let activeSubscribers = 0;
  try {
    const stripe = getStripe();
    let hasMoreSubs = true;
    let subStartingAfter: string | undefined;
    while (hasMoreSubs) {
      const params: Stripe.SubscriptionListParams = {
        status: "active",
        limit: 100,
      };
      if (subStartingAfter) params.starting_after = subStartingAfter;
      const subs = await stripe.subscriptions.list(params);
      activeSubscribers += subs.data.length;
      hasMoreSubs = subs.has_more;
      if (subs.data.length > 0) {
        subStartingAfter = subs.data[subs.data.length - 1].id;
      }
    }
  } catch (e) {
    console.error("Stripe subscriber count error:", e);
  }

  return NextResponse.json({
    audiobooks: audiobooksWithPayout,
    podcasts: podcastsWithPayout,
    periods: allPeriods,
    revenue,
    active_subscribers: activeSubscribers,
  });
}
