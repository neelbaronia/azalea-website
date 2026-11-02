import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import sharp from "sharp";
import { expect, it } from "vitest";
import { AUDIO_APP_ICON } from "@/lib/audio-branding";

it("ships the unmodified 1024px Quiet Corners app icon from cc-audiobook-player", () => {
  const icon = readFileSync(join(process.cwd(), "public", AUDIO_APP_ICON));
  expect(icon.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(icon.readUInt32BE(16)).toBe(1024);
  expect(icon.readUInt32BE(20)).toBe(1024);
  expect(createHash("sha256").update(icon).digest("hex")).toBe(
    "14c5cfb033b08b1b829bade5afe8d3db798adb3e4e0aaa1eaaad6ec44d668a58",
  );
});

it.each([
  "src/app/icon.png",
  "src/app/opengraph-image.png",
  "public/azalea-icon.png",
  "public/subscription-preview/azalea-audio-icon.png",
])("keeps %s byte-identical to the current icon", (path) => {
  expect(readFileSync(join(process.cwd(), path))).toEqual(
    readFileSync(join(process.cwd(), "public", AUDIO_APP_ICON)),
  );
});

it("keeps the legacy WebP URL on a lossless copy of the current icon", async () => {
  const pixels = (path: string) =>
    sharp(path).ensureAlpha().raw().toBuffer();
  const [actual, expected] = await Promise.all([
    pixels(join(process.cwd(), "public/azalea-icon.webp")),
    pixels(join(process.cwd(), "public", AUDIO_APP_ICON)),
  ]);
  expect(actual).toEqual(expected);
});

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? sourceFiles(path)
      : /\.(?:tsx?|css|html)$/.test(entry.name) ? [path] : [];
  });
}

it("has no old Azalea logo references anywhere in the site's rendered source", () => {
  const root = process.cwd();
  const legacy = /\/(?:azalea-icon\.(?:png|webp)|subscription-preview\/azalea-audio-icon\.png|Stylized Azalea Logo Design\.(?:png|webp))/;
  const outdated = [
    ...sourceFiles(join(root, "src")),
    ...sourceFiles(join(root, "public")),
  ].filter((path) => legacy.test(readFileSync(path, "utf8")));
  expect(outdated.map((path) => relative(root, path))).toEqual([]);
});

it("keeps static pages and translation watermarks on the same current icon", () => {
  for (const path of [
    "public/payout.html",
    "public/storyboard-drafts/index.html",
    "src/app/translations/translations.css",
  ]) {
    expect(readFileSync(join(process.cwd(), path), "utf8")).toContain(AUDIO_APP_ICON);
  }
  const translations = readFileSync(
    join(process.cwd(), "src/app/translations/translations.css"), "utf8",
  );
  expect(translations).not.toContain("mask-image:");
});
