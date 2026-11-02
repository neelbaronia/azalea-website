import { copyFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const branding = await readFile(new URL("src/lib/audio-branding.ts", root), "utf8");
const icon = branding.match(/export const AUDIO_APP_ICON\s*=\s*"([^"]+)"/)?.[1];
if (!icon?.startsWith("/")) throw new Error("Missing AUDIO_APP_ICON asset path");
const source = new URL(`public${icon}`, root);

// Keep old links/bookmarks working, but never serve the superseded artwork.
for (const path of [
  "src/app/icon.png",
  "src/app/opengraph-image.png",
  "public/azalea-icon.png",
  "public/subscription-preview/azalea-audio-icon.png",
]) {
  await copyFile(source, new URL(path, root));
}
await sharp(fileURLToPath(source))
  .webp({ lossless: true })
  .toFile(fileURLToPath(new URL("public/azalea-icon.webp", root)));
console.log("Updated browser, link-preview, and legacy icon assets from AUDIO_APP_ICON.");
