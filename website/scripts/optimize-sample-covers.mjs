import { mkdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import sharp from "sharp";

const runFile = promisify(execFile);
const sourceBase = "https://pub-ee342152cf1149298fc3cb54a286f268.r2.dev";
const outputDirectory = new URL("../public/sample-covers/", import.meta.url);
const featuredIds = [
  "a-honeymoon-in-space",
  "anthropology-and-modern-life",
  "diana",
  "tarrano-the-conqueror",
  "the-conquest-of-happiness-project-gutenberg",
  "the-phantom-public",
];

await mkdir(outputDirectory, { recursive: true });

async function optimizeCover(id) {
  const sourceUrl = `${sourceBase}/${id}/cover.png`;
  const { stdout: source } = await runFile("curl", [
    "--fail", "--silent", "--show-error", "--location",
    "--max-time", "90", "--retry", "2", sourceUrl,
  ], { encoding: "buffer", maxBuffer: 32 * 1024 * 1024 });
  const destination = fileURLToPath(new URL(`${id}.webp`, outputDirectory));
  const image = await sharp(source)
    .rotate()
    .resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(destination);

  const result = { id, sourceBytes: source.length, outputBytes: image.size, width: image.width, height: image.height };
  console.log(JSON.stringify(result));
  return result;
}

// Keep the large source downloads bounded instead of saturating the connection.
const results = [];
for (let index = 0; index < featuredIds.length; index += 2) {
  results.push(...await Promise.all(featuredIds.slice(index, index + 2).map(optimizeCover)));
}

console.log(JSON.stringify({
  covers: results.length,
  sourceBytes: results.reduce((total, result) => total + result.sourceBytes, 0),
  outputBytes: results.reduce((total, result) => total + result.outputBytes, 0),
}));
