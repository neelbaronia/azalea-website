"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

interface Fragment {
  id: number;
  begin: number;
  end: number;
  text: string;
  paragraph: number;
}

interface AlignmentWord {
  index: number;
  text: string;
  start: number;
  end: number;
  charStart: number;
  charEnd: number;
}

interface AlignmentData {
  displayText: string;
  words: AlignmentWord[];
}

const R2_BASE =
  "https://pub-ee342152cf1149298fc3cb54a286f268.r2.dev/tallys-corner-a-study-of-negro-streetcorner-men";
const AUDIO_URL = `${R2_BASE}/chapters/06-men-and-jobs.mp3`;
const ALIGNMENT_URL = `${R2_BASE}/chapters/06-men-and-jobs.alignment.json`;

function transformAlignment(data: AlignmentData): Fragment[] {
  const { displayText, words } = data;
  if (words.length === 0) return [];

  const fragments: Fragment[] = [];
  let paragraph = 0;
  let sentenceWords: AlignmentWord[] = [words[0]];

  for (let i = 1; i < words.length; i++) {
    const prev = words[i - 1];
    const curr = words[i];
    const gap = displayText.slice(prev.charEnd, curr.charStart);

    // Detect paragraph break (double newline) or sentence break (punct + space)
    const isParaBreak = gap.includes("\n\n");
    const isSentenceBreak = /[.!?]["'\u201D)]*\s/.test(gap);

    if (isParaBreak || isSentenceBreak) {
      // Flush current sentence
      const text = displayText
        .slice(sentenceWords[0].charStart, prev.charEnd)
        .trim();
      // Include trailing punctuation after last word
      const afterLast = displayText.slice(
        prev.charEnd,
        curr.charStart
      );
      const trailingPunct = afterLast.match(/^[.!?,"'\u201D)\u2019]*/)?.[0] || "";
      const fullText = (text + trailingPunct).trim();

      if (fullText && sentenceWords.length > 0) {
        fragments.push({
          id: fragments.length,
          begin: sentenceWords[0].start,
          end: sentenceWords[sentenceWords.length - 1].end,
          text: fullText,
          paragraph,
        });
      }

      if (isParaBreak) paragraph++;
      sentenceWords = [curr];
    } else {
      sentenceWords.push(curr);
    }
  }

  // Flush final sentence
  if (sentenceWords.length > 0) {
    const last = sentenceWords[sentenceWords.length - 1];
    const text = displayText
      .slice(sentenceWords[0].charStart, last.charEnd)
      .trim();
    // Grab any trailing punctuation after the last word
    const trailing = displayText.slice(last.charEnd).match(/^[.!?,"'\u201D)\u2019]*/)?.[0] || "";
    const fullText = (text + trailing).trim();
    if (fullText) {
      fragments.push({
        id: fragments.length,
        begin: sentenceWords[0].start,
        end: last.end,
        text: fullText,
        paragraph,
      });
    }
  }

  // Extend each fragment's end to the next fragment's begin so the
  // highlight stays on the current sentence until the next one starts.
  for (let i = 0; i < fragments.length - 1; i++) {
    fragments[i].end = fragments[i + 1].begin;
  }

  return fragments;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TallysCornerDemo() {
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
  const [audioError, setAudioError] = useState<string | null>(null);
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

  // Load alignment data from R2 and transform to sentence-level fragments
  useEffect(() => {
    fetch(ALIGNMENT_URL)
      .then((r) => r.json())
      .then((data: AlignmentData) => {
        setFragments(transformAlignment(data));
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
      setDuration(audioRef.current.duration);
      audioRef.current.playbackRate = playbackRate;
    }
  };

  const cycleSpeed = () => {
    if (audioError) return;
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

  const handleAudioError = () => {
    setPlaying(false);
    setAudioError("Audio file unavailable. The current Tally's Corner demo asset is missing.");
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || audioError) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          setPlaying(false);
          setAudioError("Audio playback failed. The current Tally's Corner demo asset is unavailable.");
        });
    }
  };

  // Seek bar
  const seekFromClientX = (clientX: number) => {
    const bar = seekBarRef.current;
    if (!bar || !audioRef.current || !duration || audioError) return;
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
    if (!audioRef.current || audioError) return;
    audioRef.current.currentTime = frag.begin;
    if (!playing) {
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          setPlaying(false);
          setAudioError("Audio playback failed. The current Tally's Corner demo asset is unavailable.");
        });
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

  const progress = duration ? (currentTime / duration) * 100 : 0;

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
        src={AUDIO_URL}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={handleAudioError}
      />

      {/* Header */}
      <header ref={headerRef} className="bg-[#2c1810] text-white">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <div>
            <p className="text-amber-300/80 text-xs font-bold uppercase tracking-[0.2em] mb-1">
              Azalea Labs Demo
            </p>
            <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-garamond)]">
              Tally&apos;s Corner
            </h1>
            <p className="text-white/60 text-sm mt-1">by Elliot Liebow</p>
            <p className="text-white/40 text-xs mt-2 font-[family-name:var(--font-garamond)] italic">
              Chapter 6: Men and Jobs
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
          <div className="max-w-2xl mx-auto px-6 pt-3 pb-2">
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
                  Chapter 6: Men and Jobs
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-4">
          {/* Play/pause */}
          <button
            onClick={togglePlay}
            disabled={Boolean(audioError)}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-400 text-[#2c1810] flex items-center justify-center hover:bg-amber-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
                className="absolute inset-y-0 left-0 bg-amber-400 rounded-full pointer-events-none"
                style={{
                  width: `${progress}%`,
                  transition: dragging ? "none" : "width 0.1s",
                }}
              />
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-400 rounded-full shadow-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"
              style={{ left: `calc(${progress}% - 8px)` }}
            />
          </div>
          <span className="text-xs text-white/50 tabular-nums w-10 flex-shrink-0">
            {formatTime(duration)}
          </span>

          {/* Playback speed */}
          <button
            onClick={cycleSpeed}
            disabled={Boolean(audioError)}
            className="flex-shrink-0 px-2 py-1 rounded-md bg-white/10 text-white/70 text-xs font-bold tabular-nums hover:bg-white/20 transition-colors min-w-[3rem] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {playbackRate}x
          </button>
        </div>
        {audioError && (
          <div className="max-w-2xl mx-auto px-6 pb-3">
            <div className="rounded-md border border-amber-300/30 bg-amber-200/10 px-3 py-2 text-xs text-amber-100">
              {audioError}
            </div>
          </div>
        )}
      </div>

      {/* Text area */}
      <main className="max-w-2xl mx-auto px-6 py-10">
        <h2 className="text-3xl md:text-4xl font-bold font-[family-name:var(--font-garamond)] text-[#2c1810] text-center mb-10">
          Men and Jobs
        </h2>
        {loading ? (
          <p className="text-[#2c1810]/30 text-sm uppercase tracking-widest text-center">
            Loading...
          </p>
        ) : (
          <div className="space-y-5">
            {paragraphs.map((para, pIdx) => (
              <p
                key={pIdx}
                className="text-lg md:text-xl leading-relaxed font-[family-name:var(--font-garamond)] text-[#2c1810]/70"
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
