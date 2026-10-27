import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { ImageResponse } from "next/og";
import { afterEach, expect, it, vi } from "vitest";
import CanonicalThumbnail, * as canonical from "@/app/unlimited/opengraph-image";
import OrnamentalThumbnail, * as ornamental from "@/app/unlimited/ornamental/opengraph-image";
import { AUDIO_APP_ICON } from "@/lib/audio-branding";

vi.mock("next/og", () => ({
  ImageResponse: vi.fn(function () {
    return new Response("thumbnail test");
  }),
}));
afterEach(() => vi.clearAllMocks());

it.each([
  ["canonical", CanonicalThumbnail, canonical],
  ["ornamental", OrnamentalThumbnail, ornamental],
] as const)(
  "embeds the current app icon in the %s shared-link thumbnail",
  async (_name, createThumbnail, metadata) => {
    const response = await createThumbnail();
    expect(response.status).toBe(200);
    const [element, options] = vi.mocked(ImageResponse).mock.calls[0];
    const markup = renderToStaticMarkup(element);
    const embedded = markup.match(
      /<img[^>]+src="data:image\/png;base64,([^"]+)"/,
    );
    expect(embedded).toBeTruthy();
    const actual = createHash("sha256")
      .update(Buffer.from(embedded![1], "base64"))
      .digest("hex");
    const expected = createHash("sha256")
      .update(readFileSync(join(process.cwd(), "public", AUDIO_APP_ICON)))
      .digest("hex");
    expect(actual).toBe(expected);
    expect(options).toEqual({ width: 1200, height: 630 });
    expect(metadata.size).toEqual(options);
    expect(metadata.contentType).toBe("image/png");
    expect(metadata.alt).toContain("The Azalea Audio app");
    for (const copy of [
      "Unlimited",
      "audiobooks.",
      "1,000s of titles",
      "$9 / mo",
      "COMING EARLY 2027",
    ]) {
      expect(markup).toContain(copy);
    }
    expect(markup).not.toContain(">nlimited<");
    expect(markup).not.toContain("https://");
  },
);
