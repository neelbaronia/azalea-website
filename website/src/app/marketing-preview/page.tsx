"use client";

import React, { useState } from "react";
import Image from "next/image";

const MARKETING_BASE =
  "https://pub-bd2c6feacbbf476cb20e8345faedf6b3.r2.dev/marketing/clips/scottish-miscellany";
const COVER_URL =
  "https://pub-ee342152cf1149298fc3cb54a286f268.r2.dev/scottish-miscellany/cover.png";
const SPOTIFY_URL = "https://open.spotify.com/show/2jBj01WY6pxFM2f3q5DFmQ";
const CHAPTER = "ch03";

const INSTAGRAM_GRADIENT =
  "linear-gradient(135deg,#feda75 0%,#fa7e1e 25%,#d62976 50%,#962fbf 75%,#4f5bd5 100%)";

interface Platform {
  id: string;
  label: string;
  device: "phone" | "desktop";
  /** CSS background for the app-icon chip (solid color or gradient). */
  brand: string;
  caption: string;
}

// Captions are stored alongside each clip in R2 (caption.txt); mirrored here so
// they render without a client-side fetch (and without depending on bucket CORS).
const PLATFORMS: Platform[] = [
  {
    id: "instagram",
    label: "Instagram",
    device: "phone",
    brand: INSTAGRAM_GRADIENT,
    caption: `Unpack the surprising origins of Scotland's enduring symbols and global influence. From bagpipes to national flowers, chapter one of Scottish Miscellany offers a captivating journey into the real stories behind the legend.

🎧 Full audiobook on Spotify — link in our bio.

#scottishculture #historylovers #historicalfacts #audiobookmagic #bookstagramcommunity #learnsomethingnew`,
  },
  {
    id: "tiktok",
    label: "TikTok",
    device: "phone",
    brand: "#000000",
    caption: `Think kilts are just for show? Chapter one of Scottish Miscellany reveals the wild truths behind Scotland's most iconic traditions. Get ready to rethink everything.

🎧 Full audiobook on Spotify — link in our bio.

#scottishhistory #booktokhistory #scottishtrivia #culturalfacts #whatareyoureading #nonfictionreads`,
  },
  {
    id: "snapchat",
    label: "Snapchat",
    device: "phone",
    brand: "#FFFC00",
    caption: `Scotland's secrets? Chapter 1's got 'em.

🎧 Full audiobook on Spotify — link in our bio.

#scotland #history #facts`,
  },
  {
    id: "pinterest",
    label: "Pinterest",
    device: "phone",
    brand: "#E60023",
    caption: `Scottish Miscellany Audiobook: Uncover Scotland's History & Traditions

Explore the fascinating origins of Scottish traditions like kilts and bagpipes. Chapter one of Jonathan Green's Scottish Miscellany offers a rich collection of historical facts and cultural insights perfect for history buffs.

🎧 Full audiobook on Spotify — link in our bio.

#scotlandhistory #scottishheritage #culturalhistory #historicaltrivia #audiobookrecommendations #nonfictionbooks #learnaboutscotland`,
  },
  {
    id: "youtube",
    label: "YouTube",
    device: "desktop",
    brand: "#FF0000",
    caption: `Scottish History & Culture: Uncover the Real Origins of Kilts, Bagpipes & More | Jonathan Green

Ever wondered about the true stories behind Scotland's famous traditions? Chapter one of Scottish Miscellany dives into the surprising facts and global impact of Scottish heritage, offering fascinating insights you won't find anywhere else.

🎧 Full audiobook on Spotify: ${SPOTIFY_URL}

#scottishhistory #culturalheritage #jonathangreen #historydocumentary #audiobookexcerpt #historicalfacts #scottishdiaspora`,
  },
  {
    id: "x",
    label: "X",
    device: "desktop",
    brand: "#000000",
    caption: `Kilts, bagpipes, thistles: What do you *really* know? Chapter 1 of Scottish Miscellany debunks myths and reveals surprising truths.

🎧 Full audiobook on Spotify: ${SPOTIFY_URL}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    device: "desktop",
    brand: "#0A66C2",
    caption: `Enhance your cultural literacy with a deep dive into Scotland's profound historical and global influence. Chapter one of Jonathan Green's Scottish Miscellany provides a meticulously researched overview of the origins of iconic traditions, offering valuable insights into national identity and diaspora. Essential for anyone interested in historical context and cultural understanding.

🎧 Full audiobook on Spotify: ${SPOTIFY_URL}

#culturalhistory #globalimpact #historicalresearch #professionaldevelopment #knowledgeacquisition #scotlandfacts`,
  },
];

function clipUrl(id: string) {
  return `${MARKETING_BASE}/${CHAPTER}/${id}/clip.mp4`;
}
function posterUrl(id: string) {
  return `${MARKETING_BASE}/${CHAPTER}/${id}/poster.png`;
}

function BrandChip({ p }: { p: Platform }) {
  return (
    <span
      className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] shadow-sm ring-1 ring-black/5 flex-shrink-0"
      style={{ background: p.brand }}
    >
      <img src={`/logos/${p.id}.svg`} alt={`${p.label} logo`} className="w-1/2 h-1/2" />
    </span>
  );
}

function PhoneFrame({ p }: { p: Platform }) {
  return (
    <div className="mx-auto w-full max-w-[260px]">
      <div className="relative rounded-[2.75rem] bg-[#111] p-2.5 shadow-2xl ring-1 ring-black/30">
        {/* dynamic island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 h-5 w-20 rounded-full bg-black" />
        <video
          controls
          playsInline
          preload="none"
          poster={posterUrl(p.id)}
          className="block w-full aspect-[9/16] rounded-[2.1rem] object-cover bg-black"
        >
          <source src={clipUrl(p.id)} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
}

function DesktopFrame({ p }: { p: Platform }) {
  return (
    <div className="w-full">
      <div className="rounded-xl overflow-hidden shadow-2xl ring-1 ring-black/15 bg-[#1e1e1e]">
        {/* browser chrome */}
        <div className="flex items-center gap-2 px-3 py-2.5 bg-[#2b2b2b]">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          <div className="ml-3 flex-1 h-5 rounded-md bg-white/10" />
        </div>
        {/* viewport */}
        <div className="bg-black aspect-[16/9] flex items-center justify-center">
          <video
            controls
            playsInline
            preload="none"
            poster={posterUrl(p.id)}
            className="max-h-full max-w-full object-contain"
          >
            <source src={clipUrl(p.id)} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}

export default function MarketingPreview() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCaption = async (p: Platform) => {
    try {
      await navigator.clipboard.writeText(p.caption);
      setCopiedId(p.id);
      setTimeout(() => setCopiedId((c) => (c === p.id ? null : c)), 1800);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  const phones = PLATFORMS.filter((p) => p.device === "phone");
  const desktops = PLATFORMS.filter((p) => p.device === "desktop");

  const CaptionBlock = ({ p }: { p: Platform }) => (
    <div className="p-5 flex flex-col gap-3 flex-1">
      <p className="text-[#2c1810]/75 text-sm leading-relaxed whitespace-pre-line">
        {p.caption}
      </p>
      <div className="mt-auto flex items-center gap-3 pt-1">
        <button
          onClick={() => copyCaption(p)}
          className="px-3 py-1.5 rounded-lg bg-[#2c1810] text-white text-xs font-bold hover:bg-[#2c1810]/85 transition-colors"
        >
          {copiedId === p.id ? "Copied ✓" : "Copy caption"}
        </button>
        <a
          href={clipUrl(p.id)}
          download
          className="px-3 py-1.5 rounded-lg bg-[#2c1810]/5 text-[#2c1810]/70 text-xs font-bold hover:bg-[#2c1810]/10 transition-colors"
        >
          Download clip
        </a>
      </div>
    </div>
  );

  const CardHeader = ({ p }: { p: Platform }) => (
    <div className="flex items-center gap-3 px-5 pt-4 pb-3">
      <BrandChip p={p} />
      <span className="text-[#2c1810] font-bold text-sm uppercase tracking-[0.12em]">
        {p.label}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf8f1]">
      {/* Header */}
      <header className="bg-[#2c1810] text-white">
        <div className="max-w-5xl mx-auto px-6 py-10 flex items-center gap-6">
          <Image
            src={COVER_URL}
            alt="Scottish Miscellany cover"
            width={120}
            height={120}
            className="rounded-lg shadow-lg flex-shrink-0"
            style={{ width: 120, height: 120, objectFit: "cover" }}
          />
          <div>
            <p className="text-amber-300/80 text-xs font-bold uppercase tracking-[0.2em] mb-1">
              Azalea Labs &middot; Marketing Preview
            </p>
            <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-garamond)]">
              Scottish Miscellany
            </h1>
            <p className="text-white/60 text-sm mt-1">by Jonathan Green</p>
            <p className="text-white/40 text-xs mt-2 font-[family-name:var(--font-garamond)] italic">
              Promo clips &amp; captions, previewed in-device per platform
            </p>
            <a
              href={SPOTIFY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-amber-300 hover:text-amber-200 text-xs font-bold uppercase tracking-[0.15em] mt-3 transition-colors"
            >
              Listen on Spotify
              <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Mobile placements */}
        <h2 className="text-[#2c1810]/50 text-xs font-bold uppercase tracking-[0.2em] mb-5">
          Mobile
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
          {phones.map((p) => (
            <article
              key={p.id}
              className="bg-white rounded-2xl shadow-sm border border-[#2c1810]/10 overflow-hidden flex flex-col"
            >
              <CardHeader p={p} />
              <div className="px-5 py-4 bg-[#faf8f1]/60">
                <PhoneFrame p={p} />
              </div>
              <CaptionBlock p={p} />
            </article>
          ))}
        </div>

        {/* Desktop placements */}
        <h2 className="text-[#2c1810]/50 text-xs font-bold uppercase tracking-[0.2em] mt-12 mb-5">
          Desktop
        </h2>
        <div className="grid grid-cols-1 gap-8 items-start">
          {desktops.map((p) => (
            <article
              key={p.id}
              className="bg-white rounded-2xl shadow-sm border border-[#2c1810]/10 overflow-hidden flex flex-col max-w-3xl"
            >
              <CardHeader p={p} />
              <div className="px-5 py-5 bg-[#faf8f1]/60">
                <DesktopFrame p={p} />
              </div>
              <CaptionBlock p={p} />
            </article>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#2c1810] text-white/40 text-center py-8 text-xs">
        <p>
          &copy; {new Date().getFullYear()} Azalea Labs &middot; Marketing preview
          for internal review
        </p>
      </footer>
    </div>
  );
}
