import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ASH Voice Sample — Tally's Corner | Azalea Labs Demo",
  description:
    "Listen to ASH narrate Lovers and Exploiters from Tally's Corner with synchronized text highlighting.",
};

export default function VoiceSamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
