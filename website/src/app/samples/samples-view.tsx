"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SampleEntry } from "./sample-data";

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
  return (
    <header className="sticky top-0 z-50 flex min-h-[72px] items-center justify-between gap-3 border-b border-white/15 bg-[#282142] px-4 text-white md:gap-4 md:px-10">
      <Link href="/" className="flex shrink-0 items-center gap-2 md:gap-3" aria-label="Azalea Labs home">
        <Image src="/azalea-icon.webp" alt="" width={30} height={30} priority unoptimized className="h-6 w-6 md:h-[30px] md:w-[30px]" />
        <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] md:text-sm md:tracking-[0.18em]">Azalea Labs</span>
      </Link>
      <nav className="flex items-center gap-3 text-[8px] font-bold uppercase tracking-[0.07em] md:gap-8 md:text-xs md:tracking-[0.12em]" aria-label="Main navigation">
        <Link href="/translations" className="text-white/65 transition-colors hover:text-white">Translations</Link>
        <Link href="/publications" className="text-white/65 transition-colors hover:text-white">Publications</Link>
      </nav>
    </header>
  );
}

function SamplePlayer({ book, audioUrl, sampleDuration, priority }: SampleEntry & { priority: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(sampleDuration);
  const [audioError, setAudioError] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const seekBarRef = useRef<HTMLDivElement>(null);

  // Ship small cover copies with the page instead of fetching multi-megabyte
  // originals from R2 on an image-optimizer cache miss.
  const coverUrl = `/sample-covers/${book.id}.webp`;
  const description = book.description ?? "";
  const canExpandDescription = description.length > 200;
  const descriptionPreview = canExpandDescription
    ? `${description.slice(0, 200).replace(/\s+\S*$/, "")}…`
    : description;
  const descriptionId = `${book.id}-description`;

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      setAudioError(false);
      try {
        audio.playbackRate = 1.2;
        await audio.play();
      } catch (error) {
        setPlaying(false);
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setAudioError(true);
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      if (Number.isFinite(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
      audioRef.current.playbackRate = 1.2;
    }
  };

  const handleEnded = () => setPlaying(false);

  const seekFromClientX = (clientX: number) => {
    const bar = seekBarRef.current;
    if (!bar || !audioRef.current || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * duration;
  };

  const handleSeekPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    seekFromClientX(e.clientX);
    setDragging(true);
  };

  const handleSeekPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) seekFromClientX(e.clientX);
  };

  const handleSeekPointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragging(false);
  };

  const handleSeekKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const step = e.shiftKey ? 10 : 5;
    let nextTime: number;
    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        nextTime = currentTime - step;
        break;
      case "ArrowRight":
      case "ArrowUp":
        nextTime = currentTime + step;
        break;
      case "PageDown":
        nextTime = currentTime - 30;
        break;
      case "PageUp":
        nextTime = currentTime + 30;
        break;
      case "Home":
        nextTime = 0;
        break;
      case "End":
        nextTime = duration;
        break;
      default:
        return;
    }

    e.preventDefault();
    audio.currentTime = Math.max(0, Math.min(duration, nextTime));
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <article className="flex h-full min-w-0 flex-col gap-5 border border-[#d9d9d5] border-t-[3px] border-t-[#3566ff] bg-[#f8f8f4] p-5 transition-colors hover:border-[#080808]/35">
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => { setPlaying(false); setAudioError(true); }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Keep the cover and title together; give the player the full card width. */}
      <div className="flex items-start gap-4">
        <Image
          src={coverUrl}
          alt={book.title}
          width={112}
          height={112}
          priority={priority}
          sizes="(max-width: 767px) 96px, 112px"
          className="h-24 w-24 flex-shrink-0 border border-black/10 object-cover md:h-28 md:w-28"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold leading-snug text-[#080808]" style={{ fontFamily: "var(--font-garamond), Georgia, serif" }}>{book.title}</h3>
          <p className="mt-2 text-xs leading-relaxed text-[#080808]/60">{book.author} &middot; {formatDuration(book.duration)}</p>
        </div>
      </div>

      {description && (
        <div>
          <p id={descriptionId} className="text-sm leading-relaxed text-[#080808]/75">
            {descriptionExpanded ? description : descriptionPreview}
          </p>
          {canExpandDescription && (
            <button
              type="button"
              aria-expanded={descriptionExpanded}
              aria-controls={descriptionId}
              aria-label={`${descriptionExpanded ? "Show less" : "Read more"} about ${book.title}`}
              onClick={() => setDescriptionExpanded((expanded) => !expanded)}
              className="mt-1 inline-flex min-h-8 items-center text-xs font-semibold text-[#3566ff] underline underline-offset-4 hover:text-[#080808]"
            >
              {descriptionExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {/* Controls stay aligned at the bottom, even when titles wrap. */}
      <div className="mt-auto min-w-0">
        <div className="flex items-center gap-3">
          {/* Play/pause button */}
          <button
            onClick={togglePlay}
            aria-label={`${playing ? "Pause" : "Play"} ${book.title}`}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#080808] text-white transition-colors hover:bg-[#282142] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3566ff]"
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
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <span className="w-9 flex-shrink-0 text-right text-xs tabular-nums text-[#080808]/50">{formatTime(currentTime)}</span>
            <div
              ref={seekBarRef}
              role="slider"
              aria-label={`Seek in ${book.title}`}
              aria-valuemin={0}
              aria-valuemax={Math.floor(duration)}
              aria-valuenow={Math.floor(currentTime)}
              aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
              tabIndex={duration ? 0 : -1}
              onKeyDown={handleSeekKeyDown}
              onPointerDown={handleSeekPointerDown}
              onPointerMove={handleSeekPointerMove}
              onPointerUp={handleSeekPointerEnd}
              onPointerCancel={handleSeekPointerEnd}
              className="group relative h-3 min-w-0 flex-1 touch-none cursor-pointer rounded-full bg-[#080808]/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3566ff]"
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[#3566ff]"
                style={{ width: `${progress}%`, transition: dragging ? "none" : "width 0.1s" }}
              />
              <div
                className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#3566ff] opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                style={{ left: `calc(${progress}% - 10px)` }}
              />
            </div>
            <span className="w-9 flex-shrink-0 text-xs tabular-nums text-[#080808]/50">{formatTime(duration)}</span>
          </div>
        </div>
        {audioError && <p role="alert" className="mt-2 text-xs text-[#080808]/70">Couldn’t play this sample. Please try again.</p>}
        {book.spotifyUrl && (
          <a
            href={book.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Listen to the full audiobook of ${book.title} on Spotify (opens in a new tab)`}
            className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#1ed760] px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#3be477] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
          >
            Full book on Spotify <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </article>
  );
}

export default function SamplesView({ samples }: { samples: SampleEntry[] }) {
  return (
    <main className="min-h-screen bg-[#fbfbfb] text-[#080808]">
      <SamplesNavbar />

      <section className="border-b border-[#080808]/15 bg-[#f1eee6]">
        <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-10 md:py-24">
          <p className="mb-5 flex items-center gap-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#3566ff]">
            <span className="h-px w-8 bg-[#3566ff]" aria-hidden="true" />
            Azalea Labs · Listening room
          </p>
          <h1 className="max-w-5xl text-[clamp(2.75rem,6vw,5.5rem)] font-bold leading-[0.88] tracking-[-0.065em]" style={{ fontFamily: "var(--font-garamond), Georgia, serif" }}>
            Listen to <em className="font-medium">samples.</em>
          </h1>
          <div className="mt-8 flex flex-col gap-6 border-t border-[#080808]/15 pt-6 md:flex-row md:items-end md:justify-between">
            <p className="max-w-2xl text-base leading-relaxed text-[#080808]/65 md:text-lg">
              Hear a first chapter from the Azalea catalog. Pick a title, press play, and explore the full audiobook on Spotify.
            </p>
            <p className="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] text-[#080808]/55">
              {String(samples.length).padStart(2, "0")} featured titles
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-12 md:px-10 md:py-16" aria-labelledby="featured-samples-heading">
        <div className="mb-7 flex items-end justify-between gap-4 border-b border-[#080808]/15 pb-4">
          <h2 id="featured-samples-heading" className="text-2xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-garamond), Georgia, serif" }}>Featured audiobooks</h2>
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#080808]/45">Audio previews</span>
        </div>
        {samples.length === 0 ? (
          <p className="border border-[#d9d9d5] bg-[#f8f8f4] p-6 text-sm text-[#080808]/55">No samples available.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {samples.map((entry, index) => (
              <SamplePlayer key={entry.book.id} {...entry} priority={index === 0} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
