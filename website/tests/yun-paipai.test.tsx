// @vitest-environment jsdom
import React from "react";
import { createHash } from "node:crypto";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { BilingualReader } from "@/app/translations/_components/bilingual-reader";
import { SampleLibrary } from "@/app/translations/_components/sample-library";
import { getSample, samples } from "@/app/translations/_components/sample-catalog";
import { yunPaipaiParagraphs } from "@/app/translations/_components/yun-paipai-text-samples";
import { generateMetadata, generateStaticParams } from "@/app/translations/[sampleId]/page";

beforeEach(() => {
  vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("registers Yun's second submission beside Jewel Crab without changing her first sample", () => {
  const yun = samples.filter((sample) => sample.translator === "Yun Liu");
  expect(yun.map((sample) => sample.id)).toEqual(["jewel-crab-yun-liu", "paipai-yun-liu"]);
  const sample = getSample("paipai-yun-liu")!;
  expect(sample).toMatchObject({
    originalTitle: "拍拍", translatedTitle: "Paipai", author: "王占黑",
    englishAuthor: "Wang Zhanhei", languageCode: "zh", translator: "Yun Liu",
    sourceUrl: "https://www.chinawriter.com.cn/n1/2025/0113/c418962-40400995.html",
    pairs: [], translationParagraphs: yunPaipaiParagraphs,
  });
  expect(getSample("jewel-crab-yun-liu")!.pairs.length).toBeGreaterThan(0);
  expect(sample.translationProcessNote).toBeUndefined();
});

it("preserves all five sections, the full submitted wording, and all four translator notes", () => {
  expect(yunPaipaiParagraphs).toHaveLength(34);
  expect(yunPaipaiParagraphs.filter((paragraph) => /^[1-5]$/.test(paragraph))).toEqual(["1", "2", "3", "4", "5"]);
  const text = yunPaipaiParagraphs.join("\n\n");
  expect(createHash("sha256").update(text).digest("hex")).toBe(
    "0682c1872a595411d0a513b19996396b3c74c0559de6cd8c7b3788361d7aa037",
  );
  expect(text.match(/\[[1-4]\]/g)).toEqual(["[1]", "[2]", "[3]", "[4]"]);
  expect(yunPaipaiParagraphs.slice(-5)).toEqual([
    "Translator’s notes",
    "1. Pai means to pat or tap.",
    "2. Subei refers to northern Jiangsu province. Migrants from Subei formed a large community in Shanghai and were often looked down on there.",
    "3. Red indicates a hundred-yuan note.",
    "4. The City God Temple is an old temple and bazaar quarter in central Shanghai.",
  ]);
  expect(text).not.toMatch(/PARSED TEXT|Claude|DeepSeek|chat\.deepseek|Translated from Chinese by Yun Liu/i);
});

it("includes the new route in static generation and retains private/no-index metadata", async () => {
  expect(generateStaticParams()).toContainEqual({ sampleId: "paipai-yun-liu" });
  const metadata = await generateMetadata({ params: Promise.resolve({ sampleId: "paipai-yun-liu" }) });
  expect(metadata.title).toBe("拍拍 — Yun Liu — Azalea Labs");
  expect(metadata.robots).toEqual({ index: false, follow: false });
});

it("lists both submitted samples when the library is filtered to Yun", () => {
  render(<SampleLibrary />);
  fireEvent.change(screen.getByLabelText("Translator"), { target: { value: "Yun Liu" } });
  expect(screen.getByText("Paipai", { exact: true })).toBeTruthy();
  expect(screen.getByText("Jewel Crab", { exact: true })).toBeTruthy();
  const links = screen.getAllByRole("link", { name: "Read translation" });
  expect(links).toHaveLength(2);
  expect(links.map((link) => link.getAttribute("href"))).toEqual([
    "/translations/jewel-crab-yun-liu", "/translations/paipai-yun-liu",
  ]);
});

it("opens the English reader, supports page turns, and reaches the closing notes", () => {
  render(<BilingualReader initialSampleId="paipai-yun-liu" />);
  expect(screen.getByRole("heading", { level: 2, name: "Paipai" })).toBeTruthy();
  expect(screen.getByText("By Wang Zhanhei")).toBeTruthy();
  expect(screen.getByRole("article", { name: "English translation title page" })).toBeTruthy();
  const next = () => screen.getAllByRole("button", { name: "Next page", exact: true })[0] as HTMLButtonElement;
  fireEvent.click(next());
  expect(screen.getByText(yunPaipaiParagraphs[1])).toBeTruthy();
  let turns = 1;
  while (!next().disabled && turns < 40) {
    fireEvent.click(next());
    turns += 1;
  }
  expect(turns).toBeLessThan(40);
  expect(next().disabled).toBe(true);
  expect(screen.getByText("End of sample")).toBeTruthy();
  expect(screen.getByText(yunPaipaiParagraphs.at(-1)!)).toBeTruthy();
});
