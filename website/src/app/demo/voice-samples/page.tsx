"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";

interface Fragment {
  id: number;
  begin: number;
  end: number;
  text: string;
  paragraph: number;
}

const R2_BASE =
  "https://pub-ee342152cf1149298fc3cb54a286f268.r2.dev/tallys-corner-a-study-of-negro-streetcorner-men";
const COVER_URL = `${R2_BASE}/cover.png`;
const ASH_AUDIO_URL = "/demo-data/voice-samples/voice-sample-ash.mp3";
const ASH_SYNCMAP_URL = "/demo-data/voice-samples/ash-syncmap.json";
const AAVE_MALE_DIALOGUE_PARAGRAPHS = new Set([
  8, 10, 12, 13, 15, 17, 19, 22, 24, 26, 44, 47, 49, 52, 61,
]);
const AAVE_FEMALE_DIALOGUE_PARAGRAPHS = new Set([9, 11, 16, 18]);

// Fallback text if syncmap hasn't loaded yet.
const SAMPLE_TEXT: string[][] = [
  [
    "LOVERS AND EXPLOITERS",
  ],
  [
    "Men and women talk of themselves and others as cynical, self serving marauders, ceaselessly exploiting one another as use objects or objects of income.",
    "But more often, the men prefer to see themselves as the exploiters, the women as the exploited.",
  ],
  [
    "Men saw themselves as users of women as sex objects as well as objects of income.",
    "Thus the men talked of themselves as exploiters and users of women. But talk is cheap.",
  ],
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VoiceSamplesDemo() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const activeRef = useRef<HTMLSpanElement>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);

  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [syncmapAvailable, setSyncmapAvailable] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [scrolledPastHeader, setScrolledPastHeader] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const SPEEDS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

  // Track when user scrolls past the header
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setScrolledPastHeader(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  // Load sync map when voice changes
  useEffect(() => {
    let cancelled = false;
    fetch(ASH_SYNCMAP_URL)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data: Fragment[]) => {
        if (cancelled) return;
        setFragments(data);
        setSyncmapAvailable(true);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setSyncmapAvailable(false);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Find active fragment via binary search
  const findActiveIndex = useCallback(
    (time: number): number => {
      if (fragments.length === 0) return -1;
      let lo = 0;
      let hi = fragments.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        if (time < fragments[mid].begin) {
          hi = mid - 1;
        } else if (time >= fragments[mid].end) {
          lo = mid + 1;
        } else {
          return mid;
        }
      }
      return -1;
    },
    [fragments]
  );

  // Audio event handlers
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const t = audioRef.current.currentTime;
    setCurrentTime(t);
    const idx = findActiveIndex(t);
    setActiveIndex(idx);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      if (Number.isFinite(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
      audioRef.current.playbackRate = playbackRate;
    }
  };

  const handleDurationChange = () => {
    if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const cycleSpeed = () => {
    const currentIdx = SPEEDS.indexOf(playbackRate);
    const nextIdx = (currentIdx + 1) % SPEEDS.length;
    const newRate = SPEEDS[nextIdx];
    setPlaybackRate(newRate);
    if (audioRef.current) audioRef.current.playbackRate = newRate;
  };

  const handleEnded = () => {
    setPlaying(false);
    setActiveIndex(-1);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  // Seek bar
  const seekFromClientX = (clientX: number) => {
    const bar = seekBarRef.current;
    if (!bar || !audioRef.current || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * duration;
  };

  const handleSeekDown = (e: React.MouseEvent<HTMLDivElement>) => {
    seekFromClientX(e.clientX);
    setDragging(true);
    const onMove = (ev: MouseEvent) => seekFromClientX(ev.clientX);
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    seekFromClientX(e.touches[0].clientX);
    setDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    seekFromClientX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    setDragging(false);
  };

  // Click sentence to seek
  const seekToFragment = (frag: Fragment) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = frag.begin;
    if (!playing) {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  // Auto-scroll to active sentence
  useEffect(() => {
    if (activeIndex >= 0 && activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex]);

  const syncmapDuration = fragments.at(-1)?.end ?? 0;
  const visibleDuration = duration || syncmapDuration;
  const progress = visibleDuration ? (currentTime / visibleDuration) * 100 : 0;
  const dialogueRanges = useMemo(() => {
    if (!visibleDuration) return [];
    return fragments
      .map((fragment) => {
        const type = AAVE_MALE_DIALOGUE_PARAGRAPHS.has(fragment.paragraph)
          ? "male"
          : AAVE_FEMALE_DIALOGUE_PARAGRAPHS.has(fragment.paragraph)
            ? "female"
            : null;
        if (!type) return null;
        return {
          id: fragment.id,
          type,
          left: (fragment.begin / visibleDuration) * 100,
          width: ((fragment.end - fragment.begin) / visibleDuration) * 100,
        };
      })
      .filter((range): range is { id: number; type: "male" | "female"; left: number; width: number } => {
        return !!range && range.width > 0;
      });
  }, [fragments, visibleDuration]);

  // Group fragments by paragraph
  const paragraphs: Fragment[][] = [];
  if (fragments.length > 0) {
    let currentPara = fragments[0].paragraph;
    let group: Fragment[] = [];
    for (const f of fragments) {
      if (f.paragraph !== currentPara) {
        paragraphs.push(group);
        group = [];
        currentPara = f.paragraph;
      }
      group.push(f);
    }
    if (group.length > 0) paragraphs.push(group);
  }

  return (
    <div className="min-h-screen bg-[#faf8f1]">
      <audio
        ref={audioRef}
        src={ASH_AUDIO_URL}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleDurationChange}
        onEnded={handleEnded}
      />

      {/* Header */}
      <header ref={headerRef} className="bg-[#2c1810] text-white">
        <div className="max-w-2xl mx-auto px-6 py-10 flex items-center gap-6">
          <Image
            src={COVER_URL}
            alt="Tally's Corner cover"
            width={120}
            height={120}
            className="rounded-lg shadow-lg flex-shrink-0"
            style={{ width: 120, height: 120, objectFit: "cover" }}
          />
          <div>
            <p className="text-amber-300/80 text-xs font-bold uppercase tracking-[0.2em] mb-1">
              Azalea Labs Demo
            </p>
            <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-garamond)]">
              Tally&apos;s Corner
            </h1>
            <p className="text-white/60 text-sm mt-1">by Elliot Liebow</p>
            <p className="text-white/40 text-xs mt-2 font-[family-name:var(--font-garamond)] italic">
              Lovers and Exploiters Sample
            </p>
            <p className="text-amber-300/80 text-xs font-bold uppercase tracking-[0.18em] mt-3">
              Narrated by ASH
            </p>
          </div>
        </div>
      </header>

      {/* Sticky audio player */}
      <div className="sticky top-0 z-50 bg-[#2c1810]/95 backdrop-blur-md border-b border-white/10">
        {/* Collapsible book info — shows when scrolled past header */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            scrolledPastHeader ? "max-h-24 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="max-w-2xl mx-auto px-6 pt-3 pb-2 flex items-center gap-4">
            <Image
              src={COVER_URL}
              alt="Tally's Corner cover"
              width={48}
              height={48}
              className="rounded flex-shrink-0"
              style={{ width: 48, height: 48, objectFit: "cover" }}
            />
            <div className="min-w-0">
              <p className="text-amber-300/70 text-[10px] font-bold uppercase tracking-[0.15em]">
                Azalea Labs Demo
              </p>
              <p className="text-white text-sm font-bold font-[family-name:var(--font-garamond)] truncate">
                Tally&apos;s Corner
              </p>
              <p className="text-white/50 text-xs truncate">
                Elliot Liebow &middot;{" "}
                <span className="italic font-[family-name:var(--font-garamond)]">
                  Lovers and Exploiters Sample
                </span>
              </p>
              <p className="text-amber-300/70 text-[10px] font-bold uppercase tracking-[0.15em] mt-1">
                ASH
              </p>
            </div>
          </div>
        </div>

        {/* Player controls */}
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-4">
          {/* Play/pause */}
          <button
            onClick={togglePlay}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-400 text-[#2c1810] flex items-center justify-center hover:bg-amber-300 transition-colors"
          >
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 14 14" fill="currentColor">
                <rect x="2" y="1" width="3.5" height="12" rx="1" />
                <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 14 14" fill="currentColor">
                <path d="M3 1.5v11l9-5.5z" />
              </svg>
            )}
          </button>

          {/* Time + seek bar */}
          <span className="text-xs text-white/50 tabular-nums w-10 text-right flex-shrink-0">
            {formatTime(currentTime)}
          </span>
          <div
            ref={seekBarRef}
            className="flex-1 h-6 flex items-center cursor-pointer relative group touch-none"
            onMouseDown={handleSeekDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-full h-2 bg-white/15 rounded-full relative">
              <div
                className="absolute inset-y-0 left-0 bg-amber-400 rounded-full pointer-events-none z-10"
                style={{
                  width: `${progress}%`,
                  transition: dragging ? "none" : "width 0.1s",
                }}
              />
              {dialogueRanges.map((range) => (
                <div
                  key={range.id}
                  className="absolute inset-y-0 pointer-events-none z-20"
                  style={{
                    left: `${range.left}%`,
                    width: `${range.width}%`,
                    backgroundColor: range.type === "male" ? "#7fb7ad" : "#d99078",
                  }}
                />
              ))}
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-400 rounded-full shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
              style={{ left: `calc(${progress}% - 8px)` }}
            />
          </div>
          <span className="text-xs text-white/50 tabular-nums w-10 flex-shrink-0">
            {formatTime(visibleDuration)}
          </span>

          {/* Playback speed */}
          <button
            onClick={cycleSpeed}
            className="flex-shrink-0 px-2 py-1 rounded-md bg-white/10 text-white/70 text-xs font-bold tabular-nums hover:bg-white/20 transition-colors min-w-[3rem]"
          >
            {playbackRate}x
          </button>
        </div>
      </div>

      {/* Text area */}
      <main className="max-w-2xl mx-auto px-6 py-10">
        {loading ? (
          <p className="text-[#2c1810]/30 text-sm uppercase tracking-widest text-center">
            Loading...
          </p>
        ) : syncmapAvailable ? (
          <div className="space-y-5">
            {paragraphs.map((para, pIdx) => (
              <p
                key={pIdx}
                className={
                  pIdx === 0
                    ? "text-3xl md:text-4xl font-bold font-[family-name:var(--font-garamond)] text-[#2c1810] text-center mb-10"
                    : "text-lg md:text-xl leading-relaxed font-[family-name:var(--font-garamond)] text-[#2c1810]/70"
                }
              >
                {para.map((frag) => {
                  const isActive = frag.id === activeIndex;
                  return (
                    <span
                      key={frag.id}
                      ref={isActive ? activeRef : undefined}
                      onClick={() => seekToFragment(frag)}
                      className={`cursor-pointer transition-all duration-200 rounded-sm ${
                        isActive
                          ? "bg-amber-200/80 text-[#2c1810] px-0.5 -mx-0.5"
                          : "hover:bg-amber-100/50"
                      }`}
                    >
                      {frag.text}{" "}
                    </span>
                  );
                })}
              </p>
            ))}
          </div>
        ) : (
          /* Fallback: show static text without sync highlighting */
          <div className="space-y-5">
            {SAMPLE_TEXT.map((para, pIdx) => (
              <p
                key={pIdx}
                className={
                  pIdx === 0
                    ? "text-3xl md:text-4xl font-bold font-[family-name:var(--font-garamond)] text-[#2c1810] text-center mb-10"
                    : "text-lg md:text-xl leading-relaxed font-[family-name:var(--font-garamond)] text-[#2c1810]/70"
                }
              >
                {para.map((sentence, sIdx) => (
                  <span key={sIdx}>{sentence} </span>
                ))}
              </p>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#2c1810] text-white/40 text-center py-8 text-xs">
        <p>
          &copy; {new Date().getFullYear()} Azalea Labs &middot; Demo for
          rights holder review
        </p>
      </footer>
    </div>
  );
}
