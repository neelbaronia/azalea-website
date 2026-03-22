"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface Book {
  id: string;
  title: string;
  author: string;
  coverImageName: string;
  remoteBaseURL: string;
  duration: number;
}

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

// Continent outlines as [lon, lat] arrays
const CONTINENTS: [number, number][][] = [
  // North America
  [[-80,25],[-82,28],[-81,30],[-80,32],[-77,35],[-75,37],[-70,42],[-67,44],[-60,46],[-55,47],[-56,50],[-60,60],[-65,67],[-80,73],[-100,73],[-130,70],[-148,70],[-168,72],[-168,57],[-155,58],[-148,60],[-145,62],[-138,60],[-132,54],[-128,50],[-124,46],[-122,38],[-118,34],[-117,32],[-110,23],[-105,20],[-95,16],[-90,16],[-88,15],[-85,16],[-83,10],[-77,8],[-75,11],[-80,25]],
  // South America
  [[-75,11],[-68,12],[-62,12],[-56,6],[-50,4],[-40,0],[-36,-3],[-35,-10],[-38,-16],[-40,-22],[-44,-23],[-48,-28],[-50,-30],[-52,-33],[-56,-38],[-62,-40],[-65,-42],[-66,-46],[-68,-50],[-68,-52],[-75,-54],[-68,-54],[-65,-44],[-65,-38],[-68,-30],[-70,-18],[-75,-10],[-78,-2],[-78,5],[-75,11]],
  // Europe
  [[-9,36],[-5,36],[0,37],[3,43],[5,43],[8,44],[12,44],[14,42],[16,41],[15,38],[20,40],[24,38],[28,37],[36,37],[42,41],[32,46],[28,52],[24,57],[20,60],[16,62],[20,65],[24,68],[28,70],[18,70],[10,72],[5,62],[8,58],[8,55],[5,54],[8,48],[2,49],[0,47],[-2,44],[-5,44],[-9,44],[-9,40],[-9,36]],
  // Africa
  [[-18,15],[-16,20],[-17,28],[-12,33],[-5,36],[5,37],[12,38],[25,37],[36,32],[44,12],[51,12],[44,2],[42,-11],[40,-22],[35,-28],[28,-34],[18,-34],[12,-22],[8,-4],[8,4],[2,5],[-5,4],[-8,4],[-16,8],[-18,15]],
  // Asia (main + India peninsula)
  [[28,37],[42,37],[52,37],[60,22],[68,23],[72,22],[77,8],[80,8],[82,14],[88,22],[92,22],[95,27],[92,22],[100,2],[108,2],[120,4],[122,4],[128,10],[122,24],[122,32],[126,33],[130,37],[130,43],[122,50],[115,55],[105,60],[85,68],[70,72],[55,72],[40,70],[30,65],[28,57],[30,46],[36,42],[42,41],[36,37],[28,37]],
  // Australia
  [[114,-22],[122,-18],[128,-14],[130,-12],[136,-12],[140,-10],[142,-10],[148,-20],[152,-26],[154,-28],[152,-38],[148,-40],[142,-38],[138,-36],[132,-32],[124,-34],[120,-34],[114,-28],[114,-22]],
  // Greenland
  [[-18,76],[-20,78],[-30,83],[-50,83],[-60,80],[-65,78],[-60,76],[-50,72],[-46,70],[-40,68],[-22,70],[-18,76]],
  // Japan
  [[130,31],[132,34],[134,35],[136,36],[140,40],[141,42],[140,40],[138,36],[136,34],[132,33],[130,31]],
  // Indonesia / Borneo (simplified)
  [[95,5],[100,2],[106,-6],[108,-8],[112,-8],[116,-8],[118,-4],[120,-2],[118,4],[112,4],[106,2],[102,2],[98,4],[95,5]],
  // New Zealand (South Island approx)
  [[166,-46],[168,-44],[171,-42],[174,-41],[172,-44],[170,-46],[166,-46]],
];

const GLOBE_NODES = [
  { id: "na", label: "EN", lon: -100, lat: 45 },
  { id: "sa", label: "ES", lon:  -58, lat: -15 },
  { id: "eu", label: "FR", lon:   10, lat:  50 },
  { id: "af", label: "SW", lon:   20, lat:   5 },
  { id: "in", label: "HI", lon:   80, lat:  20 },
  { id: "cn", label: "ZH", lon:  105, lat:  35 },
  { id: "jp", label: "JA", lon:  138, lat:  36 },
  { id: "au", label: "EN", lon:  135, lat: -25 },
];

const GLOBE_EDGES = [
  ["na","eu"],["eu","af"],["eu","in"],["in","cn"],
  ["cn","jp"],["cn","au"],["na","sa"],["sa","af"],
];

const GLOBE_R = 168;
const GLOBE_PAD = 55; // room for arcs to extend beyond globe edge
const GLOBE_SIZE = GLOBE_R * 2 + GLOBE_PAD * 2; // canvas size (436)
const GLOBE_CX = GLOBE_SIZE / 2;
const GLOBE_CY = GLOBE_SIZE / 2;

function globeProject(lon: number, lat: number, centerLon: number): [number, number, boolean] {
  const φ = lat * Math.PI / 180;
  const λ = (lon - centerLon) * Math.PI / 180;
  const cosC = Math.cos(φ) * Math.cos(λ);
  return [
    GLOBE_CX + GLOBE_R * Math.cos(φ) * Math.sin(λ),
    GLOBE_CY - GLOBE_R * Math.sin(φ),
    cosC > 0,
  ];
}

function toXYZ(lon: number, lat: number): [number, number, number] {
  const φ = lat * Math.PI / 180, λ = lon * Math.PI / 180;
  return [Math.cos(φ) * Math.cos(λ), Math.cos(φ) * Math.sin(λ), Math.sin(φ)];
}

function drawGreatCircle(ctx: CanvasRenderingContext2D, lon1: number, lat1: number, lon2: number, lat2: number, centerLon: number) {
  const p1 = toXYZ(lon1, lat1), p2 = toXYZ(lon2, lat2);
  const dot = Math.min(1, Math.max(-1, p1[0]*p2[0] + p1[1]*p2[1] + p1[2]*p2[2]));
  const angle = Math.acos(dot);
  if (angle < 0.001) return;
  const sinA = Math.sin(angle);
  const LIFT = 0.28; // how far arcs rise above globe surface

  ctx.beginPath();
  let penDown = false;
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const w1 = Math.sin((1 - t) * angle) / sinA;
    const w2 = Math.sin(t * angle) / sinA;
    const px = w1*p1[0] + w2*p2[0], py = w1*p1[1] + w2*p2[1], pz = w1*p1[2] + w2*p2[2];
    const lon = Math.atan2(py, px) * 180 / Math.PI;
    const lat = Math.asin(Math.min(1, Math.max(-1, pz))) * 180 / Math.PI;
    const [sx, sy, vis] = globeProject(lon, lat, centerLon);
    if (vis) {
      // Scale point outward from globe center — peaks at arc midpoint
      const s = 1 + LIFT * Math.sin(Math.PI * t);
      const lx = GLOBE_CX + (sx - GLOBE_CX) * s;
      const ly = GLOBE_CY + (sy - GLOBE_CY) * s;
      if (!penDown) { ctx.moveTo(lx, ly); penDown = true; } else ctx.lineTo(lx, ly);
    } else { penDown = false; }
  }
  ctx.stroke();
}

// Clip a polygon to the front hemisphere using Sutherland-Hodgman.
// Inserts exact horizon-crossing points so closePath() seals cleanly along the globe edge.
function clipToHorizon(coords: [number, number][], centerLon: number): [number, number][] {
  const result: [number, number][] = [];
  const λ0 = centerLon * Math.PI / 180;
  const vx = Math.cos(λ0), vy = Math.sin(λ0);

  for (let i = 0; i < coords.length; i++) {
    const [lon1, lat1] = coords[i];
    const [lon2, lat2] = coords[(i + 1) % coords.length];
    const p1 = toXYZ(lon1, lat1), p2 = toXYZ(lon2, lat2);
    const d1 = p1[0]*vx + p1[1]*vy;
    const d2 = p2[0]*vx + p2[1]*vy;
    const v1 = d1 > 0, v2 = d2 > 0;

    if (v1) result.push([lon1, lat1]);

    if (v1 !== v2) {
      // Binary-search for exact horizon crossing
      const dot = Math.min(1, Math.max(-1, p1[0]*p2[0] + p1[1]*p2[1] + p1[2]*p2[2]));
      const ang = Math.acos(dot), sinA = Math.sin(ang);
      if (sinA > 0.0001) {
        let lo = 0, hi = 1;
        for (let k = 0; k < 20; k++) {
          const m = (lo + hi) / 2;
          const w1 = Math.sin((1-m)*ang)/sinA, w2 = Math.sin(m*ang)/sinA;
          const dm = (w1*p1[0]+w2*p2[0])*vx + (w1*p1[1]+w2*p2[1])*vy;
          (d1 > 0 ? dm > 0 : dm < 0) ? (lo = m) : (hi = m);
        }
        const m = (lo+hi)/2, w1 = Math.sin((1-m)*ang)/sinA, w2 = Math.sin(m*ang)/sinA;
        const mx=w1*p1[0]+w2*p2[0], my=w1*p1[1]+w2*p2[1], mz=w1*p1[2]+w2*p2[2];
        result.push([Math.atan2(my,mx)*180/Math.PI, Math.asin(Math.min(1,Math.max(-1,mz)))*180/Math.PI]);
      }
    }
  }
  return result;
}

function renderGlobeBackground(ctx: CanvasRenderingContext2D, centerLon: number) {
  ctx.clearRect(0, 0, GLOBE_SIZE, GLOBE_SIZE);

  // Ocean
  ctx.beginPath(); ctx.arc(GLOBE_CX, GLOBE_CY, GLOBE_R, 0, Math.PI * 2);
  ctx.fillStyle = "#dedad2"; ctx.fill();

  ctx.save();
  ctx.beginPath(); ctx.arc(GLOBE_CX, GLOBE_CY, GLOBE_R, 0, Math.PI * 2); ctx.clip();

  // Grid
  ctx.strokeStyle = "rgba(0,0,0,0.07)"; ctx.lineWidth = 0.5;
  for (let lat = -60; lat <= 60; lat += 30) {
    ctx.beginPath();
    for (let lon = -180; lon <= 180; lon += 3) {
      const [x, y, vis] = globeProject(lon, lat, centerLon);
      if (vis) lon === -180 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  for (let lon = 0; lon < 360; lon += 30) {
    ctx.beginPath();
    for (let lat = -90; lat <= 90; lat += 3) {
      const [x, y, vis] = globeProject(lon, lat, centerLon);
      if (vis) lat === -90 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Continents — clipped to front hemisphere with proper horizon intersection points
  ctx.fillStyle = "rgba(0,0,0,0.18)";
  for (const coords of CONTINENTS) {
    const clipped = clipToHorizon(coords, centerLon);
    if (clipped.length < 3) continue;
    ctx.beginPath();
    for (let i = 0; i < clipped.length; i++) {
      const [x, y] = globeProject(clipped[i][0], clipped[i][1], centerLon);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fill();
  }

  ctx.restore();

  // Border
  ctx.beginPath(); ctx.arc(GLOBE_CX, GLOBE_CY, GLOBE_R, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0,0,0,0.12)"; ctx.lineWidth = 1; ctx.stroke();
}

function renderGlobeNodes(ctx: CanvasRenderingContext2D, centerLon: number) {
  // Animated flowing arcs
  const dashLen = 7, gapLen = 5, period = dashLen + gapLen;
  const offset = -(performance.now() * 0.05) % period;
  ctx.setLineDash([dashLen, gapLen]);
  ctx.lineDashOffset = offset;
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  for (const [a, b] of GLOBE_EDGES) {
    const na = GLOBE_NODES.find(n => n.id === a)!;
    const nb = GLOBE_NODES.find(n => n.id === b)!;
    drawGreatCircle(ctx, na.lon, na.lat, nb.lon, nb.lat, centerLon);
  }
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;

  for (const node of GLOBE_NODES) {
    const [x, y, vis] = globeProject(node.lon, node.lat, centerLon);
    if (!vis) continue;
    ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.fillStyle = "black"; ctx.fill();
    ctx.fillStyle = "white"; ctx.font = "bold 8px sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(node.label, x, y);
  }
}

function GlobeVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lonRef = useRef(0);
  const animRef = useRef<number>(0);
  const dragRef = useRef<{ dragging: boolean; lastX: number; velocity: number }>({ dragging: false, lastX: 0, velocity: 0 });
  const framesRef = useRef<ImageBitmap[]>([]);
  const [ready, setReady] = useState(false);

  // Pre-render all 360 frames once on mount
  useEffect(() => {
    const offscreen = document.createElement("canvas");
    offscreen.width = GLOBE_SIZE; offscreen.height = GLOBE_SIZE;
    const octx = offscreen.getContext("2d")!;

    (async () => {
      const bitmaps: ImageBitmap[] = [];
      for (let lon = 0; lon < 360; lon++) {
        renderGlobeBackground(octx, lon);
        bitmaps.push(await createImageBitmap(offscreen));
      }
      framesRef.current = bitmaps;
      setReady(true);
    })();
  }, []);

  // Animation + interaction (starts once frames are ready)
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const onMouseDown = (e: MouseEvent) => { dragRef.current = { dragging: true, lastX: e.clientX, velocity: 0 }; };
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.lastX;
      dragRef.current.velocity = -dx * 0.5;
      lonRef.current -= dx * 0.5;
      dragRef.current.lastX = e.clientX;
    };
    const onMouseUp = () => { dragRef.current.dragging = false; };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    const animate = () => {
      if (!dragRef.current.dragging) {
        if (Math.abs(dragRef.current.velocity) > 0.05) {
          lonRef.current += dragRef.current.velocity;
          dragRef.current.velocity *= 0.92;
        } else {
          lonRef.current += 0.25;
        }
      }
      const frameIdx = ((Math.round(lonRef.current) % 360) + 360) % 360;
      ctx.clearRect(0, 0, GLOBE_SIZE, GLOBE_SIZE);
      ctx.drawImage(framesRef.current[frameIdx], 0, 0);
      renderGlobeNodes(ctx, lonRef.current);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [ready]);

  return (
    <div style={{ width: GLOBE_SIZE, height: GLOBE_SIZE, position: "relative" }}>
      {!ready && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 10, color: "rgba(0,0,0,0.3)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Loading…</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={GLOBE_SIZE}
        height={GLOBE_SIZE}
        style={{ display: ready ? "block" : "none", cursor: "grab", width: GLOBE_SIZE, height: GLOBE_SIZE }}
        onMouseDown={() => { if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"; }}
        onMouseUp={() => { if (canvasRef.current) canvasRef.current.style.cursor = "grab"; }}
      />
    </div>
  );
}

const PAYOUT_BARS = [
  { label: "Audible", value: 50,  color: "bg-blue-800/60", textColor: "text-white/70", amount: "25%" },
  { label: "Spotify", value: 36,  color: "bg-blue-800/60", textColor: "text-white/70", amount: "18%" },
  { label: "Azalea",  value: 100, color: "bg-blue-900",    textColor: "text-white",    amount: "50%" },
];

function PayoutBarChart({ compact }: { compact?: boolean }) {
  const [inView, setInView] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`w-full space-y-2 md:space-y-4 ${compact ? "pl-6 max-w-[280px]" : "pl-10 max-w-[360px]"}`}>
      {/* Y-axis label */}
      <p className="text-xs font-bold uppercase tracking-widest text-white">% Revenue Payout to Publishers</p>

      {/* Chart */}
      <div className={`flex items-end gap-3 md:gap-4 border-b-2 border-l-2 border-white/40 pb-0 relative ${compact ? "h-28" : "h-28 md:h-64"}`}>
        {/* Y-axis $ label */}
        <div className="absolute -left-5 top-0 pointer-events-none">
          <span className="text-xs font-bold text-white/70">$</span>
        </div>
        {PAYOUT_BARS.map((bar, i) => (
          <div key={bar.label} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
            {/* Amount label above bar */}
            <span className={`text-xs font-bold ${bar.textColor}`}>
              {bar.amount}
            </span>
            {/* Bar */}
            <div className="w-full flex items-end" style={{ height: "100%" }}>
              <motion.div
                className={`w-full rounded-t-lg ${bar.color}`}
                initial={{ height: 0 }}
                animate={inView ? { height: `${bar.value}%` } : { height: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.34, 1.2, 0.64, 1] }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* X-axis labels */}
      <div className="flex gap-3 md:gap-4 px-2 md:px-3">
        {PAYOUT_BARS.map((bar) => (
          <div key={bar.label} className="flex-1 text-center">
            <span className={`text-xs font-semibold ${bar.label === "Azalea" ? "text-white" : "text-white/60"}`}>
              {bar.label}
            </span>
          </div>
        ))}
      </div>

      {/* Caption */}
      <p className="text-xs text-white/50 text-center">Publisher revenue share vs. major platforms</p>
    </div>
  );
}


// Option 3: Book cover with waveform growing out of its pages
function WaveformFromBook({ books }: { books: Book[] }) {
  const book = books[0];
  if (!book) return null;
  return (
    <div className="flex flex-col items-center gap-0">
      {/* Waveform above */}
      <div className="flex items-end gap-[3px] h-36 w-[260px] px-2">
        {waveformHeights.map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 bg-black/40 rounded-full"
            animate={{ scaleY: [1, 0.15, 1] }}
            transition={{ duration: waveformDurations[i], repeat: Infinity, ease: "easeInOut", delay: i * 0.04 }}
            style={{ height: `${h}%`, originY: 1 }}
          />
        ))}
      </div>
      {/* Book cover below */}
      <div className="relative">
        <Image
          src={`${book.remoteBaseURL}/${book.coverImageName}`}
          alt={book.title}
          width={520}
          height={520}
          className="rounded-2xl shadow-2xl object-cover"
          style={{ width: 260, height: 260 }}
        />
        {/* Glow connecting waveform to book */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/10 blur-md rounded-full" />
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
  mobileVisual,
  bgImage,
  invertText,
  noOverlay,
}: {
  eyebrow: string;
  headline: React.ReactNode;
  body: string;
  visual: React.ReactNode;
  mobileVisual?: React.ReactNode;
  bgImage?: string;
  invertText?: boolean;
  noOverlay?: boolean;
}) {
  return (
    <section className="relative h-screen w-full flex overflow-hidden snap-start snap-always">
      {bgImage && (
        <>
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('${bgImage}')`, transform: invertText ? undefined : "scaleX(-1)" }} />
          {!noOverlay && <div className={`absolute inset-0 ${invertText ? "bg-black/55" : "bg-white/30"}`} />}
        </>
      )}
      <div className="absolute top-0 left-0 right-0 h-px bg-black/[0.06]" />

      {/* Left: Text (+ mobile visual) */}
      <div className="w-full md:w-1/2 h-full flex flex-col items-center md:items-center justify-start md:justify-center pt-40 md:pt-0 pb-4 md:pb-0 px-6 md:px-16 relative z-10 overflow-y-auto">
        <div className="max-w-lg w-full space-y-4 md:space-y-8 text-center md:text-left">
          {eyebrow && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`text-xs uppercase tracking-[0.5em] ${invertText ? "text-white/50" : "text-black/25"}`}
            >
              {eyebrow}
            </motion.p>
          )}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className={`text-4xl md:text-6xl font-black tracking-tight leading-[1.1] ${invertText ? "text-white" : "text-black"}`}
            style={!invertText && bgImage ? { textShadow: "0 1px 8px rgba(255,255,255,0.6)" } : undefined}
          >
            {headline}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`text-base md:text-xl font-extrabold leading-relaxed ${invertText ? "text-white/90" : "text-black"}`}
            style={!invertText && bgImage ? { textShadow: "0 1px 6px rgba(255,255,255,0.5)" } : undefined}
          >
            {body}
          </motion.p>
          {/* Mobile-only visual below body text */}
          {(mobileVisual || visual) && (
            <div className="md:hidden flex justify-center pt-2">
              {mobileVisual ?? visual}
            </div>
          )}
        </div>
      </div>

      {/* Right: Visual (desktop only) */}
      <div className={`hidden md:flex w-1/2 h-full items-center justify-center relative z-10 ${invertText ? "" : bgImage ? "" : "bg-[#ece9e3]"}`}>
        {visual}
      </div>
    </section>
  );
}

export default function PublisherView() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    fetch("/api/books").then((r) => r.json()).then(setBooks).catch(() => {});
  }, []);

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory bg-[#f5f5f0] text-black">

      {/* Hero */}
      <section className="relative h-screen w-full flex items-center justify-center snap-start snap-always overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/publisher-hero-bg.webp')" }} />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="text-center space-y-8 max-w-3xl px-6 relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sm uppercase tracking-[0.5em] text-white font-bold"
          >
            For Publishers &amp; Creators
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-5xl md:text-8xl font-bold tracking-tight leading-[1.05] text-white"
          >
            Your work,<br />amplified.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl md:text-2xl text-white/70 font-semibold leading-relaxed max-w-xl mx-auto"
          >
            Professional audio production and global distribution across your backlist and new work.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <a
              href="mailto:neel@azalea-labs.com?subject=Inquiry%20about%20Production%20%26%20Distribution&body=Hi%2C%20I%27m%20reaching%20out%20about%20Azalea%27s%20audio%20production%20and%20distribution%20services."
              className="inline-block px-12 py-4 bg-black text-white text-sm font-bold uppercase tracking-[0.3em] rounded-xl hover:bg-black/90 transition-all hover:scale-105 shadow-[0_20px_60px_rgba(0,0,0,0.15)]"
            >
              Contact our Studio Team
            </a>
          </motion.div>
        </div>
      </section>

      {/* Section 1: Production Lab */}
      <SplitSection
        eyebrow=""
        headline={<>Breathe new life into your catalog.</>}
        body="Whether you're an independent author, a trade publisher with hundreds of titles, or even a blogger with an archive, we offer full-service audio production and publication. Bring your every work to life and reach fresh audiences eager to hear your stories for the first time."
        visual={<></>}
        bgImage="/publisher-backlist-bg.webp"
        noOverlay
      />

      {/* Section 2: Radical Transparency */}
      <SplitSection
        eyebrow=""
        headline={<>Share your stories<br />worldwide.</>}
        body="Beyond production, we seamlessly distribute your content to customers worldwide through the Azalea subscription app, connecting your work to listeners everywhere, in multiple languages, all in one place."
        visual={<></>}
        bgImage="/publisher-global-bg.webp"
      />

      {/* Section 3: Payout Model */}
      <SplitSection
        eyebrow=""
        headline={<>Earn more from<br />every minute.</>}
        body="Azalea listeners pay one all-you-can-eat subscription. Every minute they spend with your work earns you revenue. Unlike models that pay only per title or purchase, our 50/50 revenue share rewards true listener engagement and consistently outpaces major competitors."
        visual={<PayoutBarChart />}
        mobileVisual={<PayoutBarChart compact />}
        bgImage="/publisher-payout-bg.webp"
        invertText
      />

      {/* Footer CTA */}
      <section className="relative h-screen w-full flex items-center justify-center snap-start snap-always overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/publisher-desk-bg.webp')" }} />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
        <div className="text-center space-y-8 max-w-2xl px-6 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] text-white drop-shadow-md"
          >
            Let&apos;s build the future of publishing.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-2xl text-white/80 font-medium"
          >
            Ready to bring your catalog to life?
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <a
              href="mailto:neel@azalea-labs.com?subject=Inquiry%20about%20Production%20%26%20Distribution&body=Hi%2C%20I%27m%20reaching%20out%20about%20Azalea%27s%20audio%20production%20and%20distribution%20services."
              className="inline-block px-12 py-4 bg-white text-black text-sm font-bold uppercase tracking-[0.3em] rounded-xl hover:bg-white/90 transition-all hover:scale-105 shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
            >
              Contact our Studio Team
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-black text-white/60 snap-start">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-2">
            <p className="text-white font-bold text-sm uppercase tracking-[0.3em]">Azalea Labs</p>
            <p className="text-xs text-white/40">&copy; {new Date().getFullYear()} Azalea Labs. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
            <a href="mailto:neel@azalea-labs.com" className="hover:text-white transition-colors">Contact</a>
            <a href="/samples" className="hover:text-white transition-colors">Samples</a>
            <a href="/publications" className="hover:text-white transition-colors">Our Publications</a>
            <a href="/payout.html" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Payout Dashboard</a>
            <a href="/demo/tallys-corner" className="hover:text-white transition-colors">Tally&apos;s Corner Demo</a>
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
