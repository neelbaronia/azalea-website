import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { landonRosauroParagraphs } from "../../translations/_components/landon-text-samples";
import { lailaMemoryOfAshesPairs } from "../../translations/_components/text-sample";
import styles from "./variants.module.css";

export const metadata: Metadata = {
  title: "Data Page Design Studies | Azalea Labs",
  description: "Design studies for Azalea Labs' data licensing pages.",
  robots: { index: false, follow: false },
};

type Study = {
  number: string;
  name: string;
  idea: string;
  theme: "paper" | "terminal" | "index";
};

const studies: Study[] = [
  { number: "01", name: "PAPER SPLIT", idea: "warm / paired / legible", theme: "paper" },
  { number: "02", name: "NIGHTLINE", idea: "dense / technical / high-contrast", theme: "terminal" },
  { number: "03", name: "ARCHIVE INDEX", idea: "quiet / numbered / collectible", theme: "index" },
];

const mappingSample = {
  source: lailaMemoryOfAshesPairs[0].original,
  target: lailaMemoryOfAshesPairs[0].translation,
  documentId: "azl-fr-0001:s0001",
};

const blockSample = landonRosauroParagraphs.slice(0, 3).join("\n\n");

function clip(value: string, length: number) {
  return value.length > length ? value.slice(0, length - 1) + "…" : value;
}

function JsonPreview({
  value,
  language,
  documentId,
  className,
}: {
  value: string;
  language: string;
  documentId: string;
  className?: string;
}) {
  return (
    <pre className={className}>
      <span className={styles.brace}>{"{\n  "}</span>
      <span className={styles.key}>{'"segment_id"'}</span>
      <span className={styles.punctuation}>{": "}</span>
      <span className={styles.meta}>{JSON.stringify(documentId)}</span>
      <span className={styles.punctuation}>{",\n  "}</span>
      <span className={styles.key}>{'"language"'}</span>
      <span className={styles.punctuation}>{": "}</span>
      <span className={styles.language}>{JSON.stringify(language)}</span>
      <span className={styles.punctuation}>{",\n  "}</span>
      <span className={styles.key}>{'"text"'}</span>
      <span className={styles.punctuation}>{": "}</span>
      <span className={styles.text}>{JSON.stringify(clip(value, 260))}</span>
      <span className={styles.punctuation}>{",\n  "}</span>
      <span className={styles.key}>{'"segment_index"'}</span>
      <span className={styles.punctuation}>{": "}</span>
      <span className={styles.meta}>0</span>
      <span className={styles.punctuation}>{"\n}"}</span>
    </pre>
  );
}

function MappingPreview({ theme }: { theme: Study["theme"] }) {
  return (
    <section className={styles.previewCard}>
      <div className={styles.previewHeader}>
        <span>TRANSLATION MAPPING</span>
        <span>FR → EN</span>
      </div>
      <div className={styles.mappingPreview}>
        <div className={styles.side}>
          <div className={styles.sideHeader}><span>− original</span><span>fr</span></div>
          <JsonPreview
            className={theme === "terminal" ? styles.miniCodeTerminal : styles.miniCode}
            value={mappingSample.source}
            language="fr"
            documentId={mappingSample.documentId}
          />
        </div>
        <div className={styles.side}>
          <div className={styles.sideHeader}><span>+ translated</span><span>en</span></div>
          <JsonPreview
            className={theme === "terminal" ? styles.miniCodeTerminal : styles.miniCode}
            value={mappingSample.target}
            language="en"
            documentId={mappingSample.documentId}
          />
        </div>
      </div>
    </section>
  );
}

function BlockPreview({ theme }: { theme: Study["theme"] }) {
  return (
    <section className={styles.previewCard}>
      <div className={styles.previewHeader}>
        <span>DOCUMENT / JSONL</span>
        <span>EN · TRAIN</span>
      </div>
      <pre className={theme === "terminal" ? styles.blockCodeTerminal : styles.blockCode}>
        <span className={styles.brace}>{"{\n  "}</span>
        <span className={styles.key}>{'"document_id"'}</span>
        <span className={styles.punctuation}>{": "}</span>
        <span className={styles.meta}>{'"azl-es-0001"'}</span>
        <span className={styles.punctuation}>{",\n  "}</span>
        <span className={styles.key}>{'"text"'}</span>
        <span className={styles.punctuation}>{": "}</span>
        <span className={styles.blockText}>{JSON.stringify(clip(blockSample, 640))}</span>
        <span className={styles.punctuation}>{",\n  "}</span>
        <span className={styles.key}>{'"language"'}</span>
        <span className={styles.punctuation}>{": "}</span>
        <span className={styles.language}>{'"en"'}</span>
        <span className={styles.punctuation}>{",\n  "}</span>
        <span className={styles.key}>{'"document_level"'}</span>
        <span className={styles.punctuation}>{": "}</span>
        <span className={styles.language}>true</span>
        <span className={styles.punctuation}>{"\n}"}</span>
      </pre>
    </section>
  );
}

export default function DesignStudiesPage() {
  return (
    <main className={styles.gallery}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/data">
          <Image src="/azalea-icon.webp" alt="" width={28} height={28} priority />
          <span>AZALEA / DATA</span>
        </Link>
        <div className={styles.headerTitle}>DESIGN STUDIES / 03 OPTIONS</div>
        <Link className={styles.currentLink} href="/data">CURRENT PAGES ↗</Link>
      </header>

      <div className={styles.studyList}>
        {studies.map((study) => (
          <article className={styles.study} key={study.theme}>
            <div className={styles.studyHeader}>
              <span>{study.number} / {study.name}</span>
              <span>{study.idea}</span>
            </div>
            <div className={styles.previewGrid + " " + styles[study.theme]}>
              <MappingPreview theme={study.theme} />
              <BlockPreview theme={study.theme} />
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
