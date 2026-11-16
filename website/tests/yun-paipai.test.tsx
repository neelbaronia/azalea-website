// @vitest-environment jsdom
import React from "react";
import { createHash } from "node:crypto";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { BilingualReader } from "@/app/translations/_components/bilingual-reader";
import { SampleLibrary } from "@/app/translations/_components/sample-library";
import { getSample, samples } from "@/app/translations/_components/sample-catalog";
import { yunPaipaiOpeningHeading, yunPaipaiOriginalParagraphs, yunPaipaiPairs, yunPaipaiParagraphs, yunPaipaiSentenceGroups, yunPaipaiTranslatorNotes } from "@/app/translations/_components/yun-paipai-text-samples";
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
    pairs: yunPaipaiPairs, translationNotes: yunPaipaiTranslatorNotes,
    translationOpeningHeading: yunPaipaiOpeningHeading,
  });
  expect(sample.translationParagraphs).toBeUndefined();
  expect(getSample("jewel-crab-yun-liu")!.pairs.length).toBeGreaterThan(0);
  expect(sample.translationProcessNote).toBeUndefined();
});

it("aligns all sentences and clauses while preserving both complete submitted texts", () => {
  const withoutWhitespace = (text: string) => text.replace(/\s/gu, "");
  expect(yunPaipaiOriginalParagraphs).toHaveLength(28);
  expect(createHash("sha256").update(yunPaipaiOriginalParagraphs.join("\n\n")).digest("hex")).toBe(
    "8ffa413245f53b6a74c68bd7602a046590796646d190b4573d14528e443aa8f3",
  );
  expect(yunPaipaiPairs).toHaveLength(177);
  expect(yunPaipaiSentenceGroups.map((group) => group.length)).toEqual([
    6, 7, 11, 6, 13, 1, 6, 8, 1, 4, 7, 6, 8, 6, 1, 10, 7, 5, 4, 1, 6, 5, 10, 9, 6, 1, 8, 14,
  ]);
  yunPaipaiSentenceGroups.forEach((group, paragraph) => {
    expect(group.map((pair) => pair.original).join("")).toBe(yunPaipaiOriginalParagraphs[paragraph]);
    const expectedEnglish = yunPaipaiParagraphs[paragraph + 1];
    expect(withoutWhitespace(group.map((pair) => pair.translation).join(""))).toBe(withoutWhitespace(expectedEnglish));
  });
  expect(yunPaipaiPairs.filter((pair) => /^[二三四五]$/.test(pair.original))).toEqual([
    { original: "二", translation: "2" },
    { original: "三", translation: "3" },
    { original: "四", translation: "4" },
    { original: "五", translation: "5" },
  ]);
  expect(yunPaipaiPairs.every((pair) => pair.original && pair.translation)).toBe(true);
  expect(yunPaipaiPairs.slice(0, 2)).toEqual([
    { original: "拍拍阿叔不是一个人，", translation: "Uncle Paipai[1] isn't one person." },
    { original: "拍拍阿叔是一伙在屋里打手势的人。", translation: "Uncle Paipai is a group of people who gesture in a room." },
  ]);
  expect(yunPaipaiPairs.find((pair) => pair.translation === "Perhaps he felt the same.")?.original).toBe("他大概也是一样。");
  expect(yunPaipaiPairs.find((pair) => pair.translation === "Grandma said it must be a toy phone Dad had bought for me specially.")?.original).toBe("奶奶说，一定是爸爸特意给我买的玩具手机。");
  expect(yunPaipaiTranslatorNotes).toEqual(yunPaipaiParagraphs.slice(30));
  expect(yunPaipaiOpeningHeading).toBe("1");
  expect(yunPaipaiPairs.some((pair) => pair.translation.includes("Translator’s notes"))).toBe(false);
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

it("opens the bilingual reader, aligns both languages, and paginates all text and notes", () => {
  const { container } = render(<BilingualReader initialSampleId="paipai-yun-liu" />);
  expect(screen.getByRole("heading", { level: 2, name: "Paipai" })).toBeTruthy();
  expect(screen.getByRole("heading", { level: 2, name: "拍拍" })).toBeTruthy();
  expect(screen.getByText("By 王占黑")).toBeTruthy();
  expect(screen.getByRole("article", { name: "Bilingual title pages" })).toBeTruthy();
  const next = () => screen.getAllByRole("button", { name: "Next spread", exact: true })[0] as HTMLButtonElement;
  fireEvent.click(next());
  expect(screen.getByRole("article", { name: "Side-by-side Chinese and English story excerpt, spread 1" })).toBeTruthy();
  expect(screen.getByText(yunPaipaiPairs[0].original)).toBeTruthy();
  expect(screen.getByRole("heading", { name: "English section 1" }).closest(".sentence-pair")).toBeNull();
  const firstEnglish = screen.getByRole("button", { name: "English sentence 1", exact: true });
  expect(firstEnglish.textContent).toContain("Uncle Paipai[1] isn't one person.");
  fireEvent.click(firstEnglish);
  expect(container.querySelector('.sentence-pair[data-sentence-pair="0"]')?.classList.contains("is-active")).toBe(true);
  fireEvent.pointerEnter(container.querySelector('.sentence-pair[data-sentence-pair="1"]')!);
  expect(container.querySelector('.sentence-pair[data-sentence-pair="1"]')?.classList.contains("is-active")).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Chinese sentence 2", exact: true }));
  fireEvent.keyDown(screen.getByRole("button", { name: "English sentence 3", exact: true }), { key: "Enter" });
  expect(container.querySelector('.sentence-pair[data-sentence-pair="2"]')?.classList.contains("is-active")).toBe(true);
  expect(container.querySelectorAll(".sentence-pair.is-active")).toHaveLength(1);
  const originals: string[] = [];
  const translations: string[] = [];
  const readSpread = () => {
    container.querySelectorAll(".sentence-pair").forEach((row) => {
      originals.push(row.querySelector('[lang="zh"]')?.textContent ?? "");
      translations.push(row.querySelector('[lang="en"]')?.textContent ?? "");
    });
  };
  readSpread();
  let turns = 1;
  while (!next().disabled && turns < 40) {
    fireEvent.click(next());
    readSpread();
    turns += 1;
  }
  expect(turns).toBeLessThan(40);
  expect(next().disabled).toBe(true);
  expect(screen.getByText("End of sample")).toBeTruthy();
  expect(container.textContent).toContain(yunPaipaiParagraphs.at(-1)!);
  expect(originals).toEqual(yunPaipaiPairs.map((pair) => pair.original));
  expect(translations).toEqual(yunPaipaiPairs.map((pair) => pair.translation));
  const notes = screen.getByRole("complementary", { name: "Translator’s notes" });
  yunPaipaiTranslatorNotes.forEach((note) => expect(notes.textContent).toContain(note));
  expect(notes.closest(".sentence-pair")).toBeNull();
});
