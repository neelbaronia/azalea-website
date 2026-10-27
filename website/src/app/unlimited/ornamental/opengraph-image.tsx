import { ImageResponse } from "next/og";

export const alt =
  "Azalea Audio — Unlimited audiobooks. 1,000s of titles. $9/mo. Coming early 2027.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function CompactOpenGraphImage() {
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 154,
              height: 177,
              background: "#3566ff",
              color: "#ffcf00",
              border: "5px solid #ec4978",
              fontFamily: "serif",
              fontSize: 144,
            }}
          >
            U
          </div>
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
            <span>nlimited</span>
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
