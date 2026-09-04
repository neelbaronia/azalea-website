import type { Metadata } from "next";
import { SampleLibrary } from "./_components/sample-library";

export const metadata: Metadata = {
  title: "Translation Samples | Azalea Labs",
};

export default function TranslationsPage() {
  return <SampleLibrary />;
}
