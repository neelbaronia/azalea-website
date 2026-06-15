import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scottish Miscellany — Marketing Assets | Azalea Labs",
  description:
    "Per-platform promo clips and captions for Scottish Miscellany by Jonathan Green.",
};

export default function MarketingPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
