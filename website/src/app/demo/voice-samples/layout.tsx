import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voice Samples — Tally's Corner | Azalea Labs Demo",
  description:
    "Compare different voice narrations of Tally's Corner with synchronized text highlighting. A demo of Azalea Labs narrated audiobooks.",
};

export default function VoiceSamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
