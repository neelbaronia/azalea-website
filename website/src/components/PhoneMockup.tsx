"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

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

interface PhoneMockupProps {
  books: Book[];
  initialScreen?: "home" | "detail" | "player";
}

export default function PhoneMockup({ books, initialScreen = "home" }: PhoneMockupProps) {
  const [screen, setScreen] = useState<"home" | "detail" | "player">(initialScreen);
  const [selectedBook, setSelectedBook] = useState<Book | null>(books[0] ?? null);
  const [playing, setPlaying] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const update = () => {
      // Reserve ~280px for heading + body text + padding; phone gets the rest
      const s = Math.min(1, (window.innerHeight - 280) / 638);
      setScale(s);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  function openDetail(book: Book) {
    setSelectedBook(book);
    setScreen("detail");
  }

  function openPlayer(book: Book) {
    setSelectedBook(book);
    setScreen("player");
  }

  return (
    <div
      className="relative w-[300px] h-[638px]"
      style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Phone frame */}
      <div className="absolute inset-0 bg-[#1c1c1e] rounded-[3rem] border-[10px] border-[#2a2a2a] shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-white/5">
        <div className="relative w-full h-full overflow-hidden">

          {/* Status bar */}
          <div className="absolute top-0 left-0 right-0 h-11 z-20 flex justify-between items-center px-5">
            <span className="text-[11px] font-semibold text-black">9:41</span>
            <div className="flex gap-1.5 items-center">
              <span className="text-[10px] text-black opacity-70">●●●</span>
              <span className="text-[10px] text-black opacity-70">▲</span>
              <div className="w-6 h-3 rounded-sm border border-black/50 relative">
                <div className="absolute inset-[2px] right-[3px] bg-black/70 rounded-sm" />
                <div className="absolute -right-[3px] top-1/2 -translate-y-1/2 w-[2px] h-1.5 bg-black/40 rounded-r-sm" />
              </div>
            </div>
          </div>

          {/* Dynamic Island */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-6 bg-black rounded-full z-30" />

          {screen === "home" && (
            <HomeScreen books={books} onOpenDetail={openDetail} onOpenPlayer={openPlayer} />
          )}
          {screen === "detail" && (
            <DetailScreen
              book={selectedBook}
              onPlay={() => selectedBook && openPlayer(selectedBook)}
              onBack={() => setScreen("home")}
            />
          )}
          {screen === "player" && (
            <PlayerScreen
              book={selectedBook}
              playing={playing}
              onTogglePlay={() => setPlaying((p) => !p)}
              onBack={() => setScreen("detail")}
            />
          )}

          {/* Home indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-black/20 rounded-full z-20" />
        </div>
      </div>
    </div>
  );
}

function HomeScreen({ books, onOpenDetail, onOpenPlayer }: { books: Book[]; onOpenDetail: (b: Book) => void; onOpenPlayer: (b: Book) => void }) {
  const featured = books.slice(0, 3);
  const newArrivals = books.slice(5, 8);

  return (
    <div className="absolute inset-0 bg-[#f2f2f7] flex flex-col pt-11">
      {/* Scrollable body */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden pb-14"
        style={{ scrollbarWidth: "none" } as React.CSSProperties}
      >
        {/* Search bar */}
        <div className="px-4 pb-3">
          <div className="bg-white rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
            <span className="text-gray-400 text-[11px]">🔍</span>
            <span className="text-gray-400 text-[11px]">Search audiobooks...</span>
          </div>
        </div>

        {/* Featured Today */}
        <div className="px-4 pb-2 flex justify-between items-baseline">
          <p className="text-black text-[13px] font-bold">Featured Today</p>
        </div>
        <div
          className="flex gap-2.5 px-4 pb-4 overflow-x-auto"
          style={{ scrollbarWidth: "none" } as React.CSSProperties}
        >
          {featured.map((book) => (
            <button key={book.id} onClick={() => onOpenDetail(book)} className="flex-shrink-0 w-[88px] text-left">
              <Image
                src={`${book.remoteBaseURL}/${book.coverImageName}`}
                alt={book.title}
                width={176}
                height={176}
                className="rounded-xl object-cover w-full shadow-sm"
                style={{ aspectRatio: "1/1" }}
              />
              <p className="text-black text-[9px] font-semibold mt-1 leading-tight line-clamp-2">{book.title}</p>
              <p className="text-gray-500 text-[8px] truncate mt-0.5">{book.author}</p>
            </button>
          ))}
        </div>

        {/* New Arrivals */}
        <div className="px-4 pb-2">
          <p className="text-black text-[13px] font-bold">New Arrivals</p>
        </div>
        <div
          className="flex gap-2.5 px-4 pb-4 overflow-x-auto"
          style={{ scrollbarWidth: "none" } as React.CSSProperties}
        >
          {newArrivals.map((book) => (
            <button key={book.id} onClick={() => onOpenDetail(book)} className="flex-shrink-0 w-[88px] text-left">
              <Image
                src={`${book.remoteBaseURL}/${book.coverImageName}`}
                alt={book.title}
                width={176}
                height={176}
                className="rounded-xl object-cover w-full shadow-sm"
                style={{ aspectRatio: "1/1" }}
              />
              <p className="text-black text-[9px] font-semibold mt-1 leading-tight line-clamp-2">{book.title}</p>
              <p className="text-gray-500 text-[8px] truncate mt-0.5">{book.author}</p>
            </button>
          ))}
        </div>

        {/* All Audiobooks header */}
        <div className="px-4 pb-2">
          <p className="text-black text-[13px] font-bold">All Audiobooks</p>
        </div>
        <div className="px-4 space-y-1">
          {books.slice(0, 4).map((book) => (
            <div key={book.id} className="w-full flex items-center gap-3 py-1.5">
              <button onClick={() => onOpenDetail(book)} className="flex-shrink-0">
                <Image
                  src={`${book.remoteBaseURL}/${book.coverImageName}`}
                  alt={book.title}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                  style={{ width: 40, height: 40 }}
                />
              </button>
              <button onClick={() => onOpenDetail(book)} className="min-w-0 flex-1 text-left">
                <p className="text-black text-[10px] font-semibold truncate">{book.title}</p>
                <p className="text-gray-500 text-[9px] truncate">{book.author}</p>
                <p className="text-gray-400 text-[9px]">{formatDuration(book.duration)}</p>
              </button>
              <button onClick={() => onOpenPlayer(book)} className="flex-shrink-0 p-1">
                <span className="text-gray-300 text-[10px]">▶</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-white/90 backdrop-blur-sm border-t border-gray-200/80 flex items-center justify-around px-6 pb-3 z-10">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[16px]">🏠</span>
          <span className="text-blue-500 text-[8px] font-semibold">Home</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[16px] opacity-50">🕐</span>
          <span className="text-gray-400 text-[8px]">History</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[16px] opacity-50">⚙️</span>
          <span className="text-gray-400 text-[8px]">Settings</span>
        </div>
      </div>
    </div>
  );
}

function DetailScreen({ book, onPlay, onBack }: { book: Book | null; onPlay: () => void; onBack: () => void }) {
  if (!book) return null;
  const coverUrl = `${book.remoteBaseURL}/${book.coverImageName}`;
  const chapters = ["Introduction", "Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4"];

  return (
    <div className="absolute inset-0 bg-white flex flex-col pt-11">
      {/* Nav bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 flex-shrink-0">
        <button onClick={onBack} className="text-black text-lg font-light px-1">‹</button>
        <p className="text-black text-[11px] font-semibold truncate max-w-[180px]">{book.title}</p>
        <button className="text-gray-400 text-sm px-1">•••</button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-14" style={{ scrollbarWidth: "none" } as React.CSSProperties}>
        {/* Cover with play button */}
        <div className="px-5 pt-4 pb-3 relative">
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={coverUrl}
              alt={book.title}
              width={400}
              height={400}
              className="object-cover w-full"
              style={{ aspectRatio: "1/1" }}
            />
            {/* Play button overlay */}
            <button
              onClick={onPlay}
              className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-white shadow-xl flex items-center justify-center"
            >
              <span className="text-blue-500 text-base ml-0.5">▶</span>
            </button>
          </div>
        </div>

        {/* Title + author */}
        <div className="px-5 pb-2">
          <p className="text-black text-[15px] font-bold leading-tight">{book.title}</p>
          <p className="text-gray-500 text-[12px] mt-0.5">{book.author}</p>
        </div>

        {/* Duration */}
        <div className="px-5 pb-3 flex items-center gap-1.5">
          <span className="text-gray-400 text-[10px]">⏱</span>
          <span className="text-gray-500 text-[11px]">{formatDuration(book.duration)}</span>
        </div>

        {/* About */}
        <div className="px-5 pb-3">
          <p className="text-black text-[12px] font-bold mb-1">About</p>
          <p className="text-gray-500 text-[10px] leading-relaxed">
            Audiobook version of {book.title}
          </p>
        </div>

        {/* Chapters */}
        <div className="px-5">
          <div className="flex justify-between items-baseline mb-2">
            <p className="text-black text-[12px] font-bold">Chapters</p>
            <p className="text-gray-400 text-[10px]">{chapters.length}</p>
          </div>
          <div className="space-y-1.5">
            {chapters.map((ch) => (
              <button
                key={ch}
                onClick={onPlay}
                className="w-full flex items-center justify-between bg-gray-100 rounded-xl px-3 py-2.5"
              >
                <span className="text-black text-[11px]">{ch}</span>
                <span className="text-gray-400 text-[10px]">▶</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="absolute bottom-0 left-0 right-0 h-14 bg-white/90 backdrop-blur-sm border-t border-gray-200/80 flex items-center justify-around px-6 pb-3 z-10">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[16px]">🏠</span>
          <span className="text-blue-500 text-[8px] font-semibold">Home</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[16px] opacity-50">🕐</span>
          <span className="text-gray-400 text-[8px]">History</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[16px] opacity-50">⚙️</span>
          <span className="text-gray-400 text-[8px]">Settings</span>
        </div>
      </div>
    </div>
  );
}

function PlayerScreen({
  book,
  playing,
  onTogglePlay,
  onBack,
}: {
  book: Book | null;
  playing: boolean;
  onTogglePlay: () => void;
  onBack: () => void;
}) {
  if (!book) return null;
  const coverUrl = `${book.remoteBaseURL}/${book.coverImageName}`;

  return (
    <div className="absolute inset-0 bg-white flex flex-col pt-11">
      {/* Drag handle */}
      <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
        <div className="w-10 h-1 bg-gray-300 rounded-full" />
      </div>

      {/* Back + title */}
      <div className="flex items-center justify-between px-4 pb-2 flex-shrink-0">
        <button onClick={onBack} className="text-black/70 text-sm font-light p-1">‹</button>
        <p className="text-black text-[11px] font-semibold truncate max-w-[180px]">{book.title}</p>
        <button className="text-black/40 text-sm p-1">•••</button>
      </div>

      {/* Cover art */}
      <div className="px-8 pb-3 flex-shrink-0">
        <div className="relative">
          <Image
            src={coverUrl}
            alt={book.title}
            width={400}
            height={400}
            className="rounded-2xl object-cover w-full shadow-2xl"
            style={{ aspectRatio: "1/1" }}
          />
        </div>
      </div>

      {/* Track info */}
      <div className="px-6 pb-3 flex-shrink-0 text-center">
        <p className="text-black text-[15px] font-bold leading-tight">{book.title}</p>
        <p className="text-gray-500 text-[12px] mt-0.5">{book.author}</p>
        <p className="text-gray-400 text-[11px] mt-0.5">Introduction</p>
      </div>

      {/* Progress bar */}
      <div className="px-6 pb-2 flex-shrink-0">
        <div className="relative w-full h-1 rounded-full bg-gray-200">
          <div className="absolute left-0 top-0 h-full w-4/5 bg-black rounded-full" />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-gray-300 rounded-full shadow-md"
            style={{ left: "calc(80% - 7px)" }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-gray-400 text-[9px]">0:16</span>
          <span className="text-gray-400 text-[9px]">0:19</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-4 px-6 pb-3 flex-shrink-0">
        <button className="text-black text-base p-1">⏮</button>
        <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">
          <span className="text-black text-[9px] font-semibold leading-none">↺<br/>15</span>
        </button>
        <button
          onClick={onTogglePlay}
          className="w-12 h-12 rounded-full bg-black flex items-center justify-center shadow-lg"
        >
          <span className="text-white text-sm select-none">{playing ? "⏸" : "▶"}</span>
        </button>
        <button className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">
          <span className="text-black text-[9px] font-semibold leading-none">↻<br/>30</span>
        </button>
        <button className="text-black text-base p-1">⏭</button>
      </div>

      {/* Speed */}
      <div className="flex justify-center flex-shrink-0">
        <div className="bg-gray-100 rounded-lg px-4 py-1.5">
          <span className="text-black text-[11px] font-semibold">1.2×</span>
        </div>
      </div>
    </div>
  );
}
