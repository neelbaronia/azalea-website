import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tally's Corner — Chapter 6: Men and Jobs | Azalea Labs Demo",
  description:
    "Listen to Chapter 6 of Tally's Corner by Elliot Liebow with synchronized text highlighting. A demo of Azalea Labs narrated audiobooks.",
};

export default function TallysCornerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
