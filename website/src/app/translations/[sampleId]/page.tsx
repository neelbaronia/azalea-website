import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BilingualReader } from "../_components/bilingual-reader";
import { getSample, samples } from "../_components/sample-catalog";

type SamplePageProps = {
  params: Promise<{ sampleId: string }>;
};

export function generateStaticParams() {
  return samples.map((sample) => ({ sampleId: sample.id }));
}

export async function generateMetadata({ params }: SamplePageProps): Promise<Metadata> {
  const { sampleId } = await params;
  const sample = getSample(sampleId);

  if (!sample) return {};

  const title = `${sample.originalTitle} — ${sample.translator} — Azalea Labs`;
  const description = `A private ${sample.language}-to-English translation sample by ${sample.translator}.`;

  return {
    title,
    description,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title,
      description,
      images: [],
    },
    twitter: {
      title,
      description,
      images: [],
    },
  };
}

export default async function TranslationSamplePage({ params }: SamplePageProps) {
  const { sampleId } = await params;
  const sample = getSample(sampleId);

  if (!sample) notFound();

  return <BilingualReader initialSampleId={sample.id} key={sample.id} />;
}
