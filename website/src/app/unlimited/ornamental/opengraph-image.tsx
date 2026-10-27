import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { AUDIO_APP_ICON } from "@/lib/audio-branding";

export const alt =
  "The Azalea Audio app — Unlimited audiobooks. 1,000s of titles. $9/mo. Coming early 2027.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Embed the exact shared app asset, without fetching another deployment at build time.
const appIconDataUrl = readFile(
  join(process.cwd(), "public", AUDIO_APP_ICON),
).then((icon) => `data:image/png;base64,${icon.toString("base64")}`);

export default async function CompactOpenGraphImage() {
  const appIcon = await appIconDataUrl;
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#f5f5f0",
          color: "#282142",
          padding: "56px 70px",
          border: "12px solid #ffcf00",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            letterSpacing: 2,
          }}
        >
          <span>AZALEA AUDIO</span>
          <span style={{ fontSize: 16 }}>COMING EARLY 2027</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            marginTop: 70,
          }}
        >
          <img
            src={appIcon}
            alt="Azalea Audio app icon"
            width={177}
            height={177}
            style={{
              borderRadius: 34,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "serif",
              fontSize: 89,
              lineHeight: 1.05,
              letterSpacing: -3,
            }}
          >
            <span>Unlimited</span>
            <span style={{ color: "#3566ff" }}>audiobooks.</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: 25,
            borderTop: "3px solid #00ef82",
          }}
        >
          <span style={{ fontSize: 29 }}>1,000s of titles</span>
          <span style={{ fontSize: 49, fontFamily: "serif" }}>$9 / mo</span>
        </div>
      </div>
    ),
    size,
  );
}
