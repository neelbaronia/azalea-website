export const STICKER_SIZE = 0.3;
export const STICKER_LIFT = 1.045;

const COVER_BASE_URL = "/audiobook-covers";

export const coverStickers = [
  { title: "The Pasha of Cuisine", src: `${COVER_BASE_URL}/skyhorse-the-pasha-of-cuisine.webp`, left: 0.07, top: 0.08, tilt: -10 },
  { title: "The General's Cook", src: `${COVER_BASE_URL}/skyhorse-the-generals-cook.webp`, left: 0.4, top: 0.06, tilt: 8 },
  { title: "Fighting Techniques of the Elite Forces", src: `${COVER_BASE_URL}/skyhorse-fighting-techniques-of-the-elite-forces.webp`, left: 0.63, top: 0.34, tilt: -7 },
  { title: "Cowboys", src: `${COVER_BASE_URL}/skyhorse-cowboys.webp`, left: 0.4, top: 0.62, tilt: 10 },
  { title: "Acts of Allegiance", src: `${COVER_BASE_URL}/skyhorse-acts-of-allegiance.webp`, left: 0.07, top: 0.57, tilt: -8 },
  { title: "The Golden Age of Pirates", src: `${COVER_BASE_URL}/skyhorse-the-golden-age-of-pirates.webp`, left: 0.3, top: 0.33, tilt: 5 },
] as const;

export type CoverSticker = (typeof coverStickers)[number];

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function getStickerBounds(width: number, height: number, sticker: CoverSticker) {
  const size = width * STICKER_SIZE;
  const angle = Math.abs(sticker.tilt) * Math.PI / 180;
  // Reserve space for the rotated corners, lift, and keyboard focus ring.
  const extent = size * (Math.cos(angle) + Math.sin(angle)) * STICKER_LIFT;
  const padding = (extent - size) / 2 + 6;
  const left = padding - width * sticker.left;
  const top = padding - height * sticker.top;

  return {
    left,
    right: Math.max(left, width * (1 - sticker.left) - size - padding),
    top,
    bottom: Math.max(top, height * (1 - sticker.top) - size - padding),
  };
}
