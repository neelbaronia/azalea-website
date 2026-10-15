"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Campaign } from "./marketing-types";

function centerSlide(track: HTMLElement, slide: HTMLElement, behavior: ScrollBehavior) {
  const trackRect = track.getBoundingClientRect();
  const slideRect = slide.getBoundingClientRect();
  const slideLeft = track.scrollLeft + slideRect.left - trackRect.left;
  const centeredLeft = slideLeft - (track.clientWidth - slide.clientWidth) / 2;
  track.scrollTo({ left: centeredLeft, behavior });
}

function CampaignDetails({
  campaign,
  clip,
  number,
}: {
  campaign: Campaign;
  clip: Campaign["clips"][number];
  number: number;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-3 border-b border-[#171717]/10 pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <Image
            src={campaign.cover}
            alt={`Cover of ${campaign.title}`}
            width={52}
            height={78}
            className="h-[60px] w-[40px] shrink-0 rounded-sm object-cover shadow-sm"
          />
          <div className="min-w-0">
            <p
              className="mb-1 text-[9px] font-bold uppercase tracking-[0.16em]"
              style={{ color: campaign.accent }}
            >
              Audiobook · {campaign.author}
            </p>
            <h2 className="font-[family-name:var(--font-garamond)] text-lg font-semibold leading-tight md:text-xl">
              {campaign.title}
            </h2>
          </div>
        </div>
        <span className="shrink-0 font-[family-name:var(--font-garamond)] text-lg text-[#171717]/35">
          {String(number).padStart(2, "0")}
        </span>
      </div>

      <p className="mt-3 text-[11px] leading-[1.15rem] text-[#171717]/60">{campaign.summary}</p>
      <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.16em] text-[#171717]/45">
        {clip.format}
      </p>
      <h3 className="mt-1 font-[family-name:var(--font-garamond)] text-2xl font-semibold leading-tight md:text-3xl">
        {clip.title}
      </h3>
      <p className="mt-3 whitespace-pre-line text-xs leading-5 text-[#171717]/75 md:text-sm md:leading-6">
        {clip.caption}
      </p>

      {clip.note && (
        <p
          className="mt-3 border-l-2 pl-3 text-[11px] leading-[1.15rem] text-[#171717]/65"
          style={{ borderColor: campaign.accent }}
        >
          {clip.note}
        </p>
      )}

      {clip.photoCredit && (
        <p className="mt-3 text-[11px] leading-[1.15rem] text-[#171717]/60">
          {clip.photoCredit}{" "}
          {clip.photoUrl && (
            <Link href={clip.photoUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
              Photo source
            </Link>
          )}
          {clip.licenseUrl && (
            <>
              {" · "}
              <Link href={clip.licenseUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                {clip.licenseName ?? "Image license"}
              </Link>
            </>
          )}
        </p>
      )}

      <Link
        href={campaign.spotify}
        target="_blank"
        rel="noreferrer"
        className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#171717]/25 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] transition-colors hover:bg-[#171717] hover:text-white"
      >
        Listen on Spotify <span aria-hidden="true">↗</span>
      </Link>
    </>
  );
}

export default function MarketingCarousel({ campaigns }: { campaigns: Campaign[] }) {
  const slides = campaigns
    .flatMap((campaign) => campaign.clips.map((clip) => ({ campaign, clip })))
    .map((slide, index) => ({ ...slide, number: index + 1 }));

  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const updateFocusedSlide = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const trackCenter = track.getBoundingClientRect().left + track.clientWidth / 2;
        let closestIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;

        slideRefs.current.forEach((slide, index) => {
          if (!slide) return;
          const rect = slide.getBoundingClientRect();
          const distance = Math.abs(rect.left + rect.width / 2 - trackCenter);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        if (closestIndex !== activeIndexRef.current) {
          activeIndexRef.current = closestIndex;
          setActiveIndex(closestIndex);
        }
      });
    };

    track.addEventListener("scroll", updateFocusedSlide, { passive: true });
    updateFocusedSlide();
    return () => {
      track.removeEventListener("scroll", updateFocusedSlide);
      cancelAnimationFrame(frame);
    };
  }, [slides.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const alignActiveSlide = () => {
      const slide = slideRefs.current[activeIndexRef.current];
      if (slide) centerSlide(track, slide, "instant");
    };
    const resizeObserver = new ResizeObserver(alignActiveSlide);
    resizeObserver.observe(track);
    alignActiveSlide();
    return () => resizeObserver.disconnect();
  }, [slides.length]);

  function goToSlide(index: number) {
    const track = trackRef.current;
    const slide = slideRefs.current[index];
    if (!track || !slide) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    centerSlide(track, slide, reducedMotion ? "instant" : "smooth");
  }

  return (
    <section aria-label="Audiobook marketing video carousel" aria-roledescription="carousel" className="pb-8 md:pb-10">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#171717]/50">
          <span aria-live="polite">{String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
          <span aria-hidden="true"> · </span>
          Swipe to browse
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous video"
            onClick={() => goToSlide(Math.max(0, activeIndex - 1))}
            disabled={activeIndex === 0}
            className="grid h-8 w-8 place-items-center rounded-full border border-[#171717]/25 text-base transition-colors hover:bg-[#171717] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            aria-label="Next video"
            onClick={() => goToSlide(Math.min(slides.length - 1, activeIndex + 1))}
            disabled={activeIndex === slides.length - 1}
            className="grid h-8 w-8 place-items-center rounded-full border border-[#171717]/25 text-base transition-colors hover:bg-[#171717] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-4"
      >
        {slides.map(({ campaign, clip, number }, index) => (
          <article
            key={clip.id}
            ref={(element) => {
              slideRefs.current[index] = element;
            }}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}: ${clip.title}`}
            className={`w-[50%] shrink-0 snap-center snap-always overflow-hidden border border-[#171717]/15 bg-white/55 transition-[opacity,transform] duration-300 ease-out md:w-[64%] ${
              index === activeIndex ? "scale-100 opacity-100 shadow-md" : "scale-[0.97] opacity-60"
            } first:ml-[25%] last:mr-[25%] md:first:ml-[18%] md:last:mr-[18%]`}
          >
            <div className="grid md:grid-cols-[minmax(220px,0.65fr)_minmax(0,1.35fr)]">
              <div className="flex justify-center bg-[#e8e5dc] p-2 sm:p-4 md:p-5">
                <video
                  controls={index === activeIndex}
                  playsInline
                  preload="none"
                  poster={clip.poster}
                  aria-label={clip.title}
                  className="aspect-[9/16] h-[clamp(280px,46vh,440px)] w-auto max-w-full bg-black object-contain shadow-md md:h-[clamp(340px,62vh,600px)]"
                >
                  <source src={clip.video} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              <div className="hidden min-w-0 flex-col justify-center p-4 sm:p-6 md:flex md:p-7">
                <CampaignDetails campaign={campaign} clip={clip} number={number} />
              </div>
            </div>
          </article>
        ))}
      </div>

      <nav aria-label="Choose a video" className="mt-4 flex justify-center gap-2">
        {slides.map(({ clip }, index) => (
          <button
            key={clip.id}
            type="button"
            onClick={() => goToSlide(index)}
            aria-label={`Go to video ${index + 1}: ${clip.title}`}
            aria-current={activeIndex === index ? "true" : undefined}
            className={`h-1.5 rounded-full transition-all ${activeIndex === index ? "w-8 bg-[#282142]" : "w-3 bg-[#171717]/25 hover:bg-[#171717]/50"}`}
          />
        ))}
      </nav>

      {slides[activeIndex] && (
        <div className="mt-4 border border-[#171717]/15 bg-white/55 p-4 sm:p-6 md:hidden">
          <CampaignDetails {...slides[activeIndex]} />
        </div>
      )}
    </section>
  );
}
