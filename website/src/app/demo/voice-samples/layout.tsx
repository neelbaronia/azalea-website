import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voice Samples — Tally's Corner | Azalea Labs Demo",
  description:
    "Compare narration voices for Lovers and Exploiters from Tally's Corner with synchronized text highlighting.",
};

export default function VoiceSamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
