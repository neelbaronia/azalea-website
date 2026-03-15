"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface NavbarProps {
  activeTab: "listen" | "create";
  setActiveTab: (tab: "listen" | "create") => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const isDark = activeTab === "listen";
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between gap-3 px-4 md:px-8 py-3 md:py-6 bg-transparent">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Image src="/azalea-icon.webp" alt="Azalea" width={32} height={32} className="w-7 h-7 md:w-10 md:h-10" />
        <div className="flex flex-col leading-tight">
          <span className={`text-xs md:text-sm font-extrabold uppercase tracking-[0.2em] transition-colors duration-500 ${isDark ? "text-white" : "text-black"}`}>Azalea</span>
          <span className={`text-xs md:text-sm font-extrabold uppercase tracking-[0.2em] transition-colors duration-500 ${isDark ? "text-white" : "text-black"}`}>Labs</span>
        </div>
      </div>

      {/* Tab switcher */}
      <div
        className={`flex gap-0.5 rounded-xl p-1 border backdrop-blur-md transition-colors duration-500 flex-shrink min-w-0 ${
          isDark ? "bg-white/10 border-white/10" : "bg-black/5 border-black/5"
        }`}
      >
        <button
          onClick={() => setActiveTab("listen")}
          className={`relative px-3 md:px-5 py-1.5 md:py-2 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] transition-colors rounded-lg whitespace-nowrap ${
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
          className={`relative px-3 md:px-5 py-1.5 md:py-2 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] transition-colors rounded-lg whitespace-nowrap ${
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

      {/* Auth link */}
      <div className="flex-shrink-0">
        {user ? (
          <Link
            href="/account"
            className={`text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${
              isDark ? "text-white/70 hover:text-white" : "text-black/50 hover:text-black"
            }`}
          >
            Account
          </Link>
        ) : (
          <Link
            href="/login"
            className={`text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${
              isDark ? "text-white/70 hover:text-white" : "text-black/50 hover:text-black"
            }`}
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
