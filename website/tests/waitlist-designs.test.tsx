// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import UnlimitedLandingPage from "@/app/unlimited/landing-page";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => (
    <span role={alt ? "img" : undefined} aria-label={alt || undefined} />
  ),
}));
afterEach(cleanup);

it("replays the ornament without clearing an email being entered", () => {
  render(<UnlimitedLandingPage ornamental />);
  const email = screen.getByLabelText("Email address") as HTMLInputElement;
  fireEvent.change(email, {
    target: { value: "ornament-preview@example.com" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Replay the decorative lettering" }),
  );
  expect(email.value).toBe("ornament-preview@example.com");
  expect(
    screen
      .getByRole("button", { name: "Join the waitlist" })
      .hasAttribute("disabled"),
  ).toBe(false);
});

it("preserves the editorial design without adding ornamental controls", () => {
  const view = render(<UnlimitedLandingPage />);
  expect(
    view.container.querySelector('[data-waitlist-design="editorial"]'),
  ).toBeTruthy();
  expect(
    screen.queryByRole("button", { name: "Replay the decorative lettering" }),
  ).toBeNull();
  expect(screen.getAllByRole("form")).toHaveLength(1);
  expect(screen.getByLabelText("Email address")).toBeTruthy();
});

it("keeps the same real signup form and product previews in the ornamental version", () => {
  const view = render(<UnlimitedLandingPage ornamental />);
  expect(
    view.container.querySelector('[data-waitlist-design="ornamental"]'),
  ).toBeTruthy();
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "One more chapter. No more limits.",
    }),
  ).toBeTruthy();
  expect(screen.getAllByRole("form")).toHaveLength(1);
  expect(screen.getByRole("form").getAttribute("action")).toBe("/api/waitlist");
  expect(
    screen.getByRole("img", {
      name: "Azalea Audio’s current app, showing its audiobook library and book discovery",
    }),
  ).toBeTruthy();
  expect(
    screen.getByRole("link", { name: "Original version" }).getAttribute("href"),
  ).toBe("/unlimited");
});
