// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import SignUpPage from "@/app/signup/page";
import { CoverStickers } from "@/app/signup/cover-stickers";
import { AUDIO_APP_ICON } from "@/lib/audio-branding";

const mocks = vi.hoisted(() => ({ signUp: vi.fn() }));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({ auth: { signUp: mocks.signUp } }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
    width,
    height,
  }: React.ImgHTMLAttributes<HTMLImageElement>) =>
    React.createElement("img", { src, alt, className, width, height }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private callback: ResizeObserverCallback) {}
      observe(target: Element) {
        this.callback(
          [
            {
              target,
              contentRect: { width: 292, height: 292 },
            } as ResizeObserverEntry,
          ],
          this as unknown as ResizeObserver,
        );
      }
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("uses the current iOS icon in both signup headers without the old green backing", () => {
  render(<SignUpPage />);
  const logos = screen.getAllByAltText("Azalea");
  expect(logos).toHaveLength(2);
  for (const logo of logos) {
    expect(logo.getAttribute("src")).toBe(AUDIO_APP_ICON);
    expect(logo.getAttribute("class")).not.toContain("bg-[#1f6b4e]");
    expect(logo.getAttribute("class")).not.toMatch(/\bp-1/);
  }
  expect(mocks.signUp).not.toHaveBeenCalled();
});

it("removes the visible drag hint while keeping unique hidden keyboard instructions and both Reset controls", () => {
  const view = render(<SignUpPage />);
  expect(screen.queryByText("Drag the stickers around.")).toBeNull();
  expect(
    screen.getAllByRole("button", { name: "Reset sticker positions" }),
  ).toHaveLength(2);
  const stickers = screen.getAllByRole("button", { name: /^Move .+ sticker$/ });
  expect(stickers).toHaveLength(12);
  const instructions = new Set(
    stickers.map((sticker) => sticker.getAttribute("aria-describedby")),
  );
  expect(instructions.size).toBe(2);
  for (const id of instructions) {
    const hint = view.container.querySelector(`[id="${id}"]`);
    expect(hint?.className).toBe("sr-only");
    expect(hint?.textContent).toContain("Use the arrow keys");
  }
});

it("keeps keyboard sticker movement and resetting the original positions working", () => {
  render(<CoverStickers />);
  const first = screen.getByRole("button", {
    name: "Move The Pasha of Cuisine sticker",
  });
  expect(first.style.zIndex).toBe("1");
  fireEvent.keyDown(first, { key: "ArrowRight" });
  expect(first.style.zIndex).toBe("6");
  fireEvent.click(
    screen.getByRole("button", { name: "Reset sticker positions" }),
  );
  const reset = screen.getByRole("button", {
    name: "Move The Pasha of Cuisine sticker",
  });
  expect(reset).not.toBe(first);
  expect(reset.style.zIndex).toBe("1");
});
