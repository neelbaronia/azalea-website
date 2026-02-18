"use client";

import React from "react";
import { motion } from "framer-motion";

// Pre-calculated waveform values (no Math.random to avoid hydration issues)
const waveformHeights = [35, 60, 45, 80, 55, 70, 40, 90, 65, 50, 85, 45, 75, 55, 95, 40, 70, 60, 45, 80, 55, 65, 40, 85];
const waveformDurations = [0.8, 0.9, 0.7, 1.0, 0.85, 0.75, 0.95, 0.8, 0.9, 0.7, 0.85, 1.0, 0.8, 0.9, 0.75, 0.95, 0.8, 0.7, 0.9, 0.85, 0.8, 0.75, 0.95, 0.8];
const barChartHeights = [40, 60, 50, 80, 70, 90, 75];
const dashboardItems = [
  { title: "The Midnight Library", stat: "8,400 hrs" },
  { title: "Project Hail Mary", stat: "6,200 hrs" },
  { title: "Dune", stat: "4,100 hrs" },
];

function WaveformVisual() {
  return (
    <div className="flex items-center gap-[3px] h-32 w-[240px]">
      {waveformHeights.map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 bg-black/20 rounded-full"
          animate={{ scaleY: [1, 0.12, 1] }}
          transition={{
            duration: waveformDurations[i],
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.04,
          }}
          style={{ height: `${h}%`, originY: 0.5 }}
        />
      ))}
    </div>
  );
}

function BlurredDashboard() {
  return (
    <div className="relative w-[240px] rounded-2xl overflow-hidden bg-white shadow-xl border border-black/5">
      {/* Blurred content */}
      <div className="p-4 blur-[2px] select-none pointer-events-none">
        <div className="text-[9px] font-bold text-black/30 uppercase tracking-widest mb-3">
          Publisher Dashboard
        </div>
        <div className="flex gap-1.5 mb-3">
          {[
            { label: "Hours", value: "24.8k" },
            { label: "Completion", value: "87%" },
            { label: "Payout", value: "$4.2k" },
          ].map((stat, i) => (
            <div key={i} className="flex-1 bg-black/[0.04] rounded-xl p-2">
              <div className="text-[8px] text-black/25 uppercase tracking-widest">{stat.label}</div>
              <div className="text-sm font-bold text-black">{stat.value}</div>
            </div>
          ))}
        </div>
        <div className="bg-black/[0.04] rounded-xl p-2.5 mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[8px] text-black/25 uppercase tracking-widest">Revenue</span>
            <span className="text-[8px] font-bold text-emerald-600">+12.4%</span>
          </div>
          <div className="flex items-end gap-0.5 h-10">
            {barChartHeights.map((h, i) => (
              <div key={i} className="flex-1 bg-black/15 rounded-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          {dashboardItems.map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-[8px] text-black/40 truncate">{item.title}</span>
              <span className="text-[8px] font-medium text-black/50 ml-2 flex-shrink-0">{item.stat}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Fade overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/75 pointer-events-none" />
      <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
        <span className="text-[8px] text-black/30 font-medium uppercase tracking-widest">Real-time Analytics</span>
      </div>
    </div>
  );
}

function PayoutInfographic() {
  return (
    <div className="w-[240px] space-y-4">
      {/* 50/50 Split Bar */}
      <div className="flex rounded-2xl overflow-hidden h-20 shadow-md border border-black/5">
        <div className="flex-1 bg-black flex flex-col items-center justify-center gap-0.5">
          <div className="text-white font-black text-2xl leading-none">50%</div>
          <div className="text-white/40 text-[9px] uppercase tracking-[0.2em] mt-0.5">You</div>
        </div>
        <div className="w-px bg-black/10" />
        <div className="flex-1 bg-[#ece9e3] flex flex-col items-center justify-center gap-0.5">
          <div className="text-black font-black text-2xl leading-none">50%</div>
          <div className="text-black/30 text-[9px] uppercase tracking-[0.2em] mt-0.5">Azalea</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: "$0.018", label: "per min" },
          { value: "Live", label: "payouts" },
          { value: "100%", label: "visible" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#ece9e3] rounded-xl p-3 text-center">
            <div className="text-sm font-bold text-black leading-tight">{stat.value}</div>
            <div className="text-[8px] text-black/30 uppercase tracking-widest mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Shared section wrapper for the 2/3 + 1/3 split layout
function SplitSection({
  eyebrow,
  headline,
  body,
  visual,
}: {
  eyebrow: string;
  headline: React.ReactNode;
  body: string;
  visual: React.ReactNode;
}) {
  return (
    <section className="relative h-screen w-full flex overflow-hidden snap-start snap-always">
      <div className="absolute top-0 left-0 right-0 h-px bg-black/[0.06]" />

      {/* Left: Text */}
      <div className="w-full md:w-2/3 h-full flex items-center justify-center px-6 md:px-24 relative z-10">
        <div className="max-w-xl w-full space-y-8">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-xs uppercase tracking-[0.5em] text-black/25"
          >
            {eyebrow}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] text-black"
          >
            {headline}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-black/50 font-light leading-relaxed"
          >
            {body}
          </motion.p>
        </div>
      </div>

      {/* Right: Visual */}
      <div className="hidden md:flex w-1/3 h-full items-center justify-center border-l border-black/[0.06] bg-[#ece9e3]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {visual}
        </motion.div>
      </div>
    </section>
  );
}

export default function PublisherView() {
  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory bg-[#f5f5f0] text-black">

      {/* Hero */}
      <section className="relative h-screen w-full flex items-center justify-center snap-start snap-always overflow-hidden">
        <div className="text-center space-y-8 max-w-3xl px-6 relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs uppercase tracking-[0.5em] text-black/30 font-medium"
          >
            For Publishers
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-5xl md:text-8xl font-bold tracking-tight leading-[1.05] text-black"
          >
            Your work,<br />amplified.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl text-black/50 font-light leading-relaxed max-w-xl mx-auto"
          >
            Professional production and global distribution across your backlist and new work.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <button className="px-12 py-4 bg-black text-white text-sm font-bold uppercase tracking-[0.3em] rounded-xl hover:bg-black/90 transition-all hover:scale-105 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
              Start a Project
            </button>
          </motion.div>
        </div>
      </section>

      {/* Section 1: Production Lab */}
      <SplitSection
        eyebrow="Revive Your Backlist"
        headline={<>Breathe new life into your catalog.</>}
        body="Give your backlist the renaissance it deserves with studio-quality audio productions and expert translations. We transform your past titles into immersive audio experiences, reaching fresh audiences and reinvigorating your stories for a global stage."
        visual={<WaveformVisual />}
      />

      {/* Section 2: Radical Transparency */}
      <SplitSection
        eyebrow="Global Reach, Instantly"
        headline={<>Share your stories<br />worldwide.</>}
        body="Distribute your work to a global audience, effortlessly. Azalea's app connects your content to listeners everywhere, in multiple languages—expanding your reach far beyond borders, all in one place."
        visual={<BlurredDashboard />}
      />

      {/* Section 3: Payout Model */}
      <SplitSection
        eyebrow="The Payout Model"
        headline={<>Earn more from<br />every minute.</>}
        body="Unlike models that pay only per title or purchase, we reward creators for every minute their work is actually heard—just like streaming music. With our 50/50 revenue share, your payouts reflect true listener engagement and consistently outpace major competitors."
        visual={<PayoutInfographic />}
      />

      {/* Footer CTA */}
      <section className="relative h-screen w-full flex items-center justify-center snap-start snap-always overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-black/[0.06]" />
        <div className="text-center space-y-8 max-w-2xl px-6 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] text-black"
          >
            Let&apos;s build the future of publishing.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-black/50 font-light"
          >
            Ready to bring your catalog to life?
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button className="px-12 py-4 border border-black/20 text-black text-sm font-bold uppercase tracking-[0.3em] rounded-xl hover:bg-black hover:text-white transition-all hover:scale-105">
              Contact our Studio Team
            </button>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
