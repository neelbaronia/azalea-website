import type { Metadata } from "next";
import "./translations.css";

export const metadata: Metadata = {
  title: "Translation Sample Library — Azalea Labs",
  description: "Private side-by-side translation samples from Azalea Labs.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function TranslationsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
