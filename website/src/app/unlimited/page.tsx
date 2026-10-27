import type { Metadata } from "next";
import { AUDIO_APP_ICON } from "@/lib/audio-branding";
import CompactWaitlist from "./ornamental/compact-waitlist";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.azalea-labs.com"),
  title: "Azalea Audio — Unlimited audiobooks for $9/mo",
  description:
    "Unlimited audiobooks with exclusive titles from around the world, across fiction and nonfiction. 1,000s of titles. $9/mo. Coming early 2027. Join the waitlist.",
  alternates: { canonical: "/unlimited" },
  robots: { index: true, follow: true },
  icons: {
    icon: AUDIO_APP_ICON,
    apple: AUDIO_APP_ICON,
  },
  openGraph: {
    title: "Unlimited audiobooks. $9/mo. | Azalea Audio",
    description:
      "Exclusive titles from around the world, across fiction and nonfiction. 1,000s of titles. $9/mo. Coming early 2027.",
    url: "/unlimited",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function UnlimitedPage() {
  return <CompactWaitlist />;
}
