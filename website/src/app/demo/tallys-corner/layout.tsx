import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tally's Corner — Husbands and Wives | Azalea Labs Demo",
  description:
    "Listen to Husbands and Wives from Tally's Corner by Elliot Liebow with synchronized text highlighting. A narration sample for rights holder review.",
};

export default function TallysCornerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
