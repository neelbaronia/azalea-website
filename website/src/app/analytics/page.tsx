"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const ANALYTICS_PASSWORD = process.env.NEXT_PUBLIC_ANALYTICS_PASSWORD || "azalea";

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

export default function AnalyticsPage() {
  const [authed, setAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
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

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("analytics_authed") === "true") {
      setAuthed(true);
    }
  }, []);

  const fetchData = useCallback(async (p: PeriodType, periodStart?: string) => {
    setLoading(true);
    const params = new URLSearchParams({ period: p });
    if (periodStart) params.set("period_start", periodStart);
    try {
      const res = await fetch(`/api/analytics?${params}`);
      const json = await res.json();
      setAudiobooks(json.audiobooks ?? []);
      setPodcasts(json.podcasts ?? []);
      if (json.revenue) setRevenue(json.revenue);
      if (json.active_subscribers != null) setActiveSubscribers(json.active_subscribers);
      if (json.periods?.length) {
        setPeriods(json.periods);
        if (!periodStart) setPeriodIndex(0);
      }
    } catch {
      setAudiobooks([]);
      setPodcasts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) fetchData(period);
  }, [authed, period, fetchData]);

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (passwordInput === ANALYTICS_PASSWORD) {
      sessionStorage.setItem("analytics_authed", "true");
      setAuthed(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
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
            className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Enter
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
