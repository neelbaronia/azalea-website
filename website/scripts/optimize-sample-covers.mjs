import { mkdir } from "node:fs/promises";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import sharp from "sharp";

const runFile = promisify(execFile);
const sourceBase = "https://pub-ee342152cf1149298fc3cb54a286f268.r2.dev";
const outputDirectory = new URL("../public/sample-covers/", import.meta.url);
const featuredBooks = [
  { id: "the-truth-about-the-oj-simpson-trial", extension: "jpg" },
  { id: "cowboys", extension: "png" },
  { id: "the-homestead", extension: "jpg" },
  { id: "a-honeymoon-in-space", extension: "png" },
  { id: "anthropology-and-modern-life", extension: "png" },
  { id: "diana", extension: "png" },
];

const requestedIds = process.argv.slice(2);
const requestedBooks = requestedIds.length > 0
  ? featuredBooks.filter(({ id }) => requestedIds.includes(id))
  : featuredBooks;
if (requestedBooks.length !== (requestedIds.length || featuredBooks.length)) {
  throw new Error("Requested cover IDs must match the featured sample list.");
}

await mkdir(outputDirectory, { recursive: true });

async function optimizeCover({ id, extension }) {
  const sourceUrl = `${sourceBase}/${id}/cover.${extension}`;
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
for (let index = 0; index < requestedBooks.length; index += 2) {
  results.push(...await Promise.all(requestedBooks.slice(index, index + 2).map(optimizeCover)));
}

console.log(JSON.stringify({
  covers: results.length,
  sourceBytes: results.reduce((total, result) => total + result.sourceBytes, 0),
  outputBytes: results.reduce((total, result) => total + result.outputBytes, 0),
}));
