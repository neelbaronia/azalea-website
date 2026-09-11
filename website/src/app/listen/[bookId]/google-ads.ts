// Both must be set to enable the Google Ads tag on /listen/*. When either is
// missing, gtag is never loaded and the button just redirects to Spotify.
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
export const GOOGLE_ADS_SPOTIFY_CLICK_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_SPOTIFY_CLICK_LABEL;

export const googleAdsEnabled = Boolean(
  GOOGLE_ADS_ID && GOOGLE_ADS_SPOTIFY_CLICK_LABEL,
);

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: Gtag;
  }
}

/**
 * Sends the SpotifyClick conversion and resolves once gtag confirms it, or
 * after timeoutMs, whichever is first. Resolves immediately if gtag is off.
 */
export function sendSpotifyClickConversion(timeoutMs = 600): Promise<void> {
  if (!googleAdsEnabled || typeof window === "undefined" || !window.gtag) {
    return Promise.resolve();
  }
  const gtag = window.gtag;
  return new Promise((resolve) => {
    const timer = window.setTimeout(resolve, timeoutMs);
    gtag("event", "conversion", {
      send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_SPOTIFY_CLICK_LABEL}`,
      transport_type: "beacon",
      event_callback: () => {
        window.clearTimeout(timer);
        resolve();
      },
    });
  });
}
