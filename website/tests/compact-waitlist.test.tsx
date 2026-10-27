// @vitest-environment jsdom
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import CompactWaitlist from "@/app/unlimited/ornamental/compact-waitlist";
import UnlimitedPage, { metadata } from "@/app/unlimited/page";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => (
    <span role={alt ? "img" : undefined} aria-label={alt || undefined} />
  ),
}));
afterEach(cleanup);

it("shows the iOS App Store platform at the top without offering a download before launch", () => {
  render(<CompactWaitlist />);
  const platform = screen.getByText("iOS App Store");
  expect(platform.closest("header")).toBeTruthy();
  expect(platform.closest("a")).toBeNull();
  expect(
    platform.parentElement?.parentElement
      ?.querySelector("svg")
      ?.getAttribute("aria-hidden"),
  ).toBe("true");
  expect(screen.getByText("Coming early 2027").closest("header")).toBeTruthy();
  expect(screen.queryByText(/Download on the|Pre-order/)).toBeNull();
});

it("publishes the approved design at the canonical waitlist URL", () => {
  const view = render(<UnlimitedPage />);
  expect(
    view.container.querySelector('[data-waitlist-design="compact-ornamental"]'),
  ).toBeTruthy();
  expect(
    screen.getByRole("heading", { level: 1, name: "Unlimited audiobooks." }),
  ).toBeTruthy();
  expect(metadata.alternates?.canonical).toBe("/unlimited");
  expect(metadata.robots).toEqual({ index: true, follow: true });
  expect(metadata.openGraph?.url).toBe("/unlimited");
});

it("keeps the concise offer and one working waitlist form alongside the catalog", () => {
  const view = render(<CompactWaitlist />);
  expect(
    screen.getByRole("heading", { level: 1, name: "Unlimited audiobooks." }),
  ).toBeTruthy();
  expect(screen.getByText("1,000s of titles")).toBeTruthy();
  expect(screen.getByText("$9")).toBeTruthy();
  expect(screen.getByText("Coming early 2027")).toBeTruthy();
  expect(screen.getAllByRole("form")).toHaveLength(1);
  expect(screen.getByRole("form").getAttribute("action")).toBe("/api/waitlist");
  expect(screen.getAllByRole("img")).toHaveLength(22);
  expect(view.container.querySelector("details")).toBeNull();
  expect(view.container.querySelectorAll("section")).toHaveLength(2);
  expect(screen.queryByText("Be first to hear when we launch.")).toBeNull();
  expect(
    screen.queryByRole("button", { name: "Replay the decorative lettering" }),
  ).toBeNull();
});

it("shows twenty real catalog covers without promising the launch selection", () => {
  render(<CompactWaitlist />);
  const shelf = screen.getByRole("list", {
    name: "A selection from our existing catalog",
  });
  expect(
    shelf.querySelectorAll(':scope > [data-carousel-copy="original"]'),
  ).toHaveLength(20);
  for (const title of [
    "The General’s Cook",
    "Diana",
    "Acts of Allegiance",
    "The Golden Age of Pirates",
    "The Homestead",
    "The Conquest of Happiness",
  ]) {
    expect(
      screen.getByRole("img", { name: `${title} audiobook cover` }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { level: 3, name: title, exact: true }),
    ).toBeTruthy();
  }
  expect(
    screen.getByText(/Subscription launch titles may differ/),
  ).toBeTruthy();
});

it("matches the hero's ornamental lettering without the old promotional introduction", () => {
  const view = render(<CompactWaitlist />);
  expect(
    screen.getByRole("heading", { level: 2, name: "Explore the catalog" }),
  ).toBeTruthy();
  expect(
    view.container.querySelector("#bookshelf-title svg text")?.textContent,
  ).toBe("E");
  expect(
    view.container.querySelector("#unlimited-title svg text")?.textContent,
  ).toBe("U");
  expect(view.container.querySelectorAll("h1")).toHaveLength(1);
  expect(screen.queryByText("THE AZALEA BOOKSHELF")).toBeNull();
  expect(screen.queryByText(/A little taste of/)).toBeNull();
  expect(screen.queryByText(/Fiction, history, and ideas worth/)).toBeNull();
});

it("emphasizes international exclusives across fiction and nonfiction near signup", () => {
  render(<CompactWaitlist />);
  const exclusives = screen.getByText(
    "Exclusive titles from around the world.",
  );
  expect(exclusives.tagName).toBe("STRONG");
  expect(exclusives.closest("section")?.querySelector("form")).toBeTruthy();
  expect(screen.getByText("Across fiction and nonfiction.")).toBeTruthy();
  expect(screen.queryByText(/For the long walks/)).toBeNull();
});

it("retains the accessible email field and privacy link", () => {
  render(<CompactWaitlist />);
  expect(screen.getByLabelText("Email address").getAttribute("type")).toBe(
    "email",
  );
  expect(
    screen.getByRole("button", { name: "Join the waitlist" }),
  ).toBeTruthy();
  expect(
    screen.getByRole("link", { name: "Privacy" }).getAttribute("href"),
  ).toBe("/privacy");
});

it("presents the two app screenshots without the decorated backdrop or caption", () => {
  render(<CompactWaitlist />);
  const preview = screen.getByRole("figure", {
    name: "Azalea Audio app preview",
  });
  expect(preview.querySelectorAll('[role="img"]')).toHaveLength(2);
  expect(preview.hasAttribute("data-waitlist-part")).toBe(false);
  expect(preview.querySelector('[aria-hidden="true"]')).toBeNull();
  expect(preview.querySelector("figcaption")).toBeNull();
});
