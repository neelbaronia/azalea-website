"use client";

import type { MouseEvent } from "react";
import { sendSpotifyClickConversion } from "./google-ads";

const FORWARDED_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];

// Only plain utm_* values are forwarded; gclid, si and anything else are dropped.
function withUtmParams(spotifyUrl: string): string {
  const inbound = new URLSearchParams(window.location.search);
  const outbound = new URL(spotifyUrl);
  for (const key of FORWARDED_PARAMS) {
    const value = inbound.get(key);
    if (value && value.length <= 100) outbound.searchParams.set(key, value);
  }
  return outbound.toString();
}

interface Props {
  spotifyUrl: string;
  className?: string;
}

export default function ListenButton({ spotifyUrl, className }: Props) {
  async function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // Let cmd/ctrl/middle-click open a tab normally (the href is the backup).
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
      return;
    }
    event.preventDefault();

    const destination = withUtmParams(spotifyUrl);
    await sendSpotifyClickConversion();
    window.location.assign(destination);
  }

  return (
    <a
      href={spotifyUrl}
      target="_blank"
      rel="noopener"
      className={className}
      onClick={handleClick}
    >
      Listen on Spotify
    </a>
  );
}
