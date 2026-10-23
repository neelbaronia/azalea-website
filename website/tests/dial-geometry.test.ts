import { describe, expect, it } from "vitest";
import {
  DEFAULT_DIAL_SETTINGS,
  displayFlow,
  inertialStep,
  letterScale,
  modulo,
  resolvedDisplayFlow,
  smoothstep,
  sweepLag,
} from "@/components/dial/dial-geometry";

describe("Continuous sweep geometry", () => {
  it("varies continuously across every former column boundary", () => {
    for (let column = 1; column < 10; column += 1) {
      const x = Math.pow(column / 10, DEFAULT_DIAL_SETTINGS.perspective);
      const before = displayFlow(0.4, DEFAULT_DIAL_SETTINGS, x - 0.000001);
      const after = displayFlow(0.4, DEFAULT_DIAL_SETTINGS, x + 0.000001);
      expect(Math.abs(before - after)).toBeLessThan(0.00001);
    }
  });

  it("keeps the left-to-right lag without quantizing the lettering", () => {
    const left = displayFlow(0.4, DEFAULT_DIAL_SETTINGS, 0);
    const middle = displayFlow(0.4, DEFAULT_DIAL_SETTINGS, 0.5);
    const right = displayFlow(0.4, DEFAULT_DIAL_SETTINGS, 1);
    expect(left).toBeLessThan(middle);
    expect(middle).toBeLessThan(right);
    expect(displayFlow(0.4, DEFAULT_DIAL_SETTINGS, 0.5)).not.toBe(
      displayFlow(0.4, DEFAULT_DIAL_SETTINGS, 0.51),
    );
  });

  it("does not jump when a new roll begins", () => {
    for (const x of [0, 0.2, 0.5, 0.8, 1]) {
      expect(displayFlow(0.8 - 1e-8, DEFAULT_DIAL_SETTINGS, x)).toBeCloseTo(
        displayFlow(0.8 + 1e-8, DEFAULT_DIAL_SETTINGS, x), 6,
      );
    }
  });

  it("centers the English row when resolving at any point in the cycle", () => {
    for (const tiles of [9, 17, 21, 25]) {
      const settings = { ...DEFAULT_DIAL_SETTINGS, tiles };
      for (const elapsed of [0, 0.4, 2.72, 8, 13.5]) {
        const target = resolvedDisplayFlow(elapsed, settings, 18);
        const centerMaterial = tiles / 2 - target;
        expect(modulo(Math.floor(centerMaterial), 18)).toBe(0);
        expect(centerMaterial % 1).toBe(0.5);
      }
    }
  });

  it("wraps a whole language cycle to an identical visible position", () => {
    const duration = DEFAULT_DIAL_SETTINGS.speed * 18;
    for (const x of [0, 0.5, 1]) {
      const before = displayFlow(duration - 1e-8, DEFAULT_DIAL_SETTINGS, x);
      const after = displayFlow(1e-8, DEFAULT_DIAL_SETTINGS, x);
      expect(modulo(after - before, 18)).toBeCloseTo(0, 6);
    }
  });

  it("can flatten the sweep entirely and caps its maximum lag", () => {
    const flat = { ...DEFAULT_DIAL_SETTINGS, offset: 0 };
    expect(displayFlow(0.4, flat, 0)).toBe(displayFlow(0.4, flat, 1));
    expect(sweepLag(DEFAULT_DIAL_SETTINGS)).toBe(0.36);
    expect(sweepLag({ ...flat, offset: 1 })).toBe(0.36);
  });

  it("clamps easing and preserves its endpoints", () => {
    for (const easing of [inertialStep, smoothstep]) {
      expect(easing(-1)).toBe(0);
      expect(easing(0)).toBe(0);
      expect(easing(1)).toBe(1);
      expect(easing(2)).toBe(1);
    }
    expect(inertialStep(0.38 - 1e-8)).toBeCloseTo(inertialStep(0.38 + 1e-8), 6);
  });

  it("keeps the desktop design and corrects tall mobile lettering", () => {
    expect(letterScale(DEFAULT_DIAL_SETTINGS, 1200 / 600)).toBe(1);
    const phoneAspect = 358 / 692;
    const projectedStretch = (4 * DEFAULT_DIAL_SETTINGS.topPerspective) /
      DEFAULT_DIAL_SETTINGS.tiles / phoneAspect;
    expect(letterScale(DEFAULT_DIAL_SETTINGS, phoneAspect)).toBeGreaterThan(3);
    expect(projectedStretch / letterScale(DEFAULT_DIAL_SETTINGS, phoneAspect)).toBeCloseTo(1);
  });
});
