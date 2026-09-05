"use client";

import Image from "next/image";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, useState, type PointerEvent, type RefObject } from "react";
import { clamp, coverStickers, getStickerBounds, STICKER_LIFT, STICKER_SIZE, type CoverSticker } from "./sticker-layout";

type DragSession = {
  pointerId: number;
  clientX: number;
  clientY: number;
  x: number;
  y: number;
};

function Sticker({ sticker, boardRef, instructionsId, zIndex, bringToFront }: {
  sticker: CoverSticker;
  boardRef: RefObject<HTMLDivElement | null>;
  instructionsId: string;
  zIndex: number;
  bringToFront: () => void;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<DragSession | null>(null);
  const dimensions = useRef({ width: 0, height: 0 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [dragging, setDragging] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const session = drag.current;
      drag.current = null;
      if (session) {
        setDragging(false);
        if (buttonRef.current?.hasPointerCapture(session.pointerId)) {
          buttonRef.current.releasePointerCapture(session.pointerId);
        }
      }
      // Cancel drags on a breakpoint change, but don't measure the hidden board.
      if (!width || !height) return;
      const previous = dimensions.current;
      const bounds = getStickerBounds(width, height, sticker);
      x.set(clamp(x.get() * (previous.width ? width / previous.width : 1), bounds.left, bounds.right));
      y.set(clamp(y.get() * (previous.height ? height / previous.height : 1), bounds.top, bounds.bottom));
      dimensions.current = { width, height };
    });
    observer.observe(board);
    return () => observer.disconnect();
  }, [boardRef, sticker, x, y]);

  function movePointer(event: PointerEvent<HTMLButtonElement>) {
    const session = drag.current;
    if (!session || session.pointerId !== event.pointerId) return;
    const { width, height } = dimensions.current;
    const bounds = getStickerBounds(width, height, sticker);
    // Motion values update the transform without re-rendering the form or board.
    x.set(clamp(session.x + event.clientX - session.clientX, bounds.left, bounds.right));
    y.set(clamp(session.y + event.clientY - session.clientY, bounds.top, bounds.bottom));
  }

  function finishDrag(event: PointerEvent<HTMLButtonElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <motion.button
      ref={buttonRef}
      type="button"
      aria-label={`Move ${sticker.title} sticker`}
      aria-describedby={instructionsId}
      className="absolute aspect-square touch-none select-none rounded-[12%] border-[4px] border-white bg-white p-0 outline-none focus-visible:ring-2 focus-visible:ring-[#1f6b4e] focus-visible:ring-offset-4 sm:border-[5px]"
      style={{
        left: `${sticker.left * 100}%`,
        top: `${sticker.top * 100}%`,
        width: `${STICKER_SIZE * 100}%`,
        x,
        y,
        zIndex,
        cursor: dragging ? "grabbing" : "grab",
      }}
      initial={false}
      animate={{
        rotate: dragging ? 0 : sticker.tilt,
        scale: dragging ? STICKER_LIFT : 1,
        boxShadow: dragging
          ? "0 22px 38px rgba(20,28,22,0.24), 0 4px 8px rgba(20,28,22,0.12)"
          : "0 8px 16px rgba(20,28,22,0.16), 0 2px 3px rgba(20,28,22,0.12)",
      }}
      transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
      onFocus={bringToFront}
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0 || drag.current) return;
        const board = boardRef.current;
        if (!board) return;
        const { width, height } = board.getBoundingClientRect();
        if (!width || !height) return;
        dimensions.current = { width, height };
        event.preventDefault();
        event.currentTarget.focus({ preventScroll: true });
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, x: x.get(), y: y.get() };
        bringToFront();
        setDragging(true);
      }}
      onPointerMove={movePointer}
      onPointerUp={(event) => { movePointer(event); finishDrag(event); }}
      onPointerCancel={finishDrag}
      onLostPointerCapture={finishDrag}
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || drag.current) return;
        const steps: Record<string, [number, number]> = {
          ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1],
        };
        const direction = steps[event.key];
        const { width, height } = dimensions.current;
        if (!direction || !width || !height) return;
        event.preventDefault();
        const bounds = getStickerBounds(width, height, sticker);
        const step = event.shiftKey ? 24 : 8;
        x.set(clamp(x.get() + direction[0] * step, bounds.left, bounds.right));
        y.set(clamp(y.get() + direction[1] * step, bounds.top, bounds.bottom));
        bringToFront();
      }}
    >
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[9%]">
        <Image
          src={sticker.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 156px, 88px"
          className="object-cover"
          draggable={false}
        />
      </span>
    </motion.button>
  );
}

export function CoverStickers({ desktop = false }: { desktop?: boolean }) {
  const boardRef = useRef<HTMLDivElement>(null);
  const instructionsId = useId();
  const [order, setOrder] = useState<number[]>(coverStickers.map((_, index) => index));
  const [reset, setReset] = useState(0);

  function bringToFront(index: number) {
    setOrder((current) => current[current.length - 1] === index
      ? current
      : [...current.filter((item) => item !== index), index]);
  }

  return (
    <div className={`mx-auto w-full ${desktop ? "mt-8 max-w-[520px]" : "mt-5 max-w-[292px]"}`}>
      <div ref={boardRef} role="group" aria-label="Moveable audiobook cover stickers" className="relative isolate aspect-square w-full">
        {coverStickers.map((sticker, index) => (
          <Sticker
            key={`${sticker.title}-${reset}`}
            sticker={sticker}
            boardRef={boardRef}
            instructionsId={instructionsId}
            zIndex={order.indexOf(index) + 1}
            bringToFront={() => bringToFront(index)}
          />
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 font-[family-name:var(--font-geist-sans)] text-sm text-[#6f746f]">
        <p id={instructionsId}>
          Drag the stickers around.
          <span className="sr-only"> Or focus a sticker and use the arrow keys. Hold Shift to move farther.</span>
        </p>
        <button
          type="button"
          className="min-h-11 rounded-md px-2 underline decoration-[#bcc8bc] underline-offset-4 hover:text-[#111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6b4e]"
          onClick={() => {
            setReset((current) => current + 1);
            setOrder(coverStickers.map((_, index) => index));
          }}
          aria-label="Reset sticker positions"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
