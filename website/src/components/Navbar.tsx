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
        <Image src="/azalea-icon.png" alt="Azalea" width={40} height={40} className="w-10 h-10" />
        <div className="flex flex-col leading-tight">
          <span className={`text-sm font-extrabold uppercase tracking-[0.2em] transition-colors duration-500 ${isDark ? "text-white" : "text-black"}`}>Azalea</span>
          <span className={`text-sm font-extrabold uppercase tracking-[0.2em] transition-colors duration-500 ${isDark ? "text-white" : "text-black"}`}>Labs</span>
        </div>
      </div>

      <div
        className={`absolute left-1/2 -translate-x-1/2 flex gap-1 rounded-xl p-1 border backdrop-blur-md transition-colors duration-500 ${
          isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/5"
        }`}
      >
        <button
          onClick={() => setActiveTab("listen")}
          className={`relative px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors rounded-lg ${
            activeTab === "listen"
              ? isDark ? "text-black" : "text-white"
              : isDark ? "text-white/50 hover:text-white" : "text-black/40 hover:text-black"
          }`}
        >
          {activeTab === "listen" && (
            <motion.div
              layoutId="tab-active"
              className={`absolute inset-0 rounded-lg ${isDark ? "bg-white" : "bg-black"}`}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">Listen</span>
        </button>

        <button
          onClick={() => setActiveTab("create")}
          className={`relative px-5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors rounded-lg ${
            activeTab === "create"
              ? isDark ? "text-black" : "text-white"
              : isDark ? "text-white/50 hover:text-white" : "text-black/40 hover:text-black"
          }`}
        >
          {activeTab === "create" && (
            <motion.div
              layoutId="tab-active"
              className={`absolute inset-0 rounded-lg ${isDark ? "bg-white" : "bg-black"}`}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <span className="relative z-10">Create &amp; Distribute</span>
        </button>
      </div>

      <div className="hidden md:block w-[120px]" />
    </nav>
  );
}
