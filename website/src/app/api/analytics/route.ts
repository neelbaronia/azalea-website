import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const ANALYTICS_API_SECRET = process.env.ANALYTICS_API_SECRET;

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

type PeriodType = "daily" | "weekly" | "monthly";

interface TimeSeriesPoint {
  period_start: string;
  label: string;
  value: number;
}

interface ActivitySeriesPoint {
  period_start: string;
  label: string;
  unique_listeners: number;
  total_seconds: number;
  users: {
    device_id: string;
    label: string;
    total_seconds: number;
  }[];
}

interface SessionRow {
  started_at: string;
  seconds_listened: number;
  device_id: string;
  user_id: string | null;
}

interface DetailedSessionRow extends SessionRow {
  source: "audiobook" | "podcast";
}

interface ResolvedListenerIdentity {
  key: string;
  device_id: string;
  user_id: string | null;
}

function getListenerKey(session: Pick<SessionRow, "device_id" | "user_id">): string {
  return session.user_id ?? `device:${session.device_id}`;
}

function shiftPeriodStart(periodStart: string, period: PeriodType, direction: number): string {
  const date = new Date(`${periodStart}T00:00:00Z`);
  if (period === "daily") {
    date.setUTCDate(date.getUTCDate() + direction);
  } else if (period === "weekly") {
    date.setUTCDate(date.getUTCDate() + (7 * direction));
  } else {
    date.setUTCMonth(date.getUTCMonth() + direction);
  }
  return getPeriodStart(date, period);
}

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

function formatShortPeriodLabel(periodStart: string, period: PeriodType): string {
  const date = new Date(`${periodStart}T00:00:00Z`);
  if (period === "daily") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  }
  if (period === "weekly") {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  }
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" });
}

function buildTrailingPeriods(period: PeriodType, count: number, endDate: Date): string[] {
  const normalized = new Date(endDate);
  const currentStart = getPeriodStart(normalized, period);
  const periods: string[] = [];

  for (let index = count - 1; index >= 0; index -= 1) {
    periods.push(shiftPeriodStart(currentStart, period, -index));
  }

  return periods;
}

function getTomorrowStartUtcIso(from: Date): string {
  const tomorrow = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate() + 1));
  return tomorrow.toISOString();
}

export async function GET(req: NextRequest) {
  const providedSecret = req.headers.get("x-analytics-secret");
  if (!ANALYTICS_API_SECRET) {
    return NextResponse.json({ error: "Analytics secret not configured" }, { status: 500 });
  }
  if (!providedSecret || providedSecret !== ANALYTICS_API_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const period = (req.nextUrl.searchParams.get("period") || "daily") as PeriodType;
  const periodStart = req.nextUrl.searchParams.get("period_start");

  if (!["daily", "weekly", "monthly"].includes(period)) {
    return NextResponse.json({ error: "Invalid period" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const now = new Date();
  const trailingDailyPeriods = buildTrailingPeriods("daily", 30, now);
  const trailingWeeklyPeriods = buildTrailingPeriods("weekly", 12, now);
  const trailingMonthlyPeriods = buildTrailingPeriods("monthly", 12, now);
  const periodOptions = period === "daily"
    ? trailingDailyPeriods
    : period === "weekly"
      ? trailingWeeklyPeriods
      : trailingMonthlyPeriods;
  const allPeriods = [...periodOptions].reverse();
  const targetPeriod = periodStart && allPeriods.includes(periodStart) ? periodStart : allPeriods[0];
  const previousPeriod = shiftPeriodStart(targetPeriod, period, -1);
  const analyticsWindowStart = trailingMonthlyPeriods[0];
  const analyticsWindowEnd = getTomorrowStartUtcIso(now);

  const LIBRARY_URL = "https://pub-ee342152cf1149298fc3cb54a286f268.r2.dev/library.json";

  const [audiobookRes, podcastRes, showsRes, profilesRes, libraryRes] = await Promise.all([
    supabase
      .from("listening_sessions")
      .select("audiobook_id, audiobook_title, audiobook_author, seconds_listened, started_at, device_id, user_id")
      .gte("started_at", analyticsWindowStart)
      .lt("started_at", analyticsWindowEnd),
    supabase
      .from("podcast_listening_sessions")
      .select("episode_id, episode_title, show_id, show_title, show_author, seconds_listened, started_at, device_id, user_id")
      .gte("started_at", analyticsWindowStart)
      .lt("started_at", analyticsWindowEnd),
    supabase
      .from("shows")
      .select("id, image_url"),
    supabase
      .from("profiles")
      .select("created_at")
      .gte("created_at", trailingDailyPeriods[0]),
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

  // Aggregate audiobooks by period (only include titles that exist in library.json)
  const audiobookMap = new Map<string, { id: string; title: string; author: string; image_url: string | null; total_seconds: number; listeners: Set<string> }>();
  for (const s of audiobookRes.data ?? []) {
    if (!knownAudiobookTitles.has(s.audiobook_title)) continue;
    const ps = getPeriodStart(new Date(s.started_at), period);
    const listenerKey = getListenerKey(s);
    const key = `${ps}|${s.audiobook_id}`;
    const existing = audiobookMap.get(key);
    if (existing) {
      existing.total_seconds += s.seconds_listened;
      existing.listeners.add(listenerKey);
    } else {
      audiobookMap.set(key, {
        id: s.audiobook_id,
        title: s.audiobook_title,
        author: s.audiobook_author,
        image_url: audiobookImageMap.get(s.audiobook_title) ?? null,
        total_seconds: s.seconds_listened,
        listeners: new Set([listenerKey]),
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
    const listenerKey = getListenerKey(s);
    const showKey = `${ps}|${s.show_id}`;
    const existing = showMap.get(showKey);
    if (existing) {
      existing.total_seconds += s.seconds_listened;
      existing.listeners.add(listenerKey);
      const ep = existing.episodes.get(s.episode_id);
      if (ep) {
        ep.total_seconds += s.seconds_listened;
        ep.listeners.add(listenerKey);
      } else {
        existing.episodes.set(s.episode_id, {
          episode_id: s.episode_id,
          episode_title: s.episode_title,
          total_seconds: s.seconds_listened,
          listeners: new Set([listenerKey]),
        });
      }
    } else {
      const episodes = new Map();
      episodes.set(s.episode_id, {
        episode_id: s.episode_id,
        episode_title: s.episode_title,
        total_seconds: s.seconds_listened,
        listeners: new Set([listenerKey]),
      });
      showMap.set(showKey, {
        show_id: s.show_id,
        show_title: s.show_title,
        show_author: s.show_author,
        image_url: showImageMap.get(s.show_id) ?? null,
        total_seconds: s.seconds_listened,
        listeners: new Set([listenerKey]),
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

  const combinedSessions: SessionRow[] = [
    ...(audiobookRes.data ?? []).map((s) => ({
      started_at: s.started_at,
      seconds_listened: s.seconds_listened,
      device_id: s.device_id,
      user_id: s.user_id,
    })),
    ...(podcastRes.data ?? []).map((s) => ({
      started_at: s.started_at,
      seconds_listened: s.seconds_listened,
      device_id: s.device_id,
      user_id: s.user_id,
    })),
  ];
  const detailedSessions: DetailedSessionRow[] = [
    ...(audiobookRes.data ?? []).map((s) => ({
      started_at: s.started_at,
      seconds_listened: s.seconds_listened,
      device_id: s.device_id,
      user_id: s.user_id,
      source: "audiobook" as const,
    })),
    ...(podcastRes.data ?? []).map((s) => ({
      started_at: s.started_at,
      seconds_listened: s.seconds_listened,
      device_id: s.device_id,
      user_id: s.user_id,
      source: "podcast" as const,
    })),
  ];

  const oneDayAgo = now.getTime() - (24 * 60 * 60 * 1000);
  const sevenDaysAgo = now.getTime() - (7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = now.getTime() - (30 * 24 * 60 * 60 * 1000);

  const dau = new Set<string>();
  const wau = new Set<string>();
  const mau = new Set<string>();
  const allTimeListeners = new Set<string>();
  const firstSeenByListener = new Map<string, string>();

  for (const session of combinedSessions) {
    const listenerKey = getListenerKey(session);
    allTimeListeners.add(listenerKey);
    const ts = new Date(session.started_at).getTime();
    if (ts >= oneDayAgo) dau.add(listenerKey);
    if (ts >= sevenDaysAgo) wau.add(listenerKey);
    if (ts >= thirtyDaysAgo) mau.add(listenerKey);

    const existing = firstSeenByListener.get(listenerKey);
    if (!existing || session.started_at < existing) {
      firstSeenByListener.set(listenerKey, session.started_at);
    }
  }

  const signupsByDay = new Map<string, number>();
  for (const profile of profilesRes.data ?? []) {
    const dayStart = getPeriodStart(new Date(profile.created_at), "daily");
    signupsByDay.set(dayStart, (signupsByDay.get(dayStart) ?? 0) + 1);
  }

  const activityBuckets = {
    daily: new Map<string, { listeners: Set<string>; listenerTotals: Map<string, ResolvedListenerIdentity & { total_seconds: number }>; total_seconds: number }>(),
    weekly: new Map<string, { listeners: Set<string>; listenerTotals: Map<string, ResolvedListenerIdentity & { total_seconds: number }>; total_seconds: number }>(),
    monthly: new Map<string, { listeners: Set<string>; listenerTotals: Map<string, ResolvedListenerIdentity & { total_seconds: number }>; total_seconds: number }>(),
  } satisfies Record<PeriodType, Map<string, { listeners: Set<string>; listenerTotals: Map<string, ResolvedListenerIdentity & { total_seconds: number }>; total_seconds: number }>>;

  for (const session of combinedSessions) {
    for (const bucketPeriod of ["daily", "weekly", "monthly"] as PeriodType[]) {
      const bucketStart = getPeriodStart(new Date(session.started_at), bucketPeriod);
      const listenerKey = getListenerKey(session);
      const bucket = activityBuckets[bucketPeriod].get(bucketStart) ?? {
        listeners: new Set<string>(),
        listenerTotals: new Map<string, ResolvedListenerIdentity & { total_seconds: number }>(),
        total_seconds: 0,
      };
      bucket.listeners.add(listenerKey);
      const existing = bucket.listenerTotals.get(listenerKey);
      if (existing) {
        existing.total_seconds += session.seconds_listened;
      } else {
        bucket.listenerTotals.set(listenerKey, {
          key: listenerKey,
          device_id: session.device_id,
          user_id: session.user_id,
          total_seconds: session.seconds_listened,
        });
      }
      bucket.total_seconds += session.seconds_listened;
      activityBuckets[bucketPeriod].set(bucketStart, bucket);
    }
  }

  function buildActivitySeries(chartPeriod: PeriodType, count: number, labelForListener: (listener: Pick<ResolvedListenerIdentity, "device_id" | "user_id">) => string): ActivitySeriesPoint[] {
    return buildTrailingPeriods(chartPeriod, count, now).map((bucketStart) => {
      const bucket = activityBuckets[chartPeriod].get(bucketStart);
      const rankedUsers = bucket
        ? [...bucket.listenerTotals.values()]
            .sort((a, b) => b.total_seconds - a.total_seconds)
            .map((listener) => ({
              device_id: listener.device_id,
              label: labelForListener(listener),
              total_seconds: listener.total_seconds,
            }))
        : [];

      const primaryUsers = rankedUsers.slice(0, 6);
      const otherSeconds = rankedUsers.slice(6).reduce((sum, user) => sum + user.total_seconds, 0);

      return {
        period_start: bucketStart,
        label: formatShortPeriodLabel(bucketStart, chartPeriod),
        unique_listeners: bucket?.listeners.size ?? 0,
        total_seconds: bucket?.total_seconds ?? 0,
        users: otherSeconds > 0
          ? [
              ...primaryUsers,
              { device_id: "other", label: "Other", total_seconds: otherSeconds },
            ]
          : primaryUsers,
      };
    });
  }

  const signupsSeries: TimeSeriesPoint[] = trailingDailyPeriods.map((bucketStart) => ({
    period_start: bucketStart,
    label: formatShortPeriodLabel(bucketStart, "daily"),
    value: signupsByDay.get(bucketStart) ?? 0,
  }));

  const currentPeriodSessions = targetPeriod
    ? combinedSessions.filter((s) => getPeriodStart(new Date(s.started_at), period) === targetPeriod)
    : [];
  const currentPeriodDetailedSessions = targetPeriod
    ? detailedSessions.filter((s) => getPeriodStart(new Date(s.started_at), period) === targetPeriod)
    : [];
  const currentPeriodListeners = new Set(currentPeriodSessions.map((s) => getListenerKey(s)));

  const currentListenerDeviceIds = [...new Set(currentPeriodSessions.map((session) => session.device_id))];
  const currentListenerUserIds = [...new Set(
    currentPeriodSessions
      .map((session) => session.user_id)
      .filter((value): value is string => Boolean(value))
  )];

  if (currentListenerDeviceIds.length > 0 || currentListenerUserIds.length > 0) {
    const emptyResult = Promise.resolve({ data: [] as SessionRow[], error: null });
    const [audioByDeviceRes, podcastByDeviceRes, audioByUserRes, podcastByUserRes] = await Promise.all([
      currentListenerDeviceIds.length > 0
        ? supabase
            .from("listening_sessions")
            .select("started_at, seconds_listened, device_id, user_id")
            .in("device_id", currentListenerDeviceIds)
        : emptyResult,
      currentListenerDeviceIds.length > 0
        ? supabase
            .from("podcast_listening_sessions")
            .select("started_at, seconds_listened, device_id, user_id")
            .in("device_id", currentListenerDeviceIds)
        : emptyResult,
      currentListenerUserIds.length > 0
        ? supabase
            .from("listening_sessions")
            .select("started_at, seconds_listened, device_id, user_id")
            .in("user_id", currentListenerUserIds)
        : emptyResult,
      currentListenerUserIds.length > 0
        ? supabase
            .from("podcast_listening_sessions")
            .select("started_at, seconds_listened, device_id, user_id")
            .in("user_id", currentListenerUserIds)
        : emptyResult,
    ]);

    for (const result of [audioByDeviceRes, podcastByDeviceRes, audioByUserRes, podcastByUserRes]) {
      if (result.error) {
        console.error("Analytics first-seen lookup error:", result.error);
        continue;
      }
      for (const session of result.data ?? []) {
        const listenerKey = getListenerKey(session);
        const existing = firstSeenByListener.get(listenerKey);
        if (!existing || session.started_at < existing) {
          firstSeenByListener.set(listenerKey, session.started_at);
        }
      }
    }
  }

  const newListeners = new Set(
    [...currentPeriodListeners].filter((listenerKey) => {
      const firstSeen = firstSeenByListener.get(listenerKey);
      return firstSeen ? getPeriodStart(new Date(firstSeen), period) === targetPeriod : false;
    })
  );
  const returningListeners = currentPeriodListeners.size - newListeners.size;
  const totalSessionCount = currentPeriodSessions.length;

  const visibleChartUserIds = new Set<string>();
  for (const bucketMap of Object.values(activityBuckets)) {
    for (const bucket of bucketMap.values()) {
      const topListeners = [...bucket.listenerTotals.values()]
        .sort((a, b) => b.total_seconds - a.total_seconds)
        .slice(0, 6);
      for (const listener of topListeners) {
        if (listener.user_id) visibleChartUserIds.add(listener.user_id);
      }
    }
  }

  const resolvedUserIds = [...new Set([
    ...currentListenerUserIds,
    ...visibleChartUserIds,
  ])];
  const fullNameByUserId = new Map<string, string | null>();
  const emailByUserId = new Map<string, string | null>();

  if (resolvedUserIds.length > 0) {
    const { data: listenerProfiles, error: listenerProfilesError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", resolvedUserIds);

    if (listenerProfilesError) {
      console.error("Analytics profile lookup error:", listenerProfilesError);
    } else {
      for (const profile of listenerProfiles ?? []) {
        fullNameByUserId.set(profile.id, profile.full_name ?? null);
      }
    }

    await Promise.all(
      resolvedUserIds.map(async (userId) => {
        const { data, error } = await supabase.auth.admin.getUserById(userId);
        if (!error) {
          emailByUserId.set(userId, data.user?.email ?? null);
        }
      })
    );
  }

  function getListenerLabel(listener: Pick<ResolvedListenerIdentity, "device_id" | "user_id">): string {
    const fullName = listener.user_id ? (fullNameByUserId.get(listener.user_id) ?? null) : null;
    const email = listener.user_id ? (emailByUserId.get(listener.user_id) ?? null) : null;
    return fullName ?? email ?? `Listener ${listener.device_id.slice(0, 6)}`;
  }

  const activeUsersDailySeries = buildActivitySeries("daily", 30, getListenerLabel);
  const activeUsersWeeklySeries = buildActivitySeries("weekly", 12, getListenerLabel);
  const activeUsersMonthlySeries = buildActivitySeries("monthly", 12, getListenerLabel);

  const activeListenerMap = new Map<
    string,
    {
      key: string;
      device_id: string;
      user_id: string | null;
      total_seconds: number;
      audiobook_seconds: number;
      podcast_seconds: number;
      session_count: number;
      last_started_at: string;
    }
  >();

  for (const session of currentPeriodDetailedSessions) {
    const listenerKey = getListenerKey(session);
    const existing = activeListenerMap.get(listenerKey);
    if (existing) {
      existing.total_seconds += session.seconds_listened;
      existing.session_count += 1;
      if (session.source === "audiobook") {
        existing.audiobook_seconds += session.seconds_listened;
      } else {
        existing.podcast_seconds += session.seconds_listened;
      }
      if (session.started_at > existing.last_started_at) {
        existing.last_started_at = session.started_at;
      }
    } else {
      activeListenerMap.set(listenerKey, {
        key: listenerKey,
        device_id: session.device_id,
        user_id: session.user_id,
        total_seconds: session.seconds_listened,
        audiobook_seconds: session.source === "audiobook" ? session.seconds_listened : 0,
        podcast_seconds: session.source === "podcast" ? session.seconds_listened : 0,
        session_count: 1,
        last_started_at: session.started_at,
      });
    }
  }

  const previousPeriodListeners = previousPeriod
    ? new Set(
        combinedSessions
          .filter((s) => getPeriodStart(new Date(s.started_at), period) === previousPeriod)
          .map((s) => getListenerKey(s))
      )
    : new Set<string>();
  const retainedListeners = new Set(
    [...currentPeriodListeners].filter((listenerKey) => previousPeriodListeners.has(listenerKey))
  );
  const retentionRate =
    previousPeriodListeners.size > 0 ? retainedListeners.size / previousPeriodListeners.size : null;

  const activeListeners = [...activeListenerMap.values()]
    .map((listener) => {
      const isNew = newListeners.has(listener.key);
      const isRetained = retainedListeners.has(listener.key);
      const fullName = listener.user_id ? (fullNameByUserId.get(listener.user_id) ?? null) : null;
      const email = listener.user_id ? (emailByUserId.get(listener.user_id) ?? null) : null;
      return {
        device_id: listener.device_id,
        user_id: listener.user_id,
        full_name: fullName,
        email,
        label: getListenerLabel(listener),
        total_seconds: listener.total_seconds,
        audiobook_seconds: listener.audiobook_seconds,
        podcast_seconds: listener.podcast_seconds,
        session_count: listener.session_count,
        last_started_at: listener.last_started_at,
        is_new: isNew,
        is_returning: !isNew,
        is_retained: isRetained,
      };
    })
    .sort((a, b) => b.total_seconds - a.total_seconds);

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

  const totalPlatformSeconds =
    filteredAudiobooks.reduce((s, a) => s + a.total_seconds, 0) +
    filteredPodcasts.reduce((s, p) => s + p.total_seconds, 0);
  const averageListenSecondsPerListener =
    currentPeriodListeners.size > 0 ? totalPlatformSeconds / currentPeriodListeners.size : 0;

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
    admin: {
      dau: dau.size,
      wau: wau.size,
      mau: mau.size,
      all_time_listeners: allTimeListeners.size,
      listeners_in_period: currentPeriodListeners.size,
      new_listeners_in_period: newListeners.size,
      returning_listeners_in_period: returningListeners,
      retained_listeners_from_previous_period: retainedListeners.size,
      previous_period_listeners: previousPeriodListeners.size,
      retention_rate: retentionRate,
      total_sessions_in_period: totalSessionCount,
      average_listen_seconds_per_listener: averageListenSecondsPerListener,
      previous_period: previousPeriod,
      target_period: targetPeriod,
      active_listeners: activeListeners,
    },
    timeseries: {
      signups_daily: signupsSeries,
      active_users_daily: activeUsersDailySeries,
      active_users_weekly: activeUsersWeeklySeries,
      active_users_monthly: activeUsersMonthlySeries,
    },
  });
}
