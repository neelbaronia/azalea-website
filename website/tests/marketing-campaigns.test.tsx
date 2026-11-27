// @vitest-environment jsdom
import React from "react";
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { Campaign } from "@/app/marketing/marketing-types";
import { getMarketingSlides } from "@/app/marketing/marketing-types";
import MarketingPage from "@/app/marketing/page";

const { captureCampaigns } = vi.hoisted(() => ({ captureCampaigns: vi.fn() }));
vi.mock("@/app/marketing/marketing-carousel", () => ({
  default: ({ campaigns }: { campaigns: Campaign[] }) => {
    captureCampaigns(campaigns);
    return null;
  },
}));
vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

afterEach(() => {
  cleanup();
  captureCampaigns.mockClear();
});

function pageCampaigns(): Campaign[] {
  render(<MarketingPage />);
  return captureCampaigns.mock.calls.at(-1)![0] as Campaign[];
}

it("features the selected JFK and O.J. films first without removing the four earlier examples", () => {
  const campaigns = pageCampaigns();
  const originalOrder = campaigns.flatMap((campaign) => campaign.clips.map((clip) => clip.id));
  const slides = getMarketingSlides(campaigns);
  expect(slides.map(({ clip }) => clip.id)).toEqual([
    "killing-kennedy-bus",
    "oj-glove-dare",
    "oj-evidence-02",
    "restorative-teacher-as-facilitator",
    "kennedy-evidence-09a",
    "kremlin-wives-polina-zhemchuzhina",
  ]);
  expect(slides.map((slide) => slide.number)).toEqual([1, 2, 3, 4, 5, 6]);
  expect(campaigns.flatMap((campaign) => campaign.clips.map((clip) => clip.id))).toEqual(originalOrder);
});

it("uses the approved full-film assets and labels synthetic scenes rather than audiobook excerpts", () => {
  const [kennedy, oj] = getMarketingSlides(pageCampaigns());
  expect(kennedy.clip.video).toBe("/marketing/microdramas/killing-kennedy-bus.mp4");
  expect(oj.clip.video).toBe("/marketing/microdramas/oj-glove-dare.mp4");
  for (const { clip } of [kennedy, oj]) {
    expect(clip.poster).toBe(clip.video.replace(/\.mp4$/, ".jpg"));
    expect(clip.format).toMatch(/AI-created/);
    expect(clip.format).not.toMatch(/audiobook excerpt/i);
    expect(clip.note).toMatch(/not archival footage/);
  }
  expect(kennedy.clip.caption).toMatch(/not a claim that we can know what Kennedy would have done/);
  expect(oj.clip.caption).toMatch(/Bailey’s recollection/);
  expect(oj.clip.caption).toMatch(/shrinkage and latex gloves/);
});

it("keeps the existing book destinations and original Evidence File captions", () => {
  const campaigns = pageCampaigns();
  expect(campaigns.find((campaign) => campaign.id === "kennedy")?.spotify).toBe(
    "https://open.spotify.com/show/6PLTDAQcC6aIFOdOMWE2bN",
  );
  expect(campaigns.find((campaign) => campaign.id === "oj")?.spotify).toBe(
    "https://open.spotify.com/show/75D1hObxJKNo3s5CGktk1f",
  );
  const slides = getMarketingSlides(campaigns);
  expect(slides.find(({ clip }) => clip.id === "oj-evidence-02")?.clip.caption).toContain(
    "A witness observation and a prosecution theory are not the same thing.",
  );
  expect(slides.find(({ clip }) => clip.id === "kennedy-evidence-09a")?.clip.caption).toContain(
    "Two accounts place different caskets at Bethesda",
  );
});
