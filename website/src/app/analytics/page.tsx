"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const ANALYTICS_PASSWORD = process.env.NEXT_PUBLIC_ANALYTICS_PASSWORD || "azalea";

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

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatPeriodLabel(periodStart: string, period: PeriodType): string {
  const date = new Date(periodStart + "T00:00:00");
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  if (period === "daily") return date.toLocaleDateString("en-US", opts);
  if (period === "weekly") return `Week of ${date.toLocaleDateString("en-US", opts)}`;
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const typeBadgeColors: Record<string, string> = {
  audiobook: "bg-purple-100 text-purple-800",
  podcast: "bg-blue-100 text-blue-800",
};

export default function AnalyticsPage() {
  const [authed, setAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [period, setPeriod] = useState<PeriodType>("weekly");
  const [data, setData] = useState<AggRow[]>([]);
  const [periods, setPeriods] = useState<string[]>([]);
  const [periodIndex, setPeriodIndex] = useState(0);
  const [loading, setLoading] = useState(false);

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
      setData(json.data ?? []);
      if (json.periods?.length) {
        setPeriods(json.periods);
        if (!periodStart) setPeriodIndex(0);
      }
    } catch {
      setData([]);
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

  const totalSeconds = data.reduce((sum, r) => sum + r.total_seconds, 0);
  const totalEvents = data.reduce((sum, r) => sum + r.event_count, 0);

  return (
    <div className="min-h-screen bg-[#fbfbfb] px-4 py-8 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <Link href="/" className="text-sm text-gray-500 hover:text-black transition-colors">
            &larr; Home
          </Link>
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

        {/* Summary */}
        <div className="flex gap-6 mb-6 text-sm text-gray-500">
          <span>Total: <strong className="text-black">{formatDuration(totalSeconds)}</strong></span>
          <span>Events: <strong className="text-black">{totalEvents}</strong></span>
        </div>

        {/* Data table */}
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-gray-400 text-sm">No data for this period.</p>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Content</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium text-right">Time</th>
                  <th className="px-4 py-3 font-medium text-right">Events</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={`${row.content_id}-${row.content_type}-${i}`} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <div className="font-medium">{row.content_name}</div>
                      <div className="text-xs text-gray-400">{row.content_author}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${typeBadgeColors[row.content_type] ?? "bg-gray-100 text-gray-800"}`}>
                        {row.content_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatDuration(row.total_seconds)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.event_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
