// Public destination from the dedicated Sign-up action, not SpotifyClick.
export const WAITLIST_GOOGLE_ADS_ID = "AW-18443602932";
export const WAITLIST_GOOGLE_ADS_DESTINATION =
  "AW-18443602932/a8dUCIOP9asdEPSXzNpE";

type MeasurementWindow = Window & {
  dataLayer?: unknown[];
  azaleaWaitlistMeasurementReady?: boolean;
};

export function initializeWaitlistMeasurement() {
  if (typeof window === "undefined") return;
  const target = window as MeasurementWindow;
  if (target.azaleaWaitlistMeasurementReady) return;
  target.dataLayer = target.dataLayer || [];
  if (!target.gtag) {
    target.gtag = function () {
      // Google's command queue uses the native arguments object.
      // eslint-disable-next-line prefer-rest-params
      target.dataLayer!.push(arguments);
    };
  }
  // No storage or personalization consent is granted implicitly.
  // Cookieless measurement can be incomplete; attribution is not exact.
  target.gtag("consent", "default", {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  target.gtag("js", new Date());
  target.gtag("config", WAITLIST_GOOGLE_ADS_ID, {
    send_page_view: false,
    allow_ad_personalization_signals: false,
    allow_enhanced_conversions: false,
  });
  target.azaleaWaitlistMeasurementReady = true;
}

/** Only after the API confirms a new, non-duplicate saved signup. */
export function sendWaitlistSignupConversion() {
  initializeWaitlistMeasurement();
  if (typeof window === "undefined") return;
  window.gtag?.("event", "conversion", {
    send_to: WAITLIST_GOOGLE_ADS_DESTINATION,
    value: 0,
    currency: "USD",
  });
}
