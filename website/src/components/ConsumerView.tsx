"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import PhoneMockup from "./PhoneMockup";

interface Book {
  id: string;
  title: string;
  author: string;
  coverImageName: string;
  remoteBaseURL: string;
  duration: number;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

const COVER_SIZES = [132, 115, 142, 120, 144, 126, 113, 134, 122, 138];

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
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

function FloatingIcons({ containerRef, books }: { containerRef: React.RefObject<HTMLElement | null>; books: Book[] }) {
  const ballsRef = useRef<Ball[]>([]);
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoveredRef = useRef<number | null>(null);
  const animRef = useRef<number>(0);
  const initialized = useRef(false);

  useEffect(() => { hoveredRef.current = hoveredIndex; }, [hoveredIndex]);

  const init = useCallback(() => {
    const el = containerRef.current;
    if (!el || initialized.current || books.length === 0) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (w === 0 || h === 0) return;
    initialized.current = true;

    ballsRef.current = books.map((_, i) => {
      const size = COVER_SIZES[i % COVER_SIZES.length];
      const speed = 0.4 + Math.random() * 0.6;
      const angle = Math.random() * Math.PI * 2;
      return {
        x: size + Math.random() * (w - size * 2),
        y: size + Math.random() * (h - size * 2),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size,
      };
    });
    setPositions(ballsRef.current.map((b) => ({ x: b.x, y: b.y })));
  }, [containerRef, books]);

  useEffect(() => {
    initialized.current = false;
    init();
    const timer = setTimeout(init, 100);
    return () => clearTimeout(timer);
  }, [init]);

  useEffect(() => {
    let lastTime = performance.now();

    const step = (now: number) => {
      const dt = Math.min((now - lastTime) / 16, 3);
      lastTime = now;

      const el = containerRef.current;
      if (!el) { animRef.current = requestAnimationFrame(step); return; }
      const w = el.clientWidth;
      const h = el.clientHeight;
      const balls = ballsRef.current;
      const pinned = hoveredRef.current;

      for (let i = 0; i < balls.length; i++) {
        if (i === pinned) continue;
        const b = balls[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx); }
        if (b.x + b.size > w) { b.x = w - b.size; b.vx = -Math.abs(b.vx); }
        if (b.y < 0) { b.y = 0; b.vy = Math.abs(b.vy); }
        if (b.y + b.size > h) { b.y = h - b.size; b.vy = -Math.abs(b.vy); }
      }

      for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i];
          const b = balls[j];
          const ax = a.x + a.size / 2, ay = a.y + a.size / 2;
          const bx = b.x + b.size / 2, by = b.y + b.size / 2;
          const dx = bx - ax, dy = by - ay;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = (a.size + b.size) / 2;
          if (dist < minDist && dist > 0) {
            const nx = dx / dist, ny = dy / dist;
            const dvn = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
            if (dvn > 0) {
              if (i !== pinned) { a.vx -= dvn * nx; a.vy -= dvn * ny; }
              if (j !== pinned) { b.vx += dvn * nx; b.vy += dvn * ny; }
            }
            const overlap = (minDist - dist) / 2;
            if (i !== pinned) { a.x -= overlap * nx; a.y -= overlap * ny; }
            if (j !== pinned) { b.x += overlap * nx; b.y += overlap * ny; }
          }
        }
      }

      setPositions(balls.map((b) => ({ x: b.x, y: b.y })));
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [containerRef]);

  if (positions.length === 0 || books.length === 0) return null;

  return (
    <>
      {books.map((book, i) => {
        const size = COVER_SIZES[i % COVER_SIZES.length];
        const pos = positions[i] ?? { x: 0, y: 0 };
        const isHovered = hoveredIndex === i;
        const coverUrl = `${book.remoteBaseURL}/${book.coverImageName}`;

        return (
          <div
            key={book.id}
            className="absolute"
            style={{
              width: size,
              top: 0,
              left: 0,
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              willChange: "transform",
              zIndex: isHovered ? 20 : 1,
            }}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Cover image */}
            <Image
              src={coverUrl}
              alt={book.title}
              width={size * 2}
              height={size * 2}
              className="rounded-xl shadow-lg object-cover w-full"
              style={{ height: size, width: size }}
              draggable={false}
            />

            {/* Hover tooltip */}
            {isHovered && (() => {
              const containerWidth = containerRef.current?.clientWidth ?? 0;
              const onRightHalf = pos.x + size / 2 > containerWidth / 2;
              return (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-44 backdrop-blur-md bg-white/15 border border-white/25 rounded-xl p-3 shadow-xl pointer-events-none"
                  style={{
                    zIndex: 30,
                    ...(onRightHalf
                      ? { right: `calc(100% + 10px)` }
                      : { left: `calc(100% + 10px)` }),
                  }}
                >
                  <p className="text-white text-sm font-bold leading-tight line-clamp-2">{book.title}</p>
                  <p className="text-white/90 text-sm font-semibold mt-1">{book.author}</p>
                  <p className="text-white/75 text-xs font-semibold mt-1">{formatDuration(book.duration)}</p>
                </div>
              );
            })()}
          </div>
        );
      })}
    </>
  );
}

type FormState = "idle" | "loading" | "success" | "duplicate" | "error";

async function submitWaitlist(email: string): Promise<FormState> {
  const res = await fetch("/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (res.ok) return "success";
  if (res.status === 409) return "duplicate";
  return "error";
}

export default function ConsumerView() {
  const heroRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [phoneOffsetY, setPhoneOffsetY] = useState(10000);

  const [heroEmail, setHeroEmail] = useState("");
  const [footerEmail, setFooterEmail] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");

  useEffect(() => {
    fetch("/api/books")
      .then((r) => r.json())
      .then(setBooks)
      .catch(() => {});
  }, []);

  // Drive phone position 1:1 with scroll — same speed as page content
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const onScroll = () => {
      const scrollTop = container.scrollTop;
      const vh = window.innerHeight;
      // Section layout: hero=0, section1=vh, section2=2vh, footer=3vh
      let offsetY: number;
      if (scrollTop < vh) {
        offsetY = vh - scrollTop;        // below: enters from bottom
      } else if (scrollTop <= 2 * vh) {
        offsetY = 0;                     // centered across both content sections
      } else {
        offsetY = 2 * vh - scrollTop;   // above: exits toward top
      }
      setPhoneOffsetY(offsetY);
    };

    onScroll(); // set initial position
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  async function handleHeroSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formState === "loading") return;
    setFormState("loading");
    setFormState(await submitWaitlist(heroEmail));
  }

  async function handleFooterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formState === "loading") return;
    setFormState("loading");
    setFormState(await submitWaitlist(footerEmail));
  }

  return (
    <div ref={scrollContainerRef} className="h-screen overflow-y-auto snap-y snap-mandatory bg-[#f5f0e8] text-black relative">
      {/* Fixed phone — position driven 1:1 by scroll */}
      <div
        className="fixed top-1/2 left-1/2 z-40"
        style={{
          transform: `translate(-50%, calc(-50% + ${phoneOffsetY}px))`,
          pointerEvents: phoneOffsetY === 0 ? "auto" : "none",
        }}
      >
        {books.length > 0 && <PhoneMockup books={books} initialScreen="home" />}
      </div>


      {/* Hero */}
      <section ref={heroRef} className="relative h-screen w-full flex items-center justify-center snap-start snap-always overflow-hidden" style={{ backgroundImage: "url('/hero-bg.png')", backgroundSize: "cover", backgroundPosition: "center" }}>
        {/* Floating icons with physics */}
        <FloatingIcons containerRef={heroRef} books={books} />

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
            className="text-xl md:text-2xl text-white/90 font-semibold leading-relaxed max-w-xl mx-auto"
          >
            Audiobooks, Podcasts, and more in the world&apos;s largest audio library. Unlimited access for $9/mo.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {formState === "success" ? (
              <p className="text-white/90 font-semibold text-lg">You&apos;re on the list. We&apos;ll be in touch.</p>
            ) : (
              <form onSubmit={handleHeroSubmit} className="flex items-stretch w-full mx-auto shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={heroEmail}
                  onChange={(e) => setHeroEmail(e.target.value)}
                  required
                  className="min-w-0 w-full px-8 py-5 bg-white/10 backdrop-blur-md text-white text-sm font-light outline-none placeholder:text-white/40 rounded-l-xl border border-r-0 border-white/20"
                />
                <button
                  type="submit"
                  disabled={formState === "loading"}
                  className="shrink-0 px-10 py-5 bg-white text-black text-sm font-bold uppercase tracking-[0.2em] hover:bg-white/90 transition-all whitespace-nowrap rounded-r-xl disabled:opacity-60"
                >
                  {formState === "loading" ? "..." : "Join the Waitlist"}
                </button>
              </form>
            )}
            {formState === "duplicate" && <p className="text-white/60 text-xs mt-2">You&apos;re already on the list!</p>}
            {formState === "error" && <p className="text-red-300 text-xs mt-2">Something went wrong. Please try again.</p>}
          </motion.div>
        </div>
      </section>

      {/* Section 1: Art of Listening */}
      <section
        className="relative h-screen w-full flex items-center snap-start snap-always overflow-hidden"
        style={{ backgroundImage: "url('/section-art-1.png')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent pointer-events-none" />
        <div className="relative z-10 w-full md:w-2/5 p-8 md:p-16">
          <div className="max-w-sm space-y-6">
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
              Step inside the new Alexandria—a boundless collection of stories, voices, and knowledge at your fingertips.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Section 2: Stories Within Stories */}
      <section
        className="relative h-screen w-full flex items-center snap-start snap-always overflow-hidden"
        style={{ backgroundImage: "url('/section-art-2.png')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent pointer-events-none" />
        <div className="relative z-10 w-full md:w-2/5 p-8 md:p-16">
          <div className="max-w-sm space-y-6">
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
              Tap any book to dive in. Every title invites discovery and every listen expands your world.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section ref={footerRef} className="relative h-screen w-full flex items-center justify-center snap-start snap-always overflow-hidden">
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
            {formState === "success" ? (
              <p className="text-white/90 font-semibold text-lg">You&apos;re on the list. We&apos;ll be in touch.</p>
            ) : (
              <form onSubmit={handleFooterSubmit} className="flex items-stretch w-full max-w-lg mx-auto shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  required
                  className="min-w-0 w-full px-8 py-5 bg-white/10 backdrop-blur-md text-white text-sm font-light outline-none placeholder:text-white/40 rounded-l-xl border border-r-0 border-white/20"
                />
                <button
                  type="submit"
                  disabled={formState === "loading"}
                  className="shrink-0 px-10 py-5 bg-white text-black text-sm font-bold uppercase tracking-[0.2em] hover:bg-white/90 transition-all whitespace-nowrap rounded-r-xl disabled:opacity-60"
                >
                  {formState === "loading" ? "..." : "Get Early Access"}
                </button>
              </form>
            )}
            {formState === "duplicate" && <p className="text-white/70 text-xs mt-2">You&apos;re already on the list!</p>}
            {formState === "error" && <p className="text-red-300 text-xs mt-2">Something went wrong. Please try again.</p>}
          </motion.div>
        </div>
      </section>

    </div>
  );
}
