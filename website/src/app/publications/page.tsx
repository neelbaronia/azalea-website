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

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function PublicationsNavbar() {
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

interface Chapter {
  title: string;
  fileName: string;
  duration: number;
  remoteAudioURL: string;
}

interface BookWithDescription extends Book {
  description?: string;
  sampleUrl?: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function MiniPlayer({ audioUrl }: { audioUrl: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);

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
    <div className="flex items-center gap-3 mt-3">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
            audioRef.current.playbackRate = 1.2;
          }
        }}
        onEnded={() => setPlaying(false)}
      />
      <button
        onClick={togglePlay}
        className="flex-shrink-0 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/80 transition-colors"
      >
        {playing ? (
          <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
            <rect x="2" y="1" width="3.5" height="12" rx="1" />
            <rect x="8.5" y="1" width="3.5" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
            <path d="M3 1.5v11l9-5.5z" />
          </svg>
        )}
      </button>
      <span className="text-xs text-white/40 tabular-nums w-9 text-right">{formatTime(currentTime)}</span>
      <div
        ref={seekBarRef}
        className="flex-1 h-2 bg-white/10 rounded-full cursor-pointer relative group"
        onMouseDown={handleSeekDown}
      >
        <div
          className="absolute inset-y-0 left-0 bg-white/60 rounded-full"
          style={{ width: `${progress}%`, transition: dragging ? "none" : "width 0.1s" }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress}% - 8px)` }}
        />
      </div>
      <span className="text-xs text-white/40 tabular-nums w-9">{formatTime(duration)}</span>
    </div>
  );
}

export default function PublicationsPage() {
  const [books, setBooks] = useState<BookWithDescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/books")
      .then((r) => r.json())
      .then(async (data: Book[]) => {
        const enriched: BookWithDescription[] = await Promise.all(
          data.map(async (book) => {
            try {
              const res = await fetch(`${book.remoteBaseURL}/metadata.json`);
              if (!res.ok) return book;
              const meta = await res.json();
              let sampleUrl: string | undefined;
              if (meta.chapters?.length) {
                const chapter = meta.chapters.find(
                  (ch: Chapter) =>
                    ch.title.toLowerCase().startsWith("chapter") ||
                    ch.title.toLowerCase().startsWith("part")
                ) || meta.chapters[0];
                if (chapter?.fileName) {
                  sampleUrl = `${book.remoteBaseURL}/chapters/${chapter.fileName}`;
                }
              }
              return { ...book, description: meta.description || undefined, sampleUrl };
            } catch {
              return book;
            }
          })
        );
        setBooks(enriched);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f0] relative">
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/samples-bg.png')" }} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <PublicationsNavbar />

        {/* Header */}
        <div className="max-w-5xl mx-auto px-6 pt-24 pb-8 w-full">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            Our Publications
          </h1>
          <p className="text-base md:text-lg text-white font-black mt-3 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
            Browse the complete Azalea Labs audiobook catalog.
          </p>
        </div>

        {/* Book grid */}
        <div className="max-w-5xl mx-auto px-6 pb-20 w-full flex-1">
          {loading ? (
            <p className="text-sm text-white/50 uppercase tracking-widest">Loading...</p>
          ) : books.length === 0 ? (
            <p className="text-sm text-white/50">No publications available.</p>
          ) : (
            <div className="space-y-6">
              {books.map((book) => {
                const coverUrl = `${book.remoteBaseURL}/${book.coverImageName}`;
                return (
                  <div
                    key={book.id}
                    className="flex gap-5 md:gap-6 p-4 md:p-5 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-shadow"
                  >
                    <div className="flex-shrink-0">
                      <img
                        src={coverUrl}
                        alt={book.title}
                        className="rounded-xl object-cover shadow-md w-[160px] h-[160px]"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl md:text-2xl font-bold text-white">{book.title}</h3>
                      <p className="text-base md:text-lg text-white/60 mb-2">
                        {book.author} &middot; {formatDuration(book.duration)}
                      </p>
                      {book.description && (
                        <p className="text-base text-white/50 leading-relaxed">
                          {book.description}
                        </p>
                      )}
                      {book.sampleUrl && (
                        <div className="mt-3">
                          <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-2">Listen to a Sample</p>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <MiniPlayer audioUrl={book.sampleUrl} />
                            </div>
                            <a
                              href={`https://open.spotify.com/search/${encodeURIComponent(book.title)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-white text-sm font-semibold rounded-full transition-colors"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                              </svg>
                              Full Book Available on Spotify
                            </a>
                          </div>
                        </div>
                      )}
                      {!book.sampleUrl && (
                        <a
                          href={`https://open.spotify.com/search/${encodeURIComponent(book.title)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-white text-base font-semibold rounded-full transition-colors"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                          </svg>
                          Listen on Spotify
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
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
