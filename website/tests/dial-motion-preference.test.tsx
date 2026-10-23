// @vitest-environment jsdom
import React from "react";
import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import DialHero from "@/components/dial/DialHero";

const engine = vi.hoisted(() => ({
  setResolve: vi.fn(), setSettings: vi.fn(), start: vi.fn(), stop: vi.fn(),
  renderFinal: vi.fn(), destroy: vi.fn(),
}));

vi.mock("next/image", () => ({ default: () => null }));
vi.mock("@/components/dial/dial-engine", async () => {
  const { DEFAULT_DIAL_SETTINGS } = await import("@/components/dial/dial-geometry");
  return {
    DEFAULT_DIAL_SETTINGS,
    ContinuousSweep: class {
      ok = true;
      setResolve = engine.setResolve;
      setSettings = engine.setSettings;
      start = engine.start;
      stop = engine.stop;
      renderFinal = engine.renderFinal;
      destroy = engine.destroy;
    },
  };
});

const changeHandlers = new Set<() => void>();
const frames: FrameRequestCallback[] = [];
const preference = {
  matches: false,
  addEventListener: vi.fn((_event: string, handler: () => void) => changeHandlers.add(handler)),
  removeEventListener: vi.fn((_event: string, handler: () => void) => changeHandlers.delete(handler)),
};

beforeEach(() => {
  vi.clearAllMocks();
  changeHandlers.clear();
  frames.length = 0;
  preference.matches = false;
  vi.stubGlobal("localStorage", { getItem: vi.fn(() => null), setItem: vi.fn() });
  vi.stubGlobal("matchMedia", () => preference);
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  vi.stubGlobal("IntersectionObserver", class {
    constructor(private callback: IntersectionObserverCallback) {}
    observe() { this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this as unknown as IntersectionObserver); }
    disconnect() {}
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function mount() {
  return render(<section data-dial-stage><div data-dial-frame><DialHero /></div></section>);
}

it("keeps the English lockup static while scrolling with reduced motion", () => {
  preference.matches = true;
  mount();
  expect(engine.renderFinal).toHaveBeenCalled();
  expect(engine.start).not.toHaveBeenCalled();
  engine.renderFinal.mockClear();
  act(() => {
    window.dispatchEvent(new Event("scroll"));
    frames.splice(0).forEach((callback) => callback(1));
  });
  expect(engine.renderFinal).toHaveBeenCalled();
  expect(engine.setResolve).not.toHaveBeenCalled();
  expect(engine.start).not.toHaveBeenCalled();
});

it("responds to motion preference changes and cleans up the listener", () => {
  const view = mount();
  expect(engine.start).toHaveBeenCalled();
  act(() => {
    preference.matches = true;
    changeHandlers.forEach((handler) => handler());
  });
  expect(engine.stop).toHaveBeenCalled();
  expect(engine.renderFinal).toHaveBeenCalled();
  engine.start.mockClear();
  act(() => {
    preference.matches = false;
    changeHandlers.forEach((handler) => handler());
  });
  expect(engine.setResolve).toHaveBeenLastCalledWith(0);
  expect(engine.start).toHaveBeenCalled();
  view.unmount();
  expect(changeHandlers.size).toBe(0);
  expect(engine.destroy).toHaveBeenCalled();
});
