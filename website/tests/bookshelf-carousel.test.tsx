// @vitest-environment jsdom
import React from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import BookshelfCarousel, {
  TITLE_SCROLL_PX_PER_SECOND,
} from "@/app/unlimited/ornamental/bookshelf-carousel";
import { featuredBooks } from "@/app/unlimited/ornamental/featured-books";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));
let reduced = false;
let nextFrameId = 1;
let updateVisibility: (visible: boolean) => void;
const frames = new Map<number, FrameRequestCallback>();
const resizeCallbacks = new Set<() => void>();
const preferenceListeners = new Set<() => void>();
const disconnect = vi.fn();

beforeEach(() => {
  reduced = false;
  nextFrameId = 1;
  frames.clear();
  resizeCallbacks.clear();
  preferenceListeners.clear();
  disconnect.mockClear();
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    const id = nextFrameId++;
    frames.set(id, callback);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal("matchMedia", () => ({
    get matches() {
      return reduced;
    },
    addEventListener: (_event: string, listener: () => void) =>
      preferenceListeners.add(listener),
    removeEventListener: (_event: string, listener: () => void) =>
      preferenceListeners.delete(listener),
  }));
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(private callback: IntersectionObserverCallback) {}
      observe() {
        updateVisibility = (visible) =>
          this.callback(
            [
              {
                isIntersecting: visible,
                intersectionRatio: visible ? 1 : 0,
              } as IntersectionObserverEntry,
            ],
            this as unknown as IntersectionObserver,
          );
        updateVisibility(true);
      }
      disconnect = disconnect;
    },
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private callback: () => void) {}
      observe() {
        resizeCallbacks.add(this.callback);
      }
      disconnect() {
        resizeCallbacks.delete(this.callback);
      }
    },
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function frame(timestamp: number) {
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(timestamp));
  });
}
function prepareTrack() {
  const track = screen.getByRole("list", {
    name: "A selection from our existing catalog",
  });
  const loopWidth = featuredBooks.length * 220;
  Object.defineProperties(track, {
    scrollWidth: { configurable: true, value: loopWidth * 2 - 20 },
    clientWidth: { configurable: true, value: 600 },
  });
  track.style.columnGap = "20px";
  const measure = vi
    .spyOn(track.firstElementChild!, "getBoundingClientRect")
    .mockReturnValue({ width: 200 } as DOMRect);
  const scrollTo = vi.fn(({ left }: { left: number }) => {
    track.scrollLeft = left;
  });
  Object.defineProperty(track, "scrollTo", {
    configurable: true,
    value: scrollTo,
  });
  act(() => resizeCallbacks.forEach((callback) => callback()));
  return { track, scrollTo, loopWidth, measure };
}

it("exposes 20 unique titles and hides the seamless visual copy from assistive technology", () => {
  render(<BookshelfCarousel />);
  const { track } = prepareTrack();
  expect(featuredBooks).toHaveLength(20);
  expect(new Set(featuredBooks.map((book) => book.id)).size).toBe(20);
  expect(screen.getAllByRole("img")).toHaveLength(20);
  expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(20);
  expect(screen.getByText("20 featured titles")).toBeTruthy();
  expect(
    track.querySelectorAll(':scope > [data-carousel-copy="original"]'),
  ).toHaveLength(20);
  const copies = track.querySelectorAll(':scope > [data-carousel-copy="loop"]');
  expect(copies).toHaveLength(20);
  copies.forEach((copy) => {
    expect(copy.getAttribute("aria-hidden")).toBe("true");
    expect(copy.hasAttribute("inert")).toBe(true);
  });
});

it("drifts continuously at a gentle fixed speed without measuring layout each frame", () => {
  render(<BookshelfCarousel />);
  const { track, measure, scrollTo } = prepareTrack();
  expect(TITLE_SCROLL_PX_PER_SECOND).toBe(14);
  const initialMeasurements = measure.mock.calls.length;
  frame(0);
  frame(50);
  expect(track.scrollLeft).toBeCloseTo(0.7);
  frame(100);
  expect(track.scrollLeft).toBeCloseTo(1.4);
  expect(measure.mock.calls.length).toBe(initialMeasurements);
  expect(scrollTo).not.toHaveBeenCalled();
});

it("wraps continuously into the matching visual copy and supports previous/next across the seam", () => {
  render(<BookshelfCarousel />);
  const { track, scrollTo, loopWidth } = prepareTrack();
  track.scrollLeft = loopWidth - 0.2;
  frame(0);
  frame(50);
  expect(track.scrollLeft).toBeCloseTo(0.5);
  track.scrollLeft = loopWidth - 220;
  fireEvent.click(screen.getByRole("button", { name: "Next titles" }));
  expect(scrollTo).toHaveBeenLastCalledWith({
    left: loopWidth,
    behavior: "smooth",
  });
  fireEvent.click(screen.getByRole("button", { name: "Next titles" }));
  expect(scrollTo).toHaveBeenLastCalledWith({ left: 220, behavior: "smooth" });
  track.scrollLeft = 0;
  fireEvent.click(screen.getByRole("button", { name: "Previous titles" }));
  expect(scrollTo).toHaveBeenLastCalledWith({
    left: loopWidth - 220,
    behavior: "smooth",
  });
});

it("retains slow fractional progress when a browser rounds scroll positions", () => {
  render(<BookshelfCarousel />);
  const { track } = prepareTrack();
  let roundedPosition = 0;
  Object.defineProperty(track, "scrollLeft", {
    configurable: true,
    get: () => roundedPosition,
    set: (value: number) => {
      roundedPosition = Math.round(value);
    },
  });
  for (let timestamp = 0; timestamp <= 1000; timestamp += 10) frame(timestamp);
  expect(track.scrollLeft).toBe(14);
});

it("pauses on hover, focus, and explicit pause, resuming without a time jump", () => {
  render(<BookshelfCarousel />);
  const { track } = prepareTrack();
  const shelf = screen.getByRole("region", { name: "Featured Azalea titles" });
  frame(0);
  frame(50);
  fireEvent.mouseEnter(shelf);
  expect(frames.size).toBe(0);
  frame(100);
  expect(track.scrollLeft).toBeCloseTo(0.7);
  fireEvent.mouseLeave(shelf);
  frame(200);
  frame(250);
  expect(track.scrollLeft).toBeCloseTo(1.4);
  fireEvent.focus(track);
  expect(frames.size).toBe(0);
  fireEvent.blur(track, { relatedTarget: document.body });
  frame(350);
  frame(400);
  expect(track.scrollLeft).toBeCloseTo(2.1);
  fireEvent.click(
    screen.getByRole("button", { name: "Pause automatic title rotation" }),
  );
  expect(frames.size).toBe(0);
  fireEvent.click(
    screen.getByRole("button", { name: "Resume automatic title rotation" }),
  );
  frame(500);
  frame(550);
  expect(track.scrollLeft).toBeCloseTo(2.8);
});

it("disables automatic and smooth motion for reduced-motion users", () => {
  reduced = true;
  render(<BookshelfCarousel />);
  const { scrollTo } = prepareTrack();
  expect(
    screen.queryByRole("button", { name: /automatic title rotation/ }),
  ).toBeNull();
  expect(frames.size).toBe(0);
  fireEvent.click(screen.getByRole("button", { name: "Next titles" }));
  expect(scrollTo).toHaveBeenLastCalledWith({ left: 220, behavior: "instant" });
});

it("stops automatic scrolling after keyboard or touch interaction", () => {
  render(<BookshelfCarousel />);
  const { track, scrollTo } = prepareTrack();
  fireEvent.keyDown(track, { key: "ArrowRight" });
  expect(scrollTo).toHaveBeenLastCalledWith({ left: 220, behavior: "smooth" });
  expect(frames.size).toBe(0);
  fireEvent.click(
    screen.getByRole("button", { name: "Resume automatic title rotation" }),
  );
  expect(frames.size).toBe(1);
  fireEvent.pointerDown(track);
  expect(frames.size).toBe(0);
});

it("stops offscreen or in a hidden tab and removes animation frames/listeners on unmount", () => {
  const view = render(<BookshelfCarousel />);
  prepareTrack();
  act(() => updateVisibility(false));
  expect(frames.size).toBe(0);
  act(() => updateVisibility(true));
  expect(frames.size).toBe(1);
  vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
  fireEvent(document, new Event("visibilitychange"));
  expect(frames.size).toBe(0);
  view.unmount();
  expect(disconnect).toHaveBeenCalledTimes(1);
  expect(preferenceListeners.size).toBe(0);
  expect(resizeCallbacks.size).toBe(0);
});

it("honors reduced-motion preference changes without reloading", () => {
  render(<BookshelfCarousel />);
  const { track } = prepareTrack();
  frame(0);
  frame(50);
  expect(track.scrollLeft).toBeCloseTo(0.7);
  reduced = true;
  act(() => preferenceListeners.forEach((listener) => listener()));
  expect(frames.size).toBe(0);
  expect(
    screen.queryByRole("button", { name: /automatic title rotation/ }),
  ).toBeNull();
});

it("keeps the same catalog position when card widths change", () => {
  render(<BookshelfCarousel />);
  const { track, loopWidth, measure } = prepareTrack();
  track.scrollLeft = loopWidth / 4;
  measure.mockReturnValue({ width: 100 } as DOMRect);
  act(() => resizeCallbacks.forEach((callback) => callback()));
  expect(track.scrollLeft).toBe(600);
});

it("shows category names and concise descriptions without numeric BISAC codes", () => {
  render(<BookshelfCarousel />);
  for (const book of featuredBooks) {
    const originalCard = screen
      .getByRole("heading", { level: 3, name: book.title, exact: true })
      .closest("figure")!;
    const categories = within(originalCard).getByRole("list");
    expect(categories.children).toHaveLength(book.categories.length);
    expect(categories.textContent).not.toMatch(/\b[A-Z]{3}\d{6}\b/);
    expect(
      Array.from(categories.children).map((item) => item.textContent),
    ).toEqual(book.categories);
    expect(within(originalCard).getByText(book.description)).toBeTruthy();
    expect(book.description.split(/\s+/).length).toBeLessThanOrEqual(24);
  }
  expect(
    screen.getAllByRole("list", { name: /BISAC categories$/ }),
  ).toHaveLength(12);
  expect(screen.getAllByRole("list", { name: /catalog genres$/ })).toHaveLength(
    8,
  );
});
