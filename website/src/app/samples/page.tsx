"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Book {
  id: string;
  title: string;
  author: string;
  coverImageName: string;
  remoteBaseURL: string;
  duration: number;
}

interface Chapter {
  title: string;
  fileName: string;
  duration: number;
  remoteAudioURL: string;
}

interface BookMetadata {
  chapters: Chapter[];
}

const CHAPTER_OVERRIDES: Record<string, string> = {};

const FEATURED_IDS = [
  "a-honeymoon-in-space",
  "anthropology-and-modern-life",
  "diana",
  "tarrano-the-conqueror",
  "the-conquest-of-happiness-project-gutenberg",
  "the-phantom-public",
];

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function SamplesNavbar() {
  const router = useRouter();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-4 md:px-8 py-3 md:py-6 bg-transparent">
      <a href="/" className="flex items-center gap-2 flex-shrink-0">
        <Image src="/azalea-icon.webp" alt="Azalea" width={32} height={32} className="w-7 h-7 md:w-10 md:h-10" />
        <div className="flex flex-col leading-tight">
          <span className="text-xs md:text-sm font-extrabold uppercase tracking-[0.2em] text-white">Azalea</span>
          <span className="text-xs md:text-sm font-extrabold uppercase tracking-[0.2em] text-white">Labs</span>
        </div>
      </a>
      <div className="flex gap-0.5 rounded-xl p-1 border backdrop-blur-md bg-white/10 border-white/10 flex-shrink min-w-0">
        <button
          onClick={() => router.push("/")}
          className="px-3 md:px-5 py-1.5 md:py-2 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 hover:text-white transition-colors rounded-lg whitespace-nowrap"
        >
          Listen
        </button>
        <button
          onClick={() => router.push("/")}
          className="px-3 md:px-5 py-1.5 md:py-2 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 hover:text-white transition-colors rounded-lg whitespace-nowrap"
        >
          Create &amp; Distribute
        </button>
      </div>
    </nav>
  );
}

function SamplePlayer({ book, audioUrl }: { book: Book; audioUrl: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);
  const seekBarRef = useRef<HTMLDivElement>(null);

  const coverUrl = `${book.remoteBaseURL}/${book.coverImageName}`;

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

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      audioRef.current.playbackRate = 1.2;
    }
  };

  const handleEnded = () => setPlaying(false);

  const seekFromEvent = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    const bar = seekBarRef.current;
    if (!bar || !audioRef.current || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * duration;
  };

  const handleSeekDown = (e: React.MouseEvent<HTMLDivElement>) => {
    seekFromEvent(e);
    setDragging(true);
    const onMove = (ev: MouseEvent) => seekFromEvent(ev);
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-4 md:gap-6 p-4 md:p-5 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-shadow">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Cover */}
      <div className="flex-shrink-0">
        <Image
          src={coverUrl}
          alt={book.title}
          width={160}
          height={160}
          className="rounded-xl object-cover shadow-md"
          style={{ width: 160, height: 160 }}
        />
      </div>

      {/* Info + controls */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm md:text-base font-bold text-black truncate">{book.title}</h3>
        <p className="text-xs text-black/50 mb-3">{book.author} &middot; {formatDuration(book.duration)}</p>

        <div className="flex items-center gap-3">
          {/* Play/pause button */}
          <button
            onClick={togglePlay}
            className="flex-shrink-0 w-9 h-9 rounded-full bg-black text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          >
            {playing ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <rect x="2" y="1" width="3.5" height="12" rx="1" />
                <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M3 1.5v11l9-5.5z" />
              </svg>
            )}
          </button>

          {/* Progress bar */}
          <div className="flex-1 flex items-center gap-3">
            <span className="text-xs text-black/40 tabular-nums w-9 text-right">{formatTime(currentTime)}</span>
            <div
              ref={seekBarRef}
              className="flex-1 h-3 bg-black/10 rounded-full cursor-pointer relative group"
              onMouseDown={handleSeekDown}
            >
              <div
                className="absolute inset-y-0 left-0 bg-black rounded-full"
                style={{ width: `${progress}%`, transition: dragging ? "none" : "width 0.1s" }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-black rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 10px)` }}
              />
            </div>
            <span className="text-xs text-black/40 tabular-nums w-9">{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SampleEntry {
  book: Book;
  audioUrl: string;
}

export default function SamplesPage() {
  const [samples, setSamples] = useState<SampleEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/books")
      .then((r) => r.json())
      .then(async (data: Book[]) => {
        const featured = FEATURED_IDS
          .map((id) => data.find((b) => b.id === id))
          .filter((b): b is Book => !!b);

        const entries: SampleEntry[] = [];
        for (const book of featured) {
          try {
            const res = await fetch(`${book.remoteBaseURL}/metadata.json`);
            if (!res.ok) continue;
            const meta: BookMetadata = await res.json();
            // Find first real chapter (skip Title/Foreword/Credits)
            // Pick a specific chapter for certain books, otherwise first real chapter
            const preferredChapter = CHAPTER_OVERRIDES[book.id];
            const chapter = preferredChapter
              ? meta.chapters.find((ch) => ch.title === preferredChapter)
              : meta.chapters.find(
                  (ch) =>
                    ch.title.toLowerCase().startsWith("chapter") ||
                    ch.title.toLowerCase().startsWith("part")
                ) || meta.chapters[0];
            if (chapter?.fileName) {
              const audioUrl = `${book.remoteBaseURL}/chapters/${chapter.fileName}`;
              entries.push({ book, audioUrl });
            }
          } catch (e) {
            // skip books whose metadata can't be fetched
          }
        }
        setSamples(entries);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f0] relative">
      {/* Background image */}
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/samples-bg.png')" }} />
      <div className="relative z-10">
      {/* Navbar */}
      <SamplesNavbar />

      {/* Header */}
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-8">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          Listen to samples.
        </h1>
        <p className="text-base md:text-lg text-white font-black mt-3 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
          Preview audiobooks from the Azalea catalog.
        </p>
      </div>

      {/* Book list */}
      <div className="max-w-3xl mx-auto px-6 pb-20">
        {loading ? (
          <p className="text-sm text-black/30 uppercase tracking-widest">Loading...</p>
        ) : samples.length === 0 ? (
          <p className="text-sm text-black/30">No samples available.</p>
        ) : (
          <div className="space-y-10">
            {samples.map((entry) => (
              <SamplePlayer key={entry.book.id} book={entry.book} audioUrl={entry.audioUrl} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full bg-black text-white/60">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-2">
            <p className="text-white font-bold text-sm uppercase tracking-[0.3em]">Azalea Labs</p>
            <p className="text-xs text-white/40">&copy; {new Date().getFullYear()} Azalea Labs. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
            <a href="mailto:neel@azalea-labs.com" className="hover:text-white transition-colors">Contact</a>
            <a href="/samples" className="hover:text-white transition-colors">Samples</a>
            <a href="/publications" className="hover:text-white transition-colors">Our Publications</a>
            <a href="/payout.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Payout Dashboard</a>
            <a href="/demo/tallys-corner" className="hover:text-white transition-colors">Tally&apos;s Corner Demo</a>
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
