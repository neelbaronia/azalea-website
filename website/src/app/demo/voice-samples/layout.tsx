import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hank Voice Sample — Tally's Corner | Azalea Labs Demo",
  description:
    "Listen to Hank narrate the conclusion chapter of Tally's Corner with synchronized text highlighting.",
};

export default function VoiceSamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
