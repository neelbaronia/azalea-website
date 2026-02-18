"use client";

import React from "react";

interface PhoneMockupProps {
  gif?: string;
}

export default function PhoneMockup({ gif }: PhoneMockupProps) {
  return (
    <div className="relative w-[240px] h-[510px]">
      {/* Phone Frame */}
      <div className="absolute inset-0 bg-[#0d0d0d] rounded-[3rem] border-[10px] border-[#1c1c1c] shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-white/5">
        {/* Screen */}
        <div className="relative w-full h-full bg-[#080808] overflow-hidden">
          {/* ASCII GIF Background */}
          {gif && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gif}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-25"
              aria-hidden="true"
            />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/85 pointer-events-none" />

          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-10 z-20 flex justify-between items-center px-6">
            <span className="text-[10px] font-medium text-white/40">9:41</span>
            <div className="flex gap-1.5 items-center opacity-40">
              <div className="w-3 h-2 rounded-sm border border-white/60" />
              <div className="w-3 h-3 rounded-full border border-white/60" />
            </div>
          </div>

          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-5 bg-black rounded-full z-30" />

          {/* Player UI */}
          <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 gap-3 pt-14">
            {/* Cover Art */}
            <div className="w-full aspect-square rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center mb-1 flex-shrink-0">
              <span className="text-white/10 text-5xl">♪</span>
            </div>

            {/* Track Info */}
            <div className="space-y-0.5 flex-shrink-0">
              <div className="text-white text-sm font-semibold tracking-tight truncate">The Midnight Library</div>
              <div className="text-white/40 text-xs">Matt Haig · Chapter 3</div>
            </div>

            {/* Progress */}
            <div className="space-y-1 flex-shrink-0">
              <div className="w-full h-px bg-white/10 rounded-full">
                <div className="w-1/3 h-full bg-white/50 rounded-full relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow" />
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-white/25 text-[9px]">12:40</span>
                <span className="text-white/25 text-[9px]">-38:20</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-8 pb-2 flex-shrink-0">
              <span className="text-white/25 text-base select-none">⏮</span>
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-lg">
                <span className="text-black text-lg ml-0.5 select-none">▶</span>
              </div>
              <span className="text-white/25 text-base select-none">⏭</span>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-0.5 bg-white/15 rounded-full z-20" />
        </div>
      </div>
    </div>
  );
}
