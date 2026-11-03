// Reuse the current iOS AppIcon from cc-audiobook-player (Quiet Corners).
// Site headers, browser/home-screen icons and previews use this artwork,
// except the homepage dial and its resolved header, which keep the Labs flower.
// After changing it, run npm run sync:app-icon to refresh file-based metadata
// and legacy public URLs. Tests guard against stale aliases or logo references.
export const AUDIO_APP_ICON =
  "/subscription-preview/azalea-audio-icon-quiet-corners.png";

// Original transparent flower, intentionally separate from the app icon aliases.
// The scrolling dial tints this mark to match each band's lettering.
export const LABS_DIAL_MARK = "/azalea-labs-flower.webp";
