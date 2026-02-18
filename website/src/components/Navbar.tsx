"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface NavbarProps {
  activeTab: "listen" | "create";
  setActiveTab: (tab: "listen" | "create") => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const isDark = activeTab === "listen";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-6 bg-transparent">
      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8 overflow-hidden rounded-lg border border-white/10 shadow-sm">
          <Image
            src="/Stylized Azalea Logo Design.png"
            alt="Azalea Logo"
            fill
            className="object-cover scale-[1.7]"
          />
        </div>
        <span
          className={`font-black tracking-[0.3em] text-[10px] uppercase transition-colors duration-500 ${
            isDark ? "text-white/70" : "text-black"
          }`}
        >
          Azalea Labs
        </span>
      </div>

      <div
        className={`absolute left-1/2 -translate-x-1/2 flex gap-2 rounded-2xl p-1.5 border backdrop-blur-md transition-colors duration-500 ${
          isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/5"
        }`}
      >
        <button
          onClick={() => setActiveTab("listen")}
          className={`relative px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] transition-colors rounded-xl ${
            activeTab === "listen"
              ? isDark
                ? "text-black"
                : "text-white"
              : isDark
              ? "text-white/50 hover:text-white"
              : "text-black/40 hover:text-black"
          }`}
        >
          {activeTab === "listen" && (
            <motion.div
              layoutId="tab-active"
              className={`absolute inset-0 rounded-xl ${isDark ? "bg-white" : "bg-black"}`}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">Listen</span>
        </button>

        <button
          onClick={() => setActiveTab("create")}
          className={`relative px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors rounded-xl ${
            activeTab === "create"
              ? isDark
                ? "text-black"
                : "text-white"
              : isDark
              ? "text-white/50 hover:text-white"
              : "text-black/40 hover:text-black"
          }`}
        >
          {activeTab === "create" && (
            <motion.div
              layoutId="tab-active"
              className={`absolute inset-0 rounded-xl ${isDark ? "bg-white" : "bg-black"}`}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">Create &amp; Distribute</span>
        </button>
      </div>

      <div className="hidden md:block">
        <button
          className={`px-10 py-4 text-xs font-black uppercase tracking-[0.3em] rounded-xl transition-colors shadow-lg ${
            isDark
              ? "bg-white text-black hover:bg-white/90"
              : "bg-black text-white hover:bg-black/90"
          }`}
        >
          Waitlist
        </button>
      </div>
    </nav>
  );
}
