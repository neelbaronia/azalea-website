// @vitest-environment jsdom
import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import MarketingCarousel from "@/app/marketing/marketing-carousel";
import type { Campaign } from "@/app/marketing/marketing-types";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

const campaigns: Campaign[] = [
  {
    id: "oj", title: "O.J. book", author: "F. Lee Bailey", cover: "/oj.jpg",
    spotify: "https://open.spotify.com/show/oj", summary: "O.J. campaign", accent: "#16877f",
    clips: [
      { id: "old", title: "Earlier example", format: "Evidence File", video: "/old.mp4", poster: "/old.jpg", caption: "Earlier caption" },
      { id: "oj", title: "O.J. trailer", format: "AI-created trailer", featuredOrder: 2, video: "/oj.mp4", poster: "/oj.jpg", caption: "O.J. caption" },
    ],
  },
  {
    id: "jfk", title: "JFK book", author: "Jack Roth", cover: "/jfk.jpg",
    spotify: "https://open.spotify.com/show/jfk", summary: "JFK campaign", accent: "#b33d3c",
    clips: [
      { id: "jfk", title: "JFK microdrama", format: "AI-created microdrama", featuredOrder: 1, video: "/jfk.mp4", poster: "/jfk.jpg", caption: "JFK caption" },
    ],
  },
];

let nextFrameId = 0;
const frames = new Map<number, FrameRequestCallback>();
let playingState = new WeakMap<HTMLMediaElement, boolean>();
let pause: ReturnType<typeof vi.spyOn>;
const originalScrollTo = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollTo");

beforeEach(() => {
  nextFrameId = 0;
  frames.clear();
  playingState = new WeakMap();
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    const id = ++nextFrameId;
    frames.set(id, callback);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal("ResizeObserver", class {
    observe() {}
    disconnect() {}
  });
  vi.stubGlobal("matchMedia", () => ({ matches: false }));
  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    configurable: true,
    value: vi.fn(function (this: HTMLElement, options: ScrollToOptions) {
      this.scrollLeft = options.left ?? this.scrollLeft;
    }),
  });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    if (this.getAttribute("aria-roledescription") === "slide") {
      const index = Number(this.getAttribute("aria-label")?.split(" ")[0]) - 1;
      return { left: 100 + index * 400 - (this.parentElement?.scrollLeft ?? 0), width: 400 } as DOMRect;
    }
    return { left: 0, width: 600 } as DOMRect;
  });
  vi.spyOn(HTMLMediaElement.prototype, "paused", "get").mockImplementation(function (this: HTMLMediaElement) {
    return !playingState.get(this);
  });
  pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
    playingState.set(this, false);
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalScrollTo) Object.defineProperty(HTMLElement.prototype, "scrollTo", originalScrollTo);
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollTo");
});

function flushFrames() {
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(0));
  });
}

function setup() {
  const result = render(<MarketingCarousel campaigns={campaigns} />);
  const videos = Array.from(result.container.querySelectorAll("video"));
  const track = result.container.querySelector<HTMLElement>('[class*="snap-x"]')!;
  Object.defineProperty(track, "clientWidth", { configurable: true, value: 600 });
  result.container.querySelectorAll("article").forEach((slide) => {
    Object.defineProperty(slide, "clientWidth", { configurable: true, value: 400 });
  });
  track.scrollLeft = 0;
  flushFrames();
  return { ...result, videos, track };
}

it("keeps the full films in featured order with native, non-autoplay, uncropped mobile playback", () => {
  const { videos } = setup();
  expect(videos.map((video) => video.getAttribute("aria-label"))).toEqual([
    "JFK microdrama", "O.J. trailer", "Earlier example",
  ]);
  expect(videos.map((video) => video.controls)).toEqual([true, false, false]);
  for (const video of videos) {
    expect(video.preload).toBe("none");
    expect(video.playsInline).toBe(true);
    expect(video.autoplay).toBe(false);
    expect(video.className).toContain("aspect-[9/16]");
    expect(video.className).toContain("object-contain");
  }
});

it("pauses a different playing video without stopping the newly selected player", () => {
  const { videos } = setup();
  playingState.set(videos[0], true);
  playingState.set(videos[1], true);
  fireEvent.play(videos[1]);
  expect(pause.mock.contexts).toContain(videos[0]);
  expect(pause.mock.contexts).not.toContain(videos[1]);
  expect(videos[0].paused).toBe(true);
  expect(videos[1].paused).toBe(false);
});

it("pauses the previous film when scrolling changes the active slide", () => {
  const { videos, track } = setup();
  playingState.set(videos[0], true);
  fireEvent.click(screen.getByRole("button", { name: "Next video" }));
  expect(track.scrollLeft).toBe(400);
  expect(frames.size).toBe(0);
  fireEvent.scroll(track);
  expect(frames.size).toBe(1);
  flushFrames();
  expect(videos[0].paused).toBe(true);
  expect(videos[1].controls).toBe(true);
  expect(videos[0].controls).toBe(false);
  expect(screen.getByRole("button", { name: "Go to video 2: O.J. trailer" }).getAttribute("aria-current")).toBe("true");
});
