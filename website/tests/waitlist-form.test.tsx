// @vitest-environment jsdom
import React from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import WaitlistForm from "@/app/unlimited/waitlist-form";
import { sendWaitlistSignupConversion } from "@/app/unlimited/google-ads";

vi.mock("@/app/unlimited/google-ads", () => ({
  sendWaitlistSignupConversion: vi.fn(),
}));

afterEach(() => {
  vi.clearAllMocks();
  cleanup();
  vi.unstubAllGlobals();
  delete (window as Window & { dataLayer?: unknown[] }).dataLayer;
  window.history.replaceState({}, "", "/");
});

it("confirms a compact signup without adding long marketing copy", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, alreadySubscribed: false }),
      }),
  );
  render(<WaitlistForm compact />);
  submit();
  await screen.findByText("We’ll email you at launch.");
  expect(screen.queryByText("Be first to hear when we launch.")).toBeNull();
});

it("includes campaign tags in the new-signup measurement hook without email", async () => {
  window.history.replaceState(
    {},
    "",
    "/unlimited/ornamental?utm_source=instagram&utm_campaign=early2027",
  );
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, alreadySubscribed: false }),
      }),
  );
  render(<WaitlistForm compact />);
  submit();
  await screen.findByText("You’re on the list.");
  expect((window as Window & { dataLayer?: unknown[] }).dataLayer).toEqual([
    {
      event: "azalea_waitlist_signup",
      product: "unlimited",
      utm_source: "instagram",
      utm_campaign: "early2027",
    },
  ]);
});

function submit() {
  fireEvent.change(screen.getByLabelText("Email address"), {
    target: { value: "reader@example.com" },
  });
  fireEvent.submit(screen.getByRole("form"));
}

it("saves an email, confirms success, and emits a conversion without email", async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, alreadySubscribed: false }),
  });
  vi.stubGlobal("fetch", fetchMock);
  render(<WaitlistForm />);
  submit();
  await screen.findByText("You’re on the list.");
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/waitlist",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ email: "reader@example.com", website: "" }),
    }),
  );
  const events = (window as Window & { dataLayer?: unknown[] }).dataLayer;
  expect(events).toEqual([
    { event: "azalea_waitlist_signup", product: "unlimited" },
  ]);
  expect(JSON.stringify(events)).not.toContain("reader@example.com");
  expect(sendWaitlistSignupConversion).toHaveBeenCalledTimes(1);
  await waitFor(() =>
    expect(document.activeElement).toBe(screen.getByRole("status")),
  );
});

it("does not count a repeat signup as a new conversion", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, alreadySubscribed: true }),
    }),
  );
  render(<WaitlistForm />);
  submit();
  await screen.findByText("You’re on the list.");
  expect(
    (window as Window & { dataLayer?: unknown[] }).dataLayer,
  ).toBeUndefined();
  expect(sendWaitlistSignupConversion).not.toHaveBeenCalled();
});

it("keeps a saved signup successful even if analytics fails", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ success: true }) }),
  );
  (window as Window & { dataLayer?: unknown[] }).dataLayer = Object.freeze(
    [],
  ) as unknown as unknown[];
  render(<WaitlistForm />);
  submit();
  await screen.findByText("You’re on the list.");
  expect(screen.queryByRole("alert")).toBeNull();
});

it("shows an error and allows retry when saving fails", async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: false,
    json: async () => ({ error: "Please try again." }),
  });
  vi.stubGlobal("fetch", fetchMock);
  render(<WaitlistForm />);
  submit();
  expect(await screen.findByRole("alert")).toHaveProperty(
    "textContent",
    "Please try again.",
  );
  expect(
    screen
      .getByRole("button", { name: "Join the waitlist" })
      .hasAttribute("disabled"),
  ).toBe(false);
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({ success: true }),
  });
  submit();
  await screen.findByText("You’re on the list.");
});

it("does not claim success for a failed network request", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new TypeError("Network unavailable")),
  );
  render(<WaitlistForm />);
  submit();
  await screen.findByRole("alert");
  expect(screen.queryByText("You’re on the list.")).toBeNull();
});

it("prevents repeated requests while saving", async () => {
  const fetchMock = vi.fn().mockReturnValue(new Promise(() => {}));
  vi.stubGlobal("fetch", fetchMock);
  render(<WaitlistForm />);
  submit();
  fireEvent.submit(screen.getByRole("form"));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
});
