"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { featuredBooks } from "./featured-books";
import styles from "./bookshelf-carousel.module.css";

export const TITLE_SCROLL_PX_PER_SECOND = 14;

// A second visual copy makes the wrap seamless; it is hidden from assistive
// technology and contains no focusable elements. The count remains 20 titles.
const loopingBooks = [...featuredBooks, ...featuredBooks];

function measureTrack(track: HTMLUListElement) {
  const firstBook = track.firstElementChild;
  const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
  const step = firstBook ? firstBook.getBoundingClientRect().width + gap : 0;
  return { step, loopWidth: step * featuredBooks.length };
}

export default function BookshelfCarousel({
  heading,
}: {
  heading?: ReactNode;
}) {
  const trackId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const running =
    !paused && !hovered && !focused && !reducedMotion && inView && pageVisible;

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState !== "hidden");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) =>
        setInView(entry.isIntersecting && entry.intersectionRatio >= 0.15),
      { threshold: 0.15 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const move = useCallback(
    (direction: -1 | 1) => {
      const track = trackRef.current;
      if (!track) return;
      const { step, loopWidth } = measureTrack(track);
      if (step <= 0 || track.scrollWidth <= track.clientWidth) return;
      let left = track.scrollLeft;
      if (left >= loopWidth) {
        left %= loopWidth;
        track.scrollTo({ left, behavior: "instant" });
      }
      if (direction === -1 && left < step) {
        left += loopWidth;
        track.scrollTo({ left, behavior: "instant" });
      }
      track.scrollTo({
        left: left + direction * step,
        behavior: reducedMotion ? "instant" : "smooth",
      });
    },
    [reducedMotion],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!running || !track) return;
    let loopWidth = 0;
    let position = track.scrollLeft;
    let lastTimestamp: number | null = null;
    let frameId = 0;
    const measure = () => {
      const nextWidth = measureTrack(track).loopWidth;
      if (
        loopWidth > 0 &&
        nextWidth > 0 &&
        Math.abs(loopWidth - nextWidth) > 0.5
      ) {
        position = ((track.scrollLeft % loopWidth) / loopWidth) * nextWidth;
        track.scrollLeft = position;
      }
      loopWidth = nextWidth;
    };
    measure();
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    resizeObserver?.observe(track);
    const tick = (timestamp: number) => {
      if (lastTimestamp === null) position = track.scrollLeft;
      if (lastTimestamp !== null && loopWidth > 0) {
        // Cache dimensions outside the frame loop and never re-render React per
        // frame. Capping elapsed time avoids jumps after a stalled browser frame.
        const elapsed = Math.min(Math.max(timestamp - lastTimestamp, 0), 64);
        // Retain fractional progress even if a browser rounds scrollLeft.
        position =
          (position + (elapsed / 1000) * TITLE_SCROLL_PX_PER_SECOND) %
          loopWidth;
        track.scrollLeft = position;
      }
      lastTimestamp = timestamp;
      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
    };
  }, [running]);

  const moveManually = (direction: -1 | 1) => {
    setPaused(true);
    move(direction);
  };

  return (
    <div
      ref={rootRef}
      className={styles.carousel}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Azalea titles"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      <div className={styles.toolbar}>
        {heading}
        <div
          className={styles.controls}
          role="group"
          aria-label="Bookshelf controls"
        >
          <button
            type="button"
            aria-label="Previous titles"
            aria-controls={trackId}
            onClick={() => moveManually(-1)}
          >
            <ArrowLeft size={16} aria-hidden="true" />
          </button>
          {!reducedMotion ? (
            <button
              type="button"
              aria-label={
                paused
                  ? "Resume automatic title rotation"
                  : "Pause automatic title rotation"
              }
              aria-controls={trackId}
              onClick={() => setPaused((current) => !current)}
            >
              {paused ? (
                <Play size={14} aria-hidden="true" />
              ) : (
                <Pause size={14} aria-hidden="true" />
              )}
            </button>
          ) : null}
          <button
            type="button"
            aria-label="Next titles"
            aria-controls={trackId}
            onClick={() => moveManually(1)}
          >
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
      <ul
        id={trackId}
        ref={trackRef}
        className={styles.track}
        aria-label="A selection from our existing catalog"
        data-auto-scrolling={running ? "true" : "false"}
        tabIndex={0}
        onPointerDown={() => setPaused(true)}
        onKeyDown={(event) => {
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
          event.preventDefault();
          moveManually(event.key === "ArrowRight" ? 1 : -1);
        }}
      >
        {loopingBooks.map((book, index) => {
          const isCopy = index >= featuredBooks.length;
          return (
            <li
              key={`${isCopy ? "loop" : "original"}-${book.id}`}
              className={styles.slide}
              aria-hidden={isCopy || undefined}
              inert={isCopy}
              data-carousel-copy={isCopy ? "loop" : "original"}
            >
              <figure className={styles.book}>
                <Image
                  src={
                    book.image.startsWith("https://")
                      ? book.image
                      : `/sample-covers/${book.image}`
                  }
                  alt={isCopy ? "" : `${book.title} audiobook cover`}
                  width={280}
                  height={280}
                  sizes="(max-width: 760px) 68vw, (max-width: 1250px) 23vw, 282px"
                  draggable={false}
                />
                <figcaption>
                  <h3 className={styles.bookTitle}>{book.title}</h3>
                  <p className={styles.categoryLabel}>
                    {book.categorySource === "bisac"
                      ? "BISAC categories"
                      : "Catalog genres"}
                  </p>
                  <ul
                    className={styles.categories}
                    aria-label={`${book.title} ${book.categorySource === "bisac" ? "BISAC categories" : "catalog genres"}`}
                  >
                    {book.categories.map((category) => (
                      <li key={category}>{category}</li>
                    ))}
                  </ul>
                  <p className={styles.description}>{book.description}</p>
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
