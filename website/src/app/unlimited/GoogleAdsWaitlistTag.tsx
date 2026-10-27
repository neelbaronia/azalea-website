"use client";

import { useEffect } from "react";
import Script from "next/script";
import {
  initializeWaitlistMeasurement,
  WAITLIST_GOOGLE_ADS_ID,
} from "./google-ads";

function initializeSafely() {
  try {
    initializeWaitlistMeasurement();
  } catch {
    // Blocked analytics must never prevent the waitlist page from working.
  }
}

export default function GoogleAdsWaitlistTag() {
  useEffect(() => {
    initializeSafely();
  }, []);

  return (
    <Script
      id="azalea-waitlist-google-tag"
      src={`https://www.googletagmanager.com/gtag/js?id=${WAITLIST_GOOGLE_ADS_ID}`}
      strategy="afterInteractive"
      onLoad={initializeSafely}
    />
  );
}
