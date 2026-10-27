import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
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
