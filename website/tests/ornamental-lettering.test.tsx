// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import OrnamentalHeading from "@/app/unlimited/ornamental/ornamental-heading";
import { createBotanicalOrnament } from "@/app/unlimited/ornamental/botanical-geometry";

afterEach(cleanup);

it("keeps the complete headline accessible, without spelling out decorative fragments", () => {
  render(<OrnamentalHeading />);
  expect(
    screen.getByRole("heading", {
      name: "One more chapter. No more limits.",
      level: 1,
    }),
  ).toBeTruthy();
  expect(screen.queryByRole("img")).toBeNull();
});

it("replays only the ornament and preserves the headline", () => {
  const view = render(<OrnamentalHeading />);
  const first = view.container.querySelector("svg[data-ornament-edition]");
  expect(first?.getAttribute("data-ornament-edition")).toBe("0");
  fireEvent.click(
    screen.getByRole("button", { name: "Replay the decorative lettering" }),
  );
  const next = view.container.querySelector("svg[data-ornament-edition]");
  expect(next?.getAttribute("data-ornament-edition")).toBe("1");
  expect(next).not.toBe(first);
  expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
});

it("produces repeatable, bounded decoration without hydration randomness", () => {
  const first = createBotanicalOrnament();
  expect(first).toEqual(createBotanicalOrnament());
  expect(first).toHaveLength(8);
  for (const vine of first)
    for (const leaf of vine.leaves) {
      expect(Number.isFinite(leaf.angle)).toBe(true);
      expect(leaf.x).toBeGreaterThan(0);
      expect(leaf.x).toBeLessThan(200);
      expect(leaf.y).toBeGreaterThan(0);
      expect(leaf.y).toBeLessThan(216);
      expect(leaf.delay + 0.65).toBeLessThan(4);
    }
});
