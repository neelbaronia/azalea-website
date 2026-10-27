import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";
import { featuredBooks } from "@/app/unlimited/ornamental/featured-books";

it("provides twenty distinct catalog titles with usable cover assets and short metadata", () => {
  expect(featuredBooks).toHaveLength(20);
  expect(new Set(featuredBooks.map((book) => book.id)).size).toBe(20);
  expect(new Set(featuredBooks.map((book) => book.image)).size).toBe(20);
  for (const book of featuredBooks) {
    if (book.image.startsWith("https://")) {
      expect(new URL(book.image).hostname).toBe(
        "pub-ee342152cf1149298fc3cb54a286f268.r2.dev",
      );
    } else {
      expect(
        existsSync(resolve(process.cwd(), "public/sample-covers", book.image)),
      ).toBe(true);
    }
    expect(book.categories.length).toBeGreaterThan(0);
    expect(book.categories.join(" ")).not.toMatch(/\b[A-Z]{3}\d{6}\b/);
    expect(book.description.split(/\s+/).length).toBeLessThanOrEqual(24);
    expect(book.description).not.toMatch(/^Audiobook version of/i);
  }
});
