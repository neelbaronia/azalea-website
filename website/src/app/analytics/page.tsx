"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type PeriodType = "daily" | "weekly" | "monthly";
type ContentTab = "podcasts" | "audiobooks";

interface AudiobookRow {
  id: string;
  title: string;
  author: string;
  image_url: string | null;
  total_seconds: number;
  unique_listeners: number;
  payout: number;
}

interface EpisodeRow {
  episode_id: string;
  episode_title: string;
  total_seconds: number;
  unique_listeners: number;
  payout: number;
}

interface PodcastShow {
  show_id: string;
  show_title: string;
  show_author: string;
  image_url: string | null;
  total_seconds: number;
  unique_listeners: number;
  payout: number;
  episodes: EpisodeRow[];
}

interface Revenue {
  gross: number;
  royalty_pool: number;
  royalty_rate: number;
}

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

interface AnalyticsTimeSeries {
  signups_daily: TimeSeriesPoint[];
  active_users_daily: ActivitySeriesPoint[];
  active_users_weekly: ActivitySeriesPoint[];
  active_users_monthly: ActivitySeriesPoint[];
}

interface PersonalUsageContentRow {
  content_type: string;
  content_id: string;
  label: string;
  total_seconds: number;
  event_count: number;
  period_start: string;
}

interface PersonalUsage {
  user_id: string;
  period_type: PeriodType;
  target_period: string;
  total_seconds: number;
  event_count: number;
  content: PersonalUsageContentRow[];
  timeseries: TimeSeriesPoint[];
}

type ActivityChartMode = "count" | "time";
type ActivitySeriesPeriod = "daily" | "weekly" | "monthly";

interface AdminMetrics {
  dau: number;
  wau: number;
  mau: number;
  all_time_listeners: number;
  listeners_in_period: number;
  new_listeners_in_period: number;
  returning_listeners_in_period: number;
  retained_listeners_from_previous_period: number;
  previous_period_listeners: number;
  retention_rate: number | null;
  total_sessions_in_period: number;
  average_listen_seconds_per_listener: number;
  previous_period: string | null;
  target_period: string | null;
  active_listeners: {
    device_id: string;
    email: string | null;
    label: string;
    total_seconds: number;
    audiobook_seconds: number;
    podcast_seconds: number;
    session_count: number;
    last_started_at: string;
    top_content: {
      type: "audiobook" | "podcast";
      title: string;
      parent_title: string | null;
      total_seconds: number;
      session_count: number;
    }[];
    is_new: boolean;
    is_returning: boolean;
    is_retained: boolean;
  }[];
}

function emptyTimeSeries(): AnalyticsTimeSeries {
  return {
    signups_daily: [],
    active_users_daily: [],
    active_users_weekly: [],
    active_users_monthly: [],
  };
}

function emptyPersonalUsage(): PersonalUsage | null {
  return null;
}

function isPodcastContentType(contentType: string): boolean {
  return contentType.toLowerCase().includes("podcast");
}

function isAudiobookContentType(contentType: string): boolean {
  return contentType.toLowerCase().includes("audiobook");
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function formatPeriodLabel(periodStart: string, period: PeriodType): string {
  const date = new Date(periodStart + "T00:00:00");
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  if (period === "daily") return date.toLocaleDateString("en-US", opts);
  if (period === "weekly") return `Week of ${date.toLocaleDateString("en-US", opts)}`;
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function MiniBarChart({
  title,
  subtitle,
  data,
  tone = "black",
}: {
  title: string;
  subtitle: string;
  data: TimeSeriesPoint[];
  tone?: "black" | "gray";
}) {
  const maxValue = data.reduce((max, point) => Math.max(max, point.value), 0);
  const barColor = tone === "black" ? "bg-black" : "bg-gray-500";

  return (
    <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 min-w-[280px] lg:min-w-[300px] xl:min-w-[320px] shrink-0">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-medium text-black">{title}</h3>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xl font-semibold tabular-nums">
            {data.length > 0 ? data[data.length - 1].value : 0}
          </div>
          <div className="text-[11px] text-gray-400">latest</div>
        </div>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400">No data yet.</p>
      ) : (
        <>
          <div className="flex items-stretch gap-1 h-36">
            {data.map((point) => {
              const height = maxValue > 0 ? Math.max((point.value / maxValue) * 100, point.value > 0 ? 6 : 2) : 2;
              return (
                <div
                  key={point.period_start}
                  className="flex-1 h-full flex flex-col justify-end items-center group min-w-0"
                  title={`${point.label}: ${point.value}`}
                >
                  <div className="text-[10px] text-gray-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {point.value}
                  </div>
                  <div className="w-full h-full flex items-end">
                    <div
                      className={`w-full rounded-t-[4px] ${barColor}`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-3 mt-3 text-[11px] text-gray-400">
            <span>{data[0]?.label}</span>
            <span>{data[data.length - 1]?.label}</span>
          </div>
        </>
      )}
    </div>
  );
}

const STACK_COLORS = [
  "#2563eb",
  "#dc2626",
  "#059669",
  "#d97706",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#65a30d",
  "#ea580c",
  "#4f46e5",
];

function StackedActivityChart({
  title,
  subtitle,
  data,
  mode,
  onModeChange,
  headerControls,
  className = "",
}: {
  title: string;
  subtitle: string;
  data: ActivitySeriesPoint[];
  mode: ActivityChartMode;
  onModeChange: (mode: ActivityChartMode) => void;
  headerControls?: ReactNode;
  className?: string;
}) {
  const maxSeconds = data.reduce((max, point) => Math.max(max, point.total_seconds), 0);
  const maxCount = data.reduce((max, point) => Math.max(max, point.unique_listeners), 0);
  const latest = data.length > 0 ? data[data.length - 1] : null;
  const legendSource = [...data].reverse().find((point) => point.users.length > 0) ?? null;
  const legendUsers = legendSource?.users ?? [];
  const colorByUserId = new Map<string, string>();

  legendUsers.forEach((user, index) => {
    colorByUserId.set(
      user.device_id,
      user.device_id === "other" ? "#9ca3af" : STACK_COLORS[index % STACK_COLORS.length]
    );
  });

  function colorForUser(deviceId: string): string {
    return colorByUserId.get(deviceId) ?? "#9ca3af";
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg px-5 py-4 min-w-[280px] lg:min-w-[300px] xl:min-w-[320px] shrink-0 ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-medium text-black">{title}</h3>
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        </div>
        {headerControls && <div className="shrink-0">{headerControls}</div>}
        <div className="text-right shrink-0">
          <div className="text-xl font-semibold tabular-nums">{latest?.unique_listeners ?? 0}</div>
          <div className="text-[11px] text-gray-400">unique</div>
          <div className="text-sm font-medium tabular-nums mt-2">{formatDuration(latest?.total_seconds ?? 0)}</div>
          <div className="text-[11px] text-gray-400">listen time</div>
          <div className="mt-3 inline-flex rounded-md border border-gray-200 p-0.5 bg-gray-50">
            <button
              type="button"
              onClick={() => onModeChange("count")}
              className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                mode === "count" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
              }`}
            >
              Count
            </button>
            <button
              type="button"
              onClick={() => onModeChange("time")}
              className={`px-2.5 py-1 text-[11px] rounded transition-colors ${
                mode === "time" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
              }`}
            >
              Time
            </button>
          </div>
        </div>
      </div>
      {data.length === 0 ? (
        <p className="text-sm text-gray-400">No data yet.</p>
      ) : (
        <>
          <div className="flex items-stretch gap-1 h-40">
            {data.map((point) => {
              const barHeight = mode === "time"
                ? (maxSeconds > 0
                    ? Math.max((point.total_seconds / maxSeconds) * 100, point.total_seconds > 0 ? 8 : 2)
                    : 2)
                : (maxCount > 0
                    ? Math.max((point.unique_listeners / maxCount) * 100, point.unique_listeners > 0 ? 8 : 2)
                    : 2);
              const titleText = [
                `${point.label}`,
                `${point.unique_listeners} unique users`,
                `${formatDuration(point.total_seconds)} total listened`,
                ...point.users.map((user) => `${user.label}: ${formatDuration(user.total_seconds)}`),
              ].join("\n");

              return (
                <div
                  key={point.period_start}
                  className="flex-1 h-full flex flex-col justify-end items-center group min-w-0"
                  title={titleText}
                >
                  <div className="text-[10px] text-gray-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {mode === "count" ? point.unique_listeners : formatDuration(point.total_seconds)}
                  </div>
                  <div className="w-full h-full flex items-end">
                    {mode === "count" ? (
                      <div
                        className="w-full rounded-t-[4px] bg-[#6d48e5]"
                        style={{ height: `${barHeight}%` }}
                      />
                    ) : (
                      <div
                        className="w-full rounded-t-[4px] bg-gray-100 overflow-hidden flex flex-col-reverse"
                        style={{ height: `${barHeight}%` }}
                      >
                        {point.users.map((user) => (
                          <div
                            key={`${point.period_start}-${user.device_id}`}
                            style={{
                              height: point.total_seconds > 0 ? `${(user.total_seconds / point.total_seconds) * 100}%` : "0%",
                              backgroundColor: colorForUser(user.device_id),
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between gap-3 mt-3 text-[11px] text-gray-400">
            <span>{data[0]?.label}</span>
            <span>{data[data.length - 1]?.label}</span>
          </div>
          {mode === "time" && legendUsers.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-[11px] text-gray-500">
              {legendUsers.map((user) => (
                <div key={`legend-${user.device_id}`} className="flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: colorForUser(user.device_id) }}
                  />
                  <span>{user.label}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const supabase = createClient();
  const [authed, setAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [siteUserId, setSiteUserId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [period, setPeriod] = useState<PeriodType>("weekly");
  const [tab, setTab] = useState<ContentTab>("podcasts");
  const [audiobooks, setAudiobooks] = useState<AudiobookRow[]>([]);
  const [podcasts, setPodcasts] = useState<PodcastShow[]>([]);
  const [periods, setPeriods] = useState<string[]>([]);
  const [periodIndex, setPeriodIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expandedShows, setExpandedShows] = useState<Set<string>>(new Set());
  const [revenue, setRevenue] = useState<Revenue>({ gross: 0, royalty_pool: 0, royalty_rate: 0.50 });
  const [activeSubscribers, setActiveSubscribers] = useState(0);
  const [timeseries, setTimeseries] = useState<AnalyticsTimeSeries>(emptyTimeSeries());
  const [personal, setPersonal] = useState<PersonalUsage | null>(emptyPersonalUsage());
  const [activeChartMode, setActiveChartMode] = useState<ActivityChartMode>("time");
  const [activeSeriesPeriod, setActiveSeriesPeriod] = useState<ActivitySeriesPeriod>("weekly");
  const [expandedListeners, setExpandedListeners] = useState<Set<string>>(new Set());
  const [admin, setAdmin] = useState<AdminMetrics>({
    dau: 0,
    wau: 0,
    mau: 0,
    all_time_listeners: 0,
    listeners_in_period: 0,
    new_listeners_in_period: 0,
    returning_listeners_in_period: 0,
    retained_listeners_from_previous_period: 0,
    previous_period_listeners: 0,
    retention_rate: null,
    total_sessions_in_period: 0,
    average_listen_seconds_per_listener: 0,
    previous_period: null,
    target_period: null,
    active_listeners: [],
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/analytics/auth", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) return { authed: false };
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        setAuthed(Boolean(json.authed));
        setAuthChecked(true);
      })
      .catch(() => {
        if (cancelled) return;
        setAuthed(false);
        setAuthChecked(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled) return;
      setSiteUserId(user?.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      setSiteUserId(session?.user?.id ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const fetchData = useCallback(async (p: PeriodType, periodStart?: string) => {
    setLoading(true);
    const params = new URLSearchParams({ period: p });
    if (siteUserId) params.set("user_id", siteUserId);
    if (periodStart) params.set("period_start", periodStart);
    try {
      const res = await fetch(`/api/analytics/proxy?${params}`, { cache: "no-store" });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to fetch analytics");
      }
      const json = await res.json();
      setAudiobooks(json.audiobooks ?? []);
      setPodcasts(json.podcasts ?? []);
      if (json.revenue) setRevenue(json.revenue);
      if (json.active_subscribers != null) setActiveSubscribers(json.active_subscribers);
      if (json.admin) setAdmin(json.admin);
      setTimeseries(json.timeseries ?? emptyTimeSeries());
      setPersonal(json.personal ?? emptyPersonalUsage());
      if (json.periods?.length) {
        setPeriods(json.periods);
        if (!periodStart) setPeriodIndex(0);
      }
    } catch {
      setAudiobooks([]);
      setPodcasts([]);
      setTimeseries(emptyTimeSeries());
      setPersonal(emptyPersonalUsage());
      setAdmin({
        dau: 0,
        wau: 0,
        mau: 0,
        all_time_listeners: 0,
        listeners_in_period: 0,
        new_listeners_in_period: 0,
        returning_listeners_in_period: 0,
        retained_listeners_from_previous_period: 0,
        previous_period_listeners: 0,
        retention_rate: null,
        total_sessions_in_period: 0,
        average_listen_seconds_per_listener: 0,
        previous_period: null,
        target_period: null,
        active_listeners: [],
      });
    } finally {
      setLoading(false);
    }
  }, [siteUserId]);

  useEffect(() => {
    if (authed) fetchData(period);
  }, [authed, period, fetchData]);

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordSubmitting(true);
    setPasswordError(false);
    try {
      const res = await fetch("/api/analytics/auth", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ password: passwordInput }),
      });
      if (!res.ok) {
        setPasswordError(true);
        return;
      }
      setAuthed(true);
      setPasswordInput("");
    } catch {
      setPasswordError(true);
    } finally {
      setPasswordSubmitting(false);
    }
  }

  function navigatePeriod(direction: -1 | 1) {
    const newIndex = periodIndex + direction;
    if (newIndex < 0 || newIndex >= periods.length) return;
    setPeriodIndex(newIndex);
    fetchData(period, periods[newIndex]);
  }

  function toggleShow(showId: string) {
    setExpandedShows((prev) => {
      const next = new Set(prev);
      if (next.has(showId)) next.delete(showId);
      else next.add(showId);
      return next;
    });
  }

  function toggleListenerDetails(listenerKey: string) {
    setExpandedListeners((prev) => {
      const next = new Set(prev);
      if (next.has(listenerKey)) next.delete(listenerKey);
      else next.add(listenerKey);
      return next;
    });
  }

  useEffect(() => {
    if (admin.active_listeners.length === 0) {
      setExpandedListeners(new Set());
      return;
    }

    setExpandedListeners((prev) => {
      if (prev.size > 0) return prev;
      const first = admin.active_listeners[0];
      return new Set([`${first.device_id}-${first.last_started_at}`]);
    });
  }, [admin.active_listeners]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbfb] px-4">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbfb] px-4">
        <form onSubmit={handlePasswordSubmit} className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-semibold text-center">Analytics</h1>
          <input
            type="password"
            placeholder="Enter password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
            autoFocus
          />
          {passwordError && (
            <p className="text-red-500 text-sm text-center">Incorrect password</p>
          )}
          <button
            type="submit"
            disabled={passwordSubmitting}
            className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {passwordSubmitting ? "Entering..." : "Enter"}
          </button>
        </form>
      </div>
    );
  }

  const currentData = tab === "podcasts" ? podcasts : audiobooks;
  const totalSeconds = tab === "podcasts"
    ? podcasts.reduce((sum, s) => sum + s.total_seconds, 0)
    : audiobooks.reduce((sum, a) => sum + a.total_seconds, 0);
  const totalPlatformSeconds =
    podcasts.reduce((sum, s) => sum + s.total_seconds, 0) +
    audiobooks.reduce((sum, a) => sum + a.total_seconds, 0);
  const totalPayout = tab === "podcasts"
    ? podcasts.reduce((sum, s) => sum + s.payout, 0)
    : audiobooks.reduce((sum, a) => sum + a.payout, 0);
  const personalPodcastRows = personal?.content.filter((row) => isPodcastContentType(row.content_type)) ?? [];
  const personalAudiobookRows = personal?.content.filter((row) => isAudiobookContentType(row.content_type)) ?? [];
  const usingPersonalContent = Boolean(personal);
  const currentPersonalData = tab === "podcasts" ? personalPodcastRows : personalAudiobookRows;
  const personalTotalSeconds = currentPersonalData.reduce((sum, row) => sum + row.total_seconds, 0);
  const personalTotalEvents = currentPersonalData.reduce((sum, row) => sum + row.event_count, 0);
  const maxActiveListenerSeconds = admin.active_listeners.reduce(
    (max, listener) => Math.max(max, listener.total_seconds),
    0
  );
  const activeSeriesData =
    activeSeriesPeriod === "daily"
      ? timeseries.active_users_daily
      : activeSeriesPeriod === "weekly"
        ? timeseries.active_users_weekly
        : timeseries.active_users_monthly;
  const activeSeriesTitle =
    activeSeriesPeriod === "daily"
      ? "Daily Active Users"
      : activeSeriesPeriod === "weekly"
        ? "Weekly Active Users"
        : "Monthly Active Users";
  const activeSeriesSubtitle =
    activeSeriesPeriod === "daily"
      ? "Unique listeners and total time per day."
      : activeSeriesPeriod === "weekly"
        ? "Unique listeners and total time per week."
        : "Unique listeners and total time per month.";
  const personalTopContent = personal?.content.slice(0, 8) ?? [];

  return (
    <div className="min-h-screen bg-[#fbfbfb] px-4 py-8 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <Link href="/" className="text-sm text-gray-500 hover:text-black transition-colors">
            &larr; Home
          </Link>
        </div>

        {/* Top-level summary */}
        {!loading && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
              <div className="text-xs text-gray-400 mb-1">Active Subscribers</div>
              <div className="text-2xl font-semibold">{activeSubscribers}</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
              <div className="text-xs text-gray-400 mb-1">Total Royalty Pool</div>
              <div className="text-2xl font-semibold">{formatCurrency(revenue.royalty_pool)}</div>
            </div>
          </div>
        )}

        {!loading && (
          personal && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Your Usage</h2>
                <span className="text-xs text-gray-400">
                  {formatPeriodLabel(personal.target_period, personal.period_type)}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-4">
                <MiniBarChart
                  title="Personal Listen Time"
                  subtitle={`Rolled up from listening_time_agg for your ${period === "daily" ? "daily" : period === "weekly" ? "weekly" : "monthly"} periods.`}
                  data={personal.timeseries}
                  tone="gray"
                />
                <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-sm font-medium text-black">Top Content</h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Filtered by your signed-in user id, not the global `user_id=&quot;*&quot;` rows.
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-semibold tabular-nums">{formatDuration(personal.total_seconds)}</div>
                      <div className="text-[11px] text-gray-400">total time</div>
                      <div className="text-sm font-medium tabular-nums mt-2">{personal.event_count}</div>
                      <div className="text-[11px] text-gray-400">events</div>
                    </div>
                  </div>
                  {personalTopContent.length === 0 ? (
                    <p className="text-sm text-gray-400">No personal aggregate rows for this period yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {personalTopContent.map((row) => (
                        <div key={`${row.content_type}:${row.content_id}`} className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-black truncate">{row.label}</div>
                            <div className="text-xs text-gray-400">
                              {row.content_type} • {row.content_id}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-medium tabular-nums">{formatDuration(row.total_seconds)}</div>
                            <div className="text-xs text-gray-400 tabular-nums">{row.event_count} events</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        )}

        {!loading && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Admin Overview</h2>
              <span className="text-xs text-gray-400">
                {admin.target_period ? formatPeriodLabel(admin.target_period, period) : "Current period"}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
                <div className="text-xs text-gray-400 mb-1">DAU</div>
                <div className="text-2xl font-semibold">{admin.dau}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
                <div className="text-xs text-gray-400 mb-1">WAU</div>
                <div className="text-2xl font-semibold">{admin.wau}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
                <div className="text-xs text-gray-400 mb-1">MAU</div>
                <div className="text-2xl font-semibold">{admin.mau}</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
                <div className="text-xs text-gray-400 mb-1">All-Time Listeners</div>
                <div className="text-2xl font-semibold">{admin.all_time_listeners}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
                <div className="text-xs text-gray-400 mb-3">Current Period</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-400">Listeners</div>
                    <div className="text-lg font-semibold">{admin.listeners_in_period}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Sessions</div>
                    <div className="text-lg font-semibold">{admin.total_sessions_in_period}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">New</div>
                    <div className="text-lg font-semibold">{admin.new_listeners_in_period}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Returning</div>
                    <div className="text-lg font-semibold">{admin.returning_listeners_in_period}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg px-5 py-4">
                <div className="text-xs text-gray-400 mb-3">Engagement</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-400">Avg Listen / Listener</div>
                    <div className="text-lg font-semibold">
                      {formatDuration(admin.average_listen_seconds_per_listener)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Retention</div>
                    <div className="text-lg font-semibold">
                      {admin.retention_rate != null ? `${(admin.retention_rate * 100).toFixed(1)}%` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Retained Users</div>
                    <div className="text-lg font-semibold">{admin.retained_listeners_from_previous_period}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Prev Period Base</div>
                    <div className="text-lg font-semibold">{admin.previous_period_listeners}</div>
                  </div>
                </div>
                {admin.previous_period && (
                  <p className="text-xs text-gray-400 mt-3">
                    Retention is measured against {formatPeriodLabel(admin.previous_period, period)}.
                  </p>
                )}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg px-5 py-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-medium text-black">Active Listeners</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Ranked by total listen time for this {period === "daily" ? "day" : period === "weekly" ? "week" : "month"}.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Expand a listener to see the specific titles and episodes they played.
                  </p>
                </div>
                <div className="text-xs text-gray-400">
                  {admin.active_listeners.length} users
                </div>
              </div>
              {admin.active_listeners.length === 0 ? (
                <p className="text-sm text-gray-400">No active listeners in this period yet.</p>
              ) : (
                <div className="space-y-3">
                  {admin.active_listeners.map((listener, index) => {
                    const audiobookWidth = listener.total_seconds > 0
                      ? (listener.audiobook_seconds / listener.total_seconds) * 100
                      : 0;
                    const podcastWidth = listener.total_seconds > 0
                      ? (listener.podcast_seconds / listener.total_seconds) * 100
                      : 0;
                    const rowWidth = maxActiveListenerSeconds > 0
                      ? (listener.total_seconds / maxActiveListenerSeconds) * 100
                      : 0;
                    const listenerKey = `${listener.device_id}-${listener.last_started_at}`;
                    const isExpanded = expandedListeners.has(listenerKey);

                    return (
                      <div key={listenerKey} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-gray-400 tabular-nums">#{index + 1}</span>
                              <span className="font-medium text-sm">{listener.label}</span>
                              {listener.is_new && (
                                <span className="text-[10px] uppercase tracking-[0.12em] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  New
                                </span>
                              )}
                              {listener.is_retained && (
                                <span className="text-[10px] uppercase tracking-[0.12em] text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                                  Retained
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {listener.session_count} sessions
                            </div>
                          </div>
                          <div className="text-right shrink-0 flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => toggleListenerDetails(listenerKey)}
                              className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:text-black hover:border-gray-300 transition-colors mt-0.5"
                            >
                              <span>{isExpanded ? "Hide" : "Show"} listening</span>
                              <span aria-hidden="true">{isExpanded ? "▲" : "▼"}</span>
                            </button>
                            <div>
                              <div className="text-sm font-medium tabular-nums">{formatDuration(listener.total_seconds)}</div>
                              <div className="text-xs text-gray-400">
                                {new Date(listener.last_started_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full overflow-hidden flex"
                            style={{ width: `${rowWidth}%` }}
                          >
                            <div
                              className="h-full bg-black"
                              style={{ width: `${audiobookWidth}%` }}
                            />
                            <div
                              className="h-full bg-gray-400"
                              style={{ width: `${podcastWidth}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 mt-2 text-xs text-gray-400">
                          <span>Audiobooks {formatDuration(listener.audiobook_seconds)}</span>
                          <span>Podcasts {formatDuration(listener.podcast_seconds)}</span>
                        </div>
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                            {listener.top_content.length === 0 ? (
                              <p className="text-xs text-gray-400">No item-level breakdown available.</p>
                            ) : (
                              listener.top_content.map((item) => (
                                <div key={`${listenerKey}-${item.type}-${item.title}`} className="flex items-start justify-between gap-4">
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium text-black truncate">{item.title}</div>
                                    <div className="text-xs text-gray-400 truncate">
                                      {item.type === "podcast" ? "Podcast" : "Audiobook"}
                                      {item.parent_title ? ` • ${item.parent_title}` : ""}
                                    </div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <div className="text-sm font-medium tabular-nums">{formatDuration(item.total_seconds)}</div>
                                    <div className="text-xs text-gray-400 tabular-nums">{item.session_count} sessions</div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)] gap-4 mt-4 items-start">
              <MiniBarChart
                title="New Signups"
                subtitle="Profiles created per day over the last 30 days."
                data={timeseries.signups_daily}
              />
              <StackedActivityChart
                title={activeSeriesTitle}
                subtitle={activeSeriesSubtitle}
                data={activeSeriesData}
                mode={activeChartMode}
                onModeChange={setActiveChartMode}
                className="min-w-0"
                headerControls={
                  <div className="inline-flex rounded-md border border-gray-200 p-0.5 bg-gray-50">
                    {(["daily", "weekly", "monthly"] as ActivitySeriesPeriod[]).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setActiveSeriesPeriod(value)}
                        className={`px-3 py-1.5 text-xs rounded transition-colors ${
                          activeSeriesPeriod === value ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
                        }`}
                      >
                        {value === "daily" ? "Daily" : value === "weekly" ? "Weekly" : "Monthly"}
                      </button>
                    ))}
                  </div>
                }
              />
            </div>
          </div>
        )}

        {/* Content type tabs */}
        <div className="flex gap-0 mb-6 border-b border-gray-200">
          {(["podcasts", "audiobooks"] as ContentTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-base font-medium border-b-2 transition-colors ${
                tab === t
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {t === "podcasts" ? "Podcasts" : "Audiobooks"}
            </button>
          ))}
        </div>

        {/* Period toggle */}
        <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
          {(["daily", "weekly", "monthly"] as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => { setPeriod(p); setPeriodIndex(0); }}
              className={`px-4 py-2 text-sm rounded-md transition-colors ${
                period === p ? "bg-white text-black shadow-sm" : "text-gray-500 hover:text-black"
              }`}
            >
              {p === "daily" ? "Day" : p === "weekly" ? "Week" : "Month"}
            </button>
          ))}
        </div>


        {/* Period navigation */}
        {periods.length > 0 && (
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigatePeriod(1)}
              disabled={periodIndex >= periods.length - 1}
              className="px-2 py-1 text-gray-400 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              &larr;
            </button>
            <span className="text-sm font-medium min-w-[180px] text-center">
              {formatPeriodLabel(periods[periodIndex], period)}
            </span>
            <button
              onClick={() => navigatePeriod(-1)}
              disabled={periodIndex <= 0}
              className="px-2 py-1 text-gray-400 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              &rarr;
            </button>
          </div>
        )}

        {/* Data */}
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : usingPersonalContent ? currentPersonalData.length === 0 ? (
          <p className="text-gray-400 text-sm">No personal listening data for this period.</p>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="grid grid-cols-[minmax(0,1fr)_120px_96px] gap-4 px-4 py-3 text-sm text-gray-500 bg-gray-50">
              <span className="font-medium">{tab === "podcasts" ? "Podcast" : "Audiobook"}</span>
              <span className="font-medium text-right">Time</span>
              <span className="font-medium text-right">Events</span>
            </div>
            <div>
              {currentPersonalData.map((row) => (
                <div
                  key={`${row.content_type}:${row.content_id}`}
                  className="grid grid-cols-[minmax(0,1fr)_120px_96px] gap-4 px-4 py-3 text-sm border-t border-gray-100 first:border-t-0"
                >
                  <div className="min-w-0">
                    <div className="font-medium truncate">{row.label}</div>
                    <div className="text-xs text-gray-400 truncate">{row.content_id}</div>
                  </div>
                  <div className="text-right tabular-nums whitespace-nowrap">{formatDuration(row.total_seconds)}</div>
                  <div className="text-right tabular-nums">{row.event_count}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_120px_96px] gap-4 px-4 py-3 text-sm font-medium border-t border-gray-200 bg-gray-50">
              <span>Total</span>
              <span className="text-right tabular-nums whitespace-nowrap">{formatDuration(personalTotalSeconds)}</span>
              <span className="text-right tabular-nums">{personalTotalEvents}</span>
            </div>
          </div>
        ) : currentData.length === 0 ? (
          <p className="text-gray-400 text-sm">No data for this period.</p>
        ) : tab === "audiobooks" ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium text-right">Time</th>
                  <th className="px-4 py-3 font-medium text-right">Listeners</th>
                  <th className="px-4 py-3 font-medium text-right">Est. Payout</th>
                  <th className="px-4 py-3 font-medium text-right">% Pool</th>
                </tr>
              </thead>
              <tbody>
                {audiobooks.map((book) => (
                  <tr key={book.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {book.image_url ? (
                          <img src={book.image_url} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-100 shrink-0" />
                        )}
                        <div>
                          <div className="font-medium">{book.title}</div>
                          <div className="text-xs text-gray-400">{book.author}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">{formatDuration(book.total_seconds)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{book.unique_listeners}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(book.payout)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-gray-400">{totalPlatformSeconds > 0 ? ((book.total_seconds / totalPlatformSeconds) * 100).toFixed(1) + "%" : "—"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 bg-gray-50 font-medium">
                  <td className="px-4 py-3">Total</td>
                  <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">{formatDuration(totalSeconds)}</td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatCurrency(totalPayout)}</td>
                  <td className="px-4 py-3"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-500">
              <span className="font-medium">Show</span>
              <div className="flex items-center gap-6 shrink-0 ml-4">
                <span className="font-medium">Time</span>
                <span className="font-medium w-8 text-right">Listeners</span>
                <span className="font-medium w-16 text-right">Payout</span>
                <span className="font-medium w-12 text-right">% Pool</span>
                <span className="w-3" />
              </div>
            </div>
            {podcasts.map((show) => (
              <div key={show.show_id} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleShow(show.show_id)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {show.image_url ? (
                      <img src={show.image_url} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-sm">{show.show_title}</div>
                      <div className="text-xs text-gray-400">{show.show_author}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm tabular-nums shrink-0 ml-4">
                    <span className="whitespace-nowrap">{formatDuration(show.total_seconds)}</span>
                    <span className="text-gray-400 w-8 text-right">{show.unique_listeners}</span>
                    <span className="w-16 text-right">{formatCurrency(show.payout)}</span>
                    <span className="w-12 text-right text-gray-400">{totalPlatformSeconds > 0 ? ((show.total_seconds / totalPlatformSeconds) * 100).toFixed(1) + "%" : "—"}</span>
                    <span className="text-gray-300 text-xs">{expandedShows.has(show.show_id) ? "▲" : "▼"}</span>
                  </div>
                </button>
                {expandedShows.has(show.show_id) && (
                  <div className="border-t border-gray-100">
                    {show.episodes.map((ep) => (
                      <div
                        key={ep.episode_id}
                        className="flex items-center justify-between px-4 py-2.5 pl-8 text-sm border-t border-gray-50 first:border-t-0"
                      >
                        <span className="text-gray-600 truncate flex-1 min-w-0 pr-4">{ep.episode_title}</span>
                        <div className="flex items-center gap-6 tabular-nums shrink-0">
                          <span className="text-gray-500 whitespace-nowrap">{formatDuration(ep.total_seconds)}</span>
                          <span className="text-gray-400 w-8 text-right">{ep.unique_listeners}</span>
                          <span className="text-gray-400 w-16 text-right">{formatCurrency(ep.payout)}</span>
                          <span className="text-gray-400 w-12 text-right">{totalPlatformSeconds > 0 ? ((ep.total_seconds / totalPlatformSeconds) * 100).toFixed(1) + "%" : "—"}</span>
                          <span className="w-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3 text-sm font-medium border-t border-gray-200 bg-gray-50 rounded-lg mt-2">
              <span>Total</span>
              <div className="flex items-center gap-6 shrink-0 ml-4">
                <span className="whitespace-nowrap">{formatDuration(totalSeconds)}</span>
                <span className="w-8"></span>
                <span className="w-16 text-right">{formatCurrency(totalPayout)}</span>
                <span className="w-12"></span>
                <span className="w-3" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
