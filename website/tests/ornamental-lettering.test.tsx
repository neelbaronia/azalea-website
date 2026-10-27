// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import OrnamentalHeading from "@/app/unlimited/ornamental/ornamental-heading";
import { createBotanicalOrnament } from "@/app/unlimited/ornamental/botanical-geometry";

afterEach(cleanup);

it("renders an accessible catalog section initial alongside the hero without shared SVG IDs", () => {
  const view = render(
    <>
      <OrnamentalHeading variant="unlimited" replayable={false} />
      <OrnamentalHeading variant="catalog" replayable={false} />
    </>,
  );
  expect(
    screen.getByRole("heading", { name: "Unlimited audiobooks.", level: 1 }).id,
  ).toBe("unlimited-title");
  expect(
    screen.getByRole("heading", { name: "Explore the catalog", level: 2 }).id,
  ).toBe("bookshelf-title");
  expect(
    [...view.container.querySelectorAll("svg[data-ornamental-letter]")].map(
      (node) => node.getAttribute("data-ornamental-letter"),
    ),
  ).toEqual(["U", "E"]);
  const patterns = [...view.container.querySelectorAll("svg pattern")].map(
    (node) => node.id,
  );
  expect(new Set(patterns).size).toBe(2);
  for (const pattern of patterns)
    expect(
      view.container.querySelector(`path[fill="url(#${pattern})"]`),
    ).toBeTruthy();
  expect(screen.queryByRole("button")).toBeNull();
});

it("gives the catalog E the same botanical frame, lettering style, and decoration as the U", () => {
  const view = render(
    <>
      <OrnamentalHeading variant="unlimited" replayable={false} />
      <OrnamentalHeading variant="catalog" replayable={false} />
    </>,
  );
  const hero = view.container.querySelector("#unlimited-title svg");
  const catalog = view.container.querySelector("#bookshelf-title svg");
  expect(hero?.getAttribute("data-ornament-style")).toBe("botanical");
  expect(hero?.querySelector("text")?.textContent).toBe("U");
  expect(catalog?.getAttribute("data-ornament-style")).toBe("botanical");
  expect(catalog?.querySelector("text")?.textContent).toBe("E");
  expect(catalog?.getAttribute("viewBox")).toBe(hero?.getAttribute("viewBox"));
  expect(catalog?.querySelector("text")?.getAttribute("class")).toBe(
    hero?.querySelector("text")?.getAttribute("class"),
  );
  const decoration = (svg: Element | null) =>
    Array.from(svg?.querySelectorAll("path") ?? []).map((path) => ({
      shape: path.getAttribute("d"),
      style: path.getAttribute("class"),
    }));
  expect(decoration(catalog)).toEqual(decoration(hero));
  expect(catalog?.querySelector("[data-catalog-letter]")).toBeNull();
  expect(catalog?.getAttribute("aria-hidden")).toBe("true");
});

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
