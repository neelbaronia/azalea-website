export const STICKER_SIZE = 0.3;
export const STICKER_LIFT = 1.045;

export const coverStickers = [
  { title: "The Red Seal", src: "/audiobook-covers/red-seal.png", left: 0.07, top: 0.08, tilt: -10 },
  { title: "The Hand in the Dark", src: "/audiobook-covers/hand-in-the-dark.png", left: 0.4, top: 0.06, tilt: 8 },
  { title: "The Sign of the Seven Sins", src: "/audiobook-covers/sign-seven-sins.png", left: 0.63, top: 0.34, tilt: -7 },
  { title: "The Phantom Public", src: "/audiobook-covers/phantom-public.png", left: 0.4, top: 0.62, tilt: 10 },
  { title: "Tarrano the Conqueror", src: "/audiobook-covers/tarrano.png", left: 0.07, top: 0.57, tilt: -8 },
  { title: "The Evolution of the Oil Industry", src: "/audiobook-covers/oil-industry.png", left: 0.3, top: 0.33, tilt: 5 },
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
