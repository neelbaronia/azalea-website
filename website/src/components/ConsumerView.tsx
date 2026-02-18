"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

const ICON_DEFS = [
  { size: 64, bg: "rgba(255,255,255,0.12)" },
  { size: 52, bg: "rgba(255,255,255,0.08)" },
  { size: 56, bg: "rgba(255,255,255,0.12)" },
  { size: 44, bg: "rgba(255,255,255,0.08)" },
  { size: 72, bg: "rgba(255,255,255,0.10)" },
  { size: 68, bg: "rgba(255,255,255,0.12)" },
  { size: 56, bg: "rgba(255,255,255,0.08)" },
  { size: 48, bg: "rgba(255,255,255,0.10)" },
  { size: 60, bg: "rgba(255,255,255,0.12)" },
  { size: 52, bg: "rgba(255,255,255,0.08)" },
];

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  bg: string;
}

function HandwrittenHeading({ lines, className = "" }: { lines: string[]; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  let charIndex = 0;

  return (
    <h2
      ref={ref}
      className={`text-4xl md:text-6xl font-bold leading-[1.1] ${className}`}
      style={{ fontFamily: "var(--font-caveat), cursive" }}
    >
      {lines.map((line, lineIdx) => (
        <React.Fragment key={lineIdx}>
          {lineIdx > 0 && <br />}
          {line.split("").map((char) => {
            const idx = charIndex++;
            return (
              <motion.span
                key={idx}
                initial={{ opacity: 0, y: 5 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 5 }}
                transition={{ duration: 0.12, delay: idx * 0.04 }}
              >
                {char}
              </motion.span>
            );
          })}
        </React.Fragment>
      ))}
    </h2>
  );
}

function FloatingIcons({ containerRef }: { containerRef: React.RefObject<HTMLElement | null> }) {
  const ballsRef = useRef<Ball[]>([]);
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([]);
  const animRef = useRef<number>(0);
  const initialized = useRef(false);

  const init = useCallback(() => {
    const el = containerRef.current;
    if (!el || initialized.current) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w === 0 || h === 0) return;
    initialized.current = true;

    ballsRef.current = ICON_DEFS.map((def) => {
      const speed = 0.4 + Math.random() * 0.6;
      const angle = Math.random() * Math.PI * 2;
      return {
        x: def.size + Math.random() * (w - def.size * 2),
        y: def.size + Math.random() * (h - def.size * 2),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: def.size,
        bg: def.bg,
      };
    });
    setPositions(ballsRef.current.map((b) => ({ x: b.x, y: b.y })));
  }, [containerRef]);

  useEffect(() => {
    init();
    // Also try on a short delay in case container isn't sized yet
    const timer = setTimeout(init, 100);
    return () => clearTimeout(timer);
  }, [init]);

  useEffect(() => {
    let lastTime = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - lastTime) / 16, 3); // normalize to ~60fps, cap at 3x
      lastTime = now;

      const el = containerRef.current;
      if (!el) { animRef.current = requestAnimationFrame(step); return; }
      const w = el.clientWidth;
      const h = el.clientHeight;
      const balls = ballsRef.current;

      // Move balls
      for (const b of balls) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Bounce off walls
        if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx); }
        if (b.x + b.size > w) { b.x = w - b.size; b.vx = -Math.abs(b.vx); }
        if (b.y < 0) { b.y = 0; b.vy = Math.abs(b.vy); }
        if (b.y + b.size > h) { b.y = h - b.size; b.vy = -Math.abs(b.vy); }
      }

      // Ball-to-ball collisions (elastic, using center + radius)
      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i];
          const b = balls[j];
          const ax = a.x + a.size / 2;
          const ay = a.y + a.size / 2;
          const bx = b.x + b.size / 2;
          const by = b.y + b.size / 2;
          const dx = bx - ax;
          const dy = by - ay;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = (a.size + b.size) / 2;

          if (dist < minDist && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;
            // Relative velocity along collision normal
            const dvx = a.vx - b.vx;
            const dvy = a.vy - b.vy;
            const dvn = dvx * nx + dvy * ny;

            if (dvn > 0) {
              // Equal mass elastic collision
              a.vx -= dvn * nx;
              a.vy -= dvn * ny;
              b.vx += dvn * nx;
              b.vy += dvn * ny;
            }

            // Separate overlapping balls
            const overlap = (minDist - dist) / 2;
            a.x -= overlap * nx;
            a.y -= overlap * ny;
            b.x += overlap * nx;
            b.y += overlap * ny;
          }
        }
      }

      setPositions(balls.map((b) => ({ x: b.x, y: b.y })));
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [containerRef]);

  if (positions.length === 0) return null;

  return (
    <>
      {ICON_DEFS.map((def, i) => (
        <div
          key={i}
          className="absolute rounded-2xl shadow-sm backdrop-blur-sm"
          style={{
            width: def.size,
            height: def.size,
            backgroundColor: def.bg,
            transform: `translate(${positions[i]?.x ?? 0}px, ${positions[i]?.y ?? 0}px)`,
            top: 0,
            left: 0,
            willChange: "transform",
          }}
        />
      ))}
    </>
  );
}

export default function ConsumerView() {
  const heroRef = useRef<HTMLElement>(null);

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory bg-[#f5f0e8] text-black relative">
      {/* Sticky top banner with logo */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center px-6 py-4">
        <img src="/azalea-icon.png" alt="Azalea" className="w-10 h-10" />
        <div className="ml-3 flex flex-col leading-tight">
          <span className="text-white text-sm font-extrabold uppercase tracking-[0.2em]">Azalea</span>
          <span className="text-white text-sm font-extrabold uppercase tracking-[0.2em]">Labs</span>
        </div>
      </div>

      {/* Hero */}
      <section ref={heroRef} className="relative h-screen w-full flex items-center justify-center snap-start snap-always overflow-hidden" style={{ backgroundImage: "url('/hero-bg.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
        {/* Floating icons with physics */}
        <FloatingIcons containerRef={heroRef} />

        <div className="text-center space-y-8 max-w-3xl px-10 relative z-10 w-full">
          <div className="relative inline-block">
            {/* "Listen." written above in ink */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.8 }}
              className="absolute -top-10 md:-top-18 left-1/2 -translate-x-1/2 text-5xl md:text-8xl font-bold text-white whitespace-nowrap"
              style={{ fontFamily: "var(--font-caveat), cursive" }}
            >
              {/* Animate each letter with stagger */}
              {"Listen.".split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: 1.8 + i * 0.08 }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="text-5xl md:text-8xl font-bold tracking-tight leading-[1.05] relative text-white"
            >
              Read.
              {/* Strikethrough line */}
              <svg
                className="absolute top-1/2 left-0 w-full h-4 -translate-y-1/2 overflow-visible"
                viewBox="0 0 300 16"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M -5 8 Q 50 4, 100 9 T 200 7 T 305 8"
                  fill="none"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 1.2, ease: "easeInOut" }}
                />
              </svg>
            </motion.h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl text-white/70 font-light leading-relaxed max-w-xl mx-auto"
          >
            Books, Audiobooks, Blogs, and Podcasts, all in the world&apos;s largest audio library.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="flex items-stretch w-full mx-auto shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
              <input
                type="email"
                placeholder="you@email.com"
                className="min-w-0 w-full px-8 py-5 bg-white/10 backdrop-blur-md text-white text-sm font-light outline-none placeholder:text-white/40 rounded-l-xl border border-r-0 border-white/20"
              />
              <button className="shrink-0 px-10 py-5 bg-white text-black text-sm font-bold uppercase tracking-[0.2em] hover:bg-white/90 transition-all whitespace-nowrap rounded-r-xl">
                Join the Waitlist
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 1: Art of Listening */}
      <section
        className="relative h-screen w-full flex items-center snap-start snap-always overflow-hidden"
        style={{ backgroundImage: "url('/section-art-1.png')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent pointer-events-none" />

        {/* Text overlay */}
        <div className="relative z-10 w-full md:w-1/2 p-8 md:p-16">
          <div className="max-w-lg space-y-6">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xs uppercase tracking-[0.5em] text-white/50"
            >
              The Modern Library of Alexandria
            </motion.p>
            <HandwrittenHeading lines={["An endless library."]} className="text-white" />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg text-white/60 font-light leading-relaxed"
            >
              Step inside the new Alexandria—a boundless collection of stories, voices, and knowledge at your fingertips. Explore an infinite shelf, where every title invites discovery and every listen expands your world.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Section 2: Stories Within Stories */}
      <section
        className="relative h-screen w-full flex items-center snap-start snap-always overflow-hidden"
        style={{ backgroundImage: "url('/section-art-2.png')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent pointer-events-none" />

        {/* Text overlay */}
        <div className="relative z-10 w-full md:w-1/2 p-8 md:p-16">
          <div className="max-w-lg space-y-6">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-xs uppercase tracking-[0.5em] text-white/50"
            >
              Stories Within Stories
            </motion.p>
            <HandwrittenHeading lines={["Dive deeper", "into every story."]} className="text-white" />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg text-white/60 font-light leading-relaxed"
            >
              Immerse yourself as you scroll—each turn reveals a spotlight on a different book, letting you explore not just the library, but the journeys within. Discover unexpected connections and go beyond the surface with every selection.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative h-screen w-full flex items-center justify-center snap-start snap-always overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bhutan-dzong.png')" }}
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="text-center space-y-8 max-w-2xl px-6 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] text-white"
          >
            Coming to your pocket in 2026.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-white/70 font-light"
          >
            Be the first to hear the difference.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex items-stretch w-full max-w-lg mx-auto shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
              <input
                type="email"
                placeholder="you@email.com"
                className="min-w-0 w-full px-8 py-5 bg-white text-black text-sm font-light outline-none placeholder:text-black/30 rounded-l-xl border border-r-0 border-black/10"
              />
              <button className="shrink-0 px-10 py-5 bg-black text-white text-sm font-bold uppercase tracking-[0.2em] hover:bg-black/90 transition-all whitespace-nowrap rounded-r-xl">
                Get Early Access
              </button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
