import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { landonRosauroPairs } from "../translations/_components/landon-text-samples";
import { hanMinotaurPairs } from "../translations/_components/han-text-samples";
import { lailaMemoryOfAshesPairs } from "../translations/_components/text-sample";
import styles from "./data-licensing.module.css";

export const metadata: Metadata = {
  title: "Translation Mapping | Azalea Labs",
  description: "A sample of Azalea Labs' aligned literary translation data.",
  robots: { index: false, follow: false },
};

type JsonTone = "meta" | "language" | "text";
type JsonLine = { key: string; value: string | number | boolean; tone: JsonTone };
type MappingSample = {
  documentId: string;
  title: string;
  direction: string;
  sourceLanguage: string;
  targetLanguage: string;
  translator: string;
  pair: { original: string; translation: string };
};

const mappingSamples: MappingSample[] = [
  {
    documentId: "azl-es-0001",
    title: "Rosauro",
    direction: "es-en",
    sourceLanguage: "es",
    targetLanguage: "en",
    translator: "Landon Kramer",
    pair: landonRosauroPairs[0],
  },
  {
    documentId: "azl-fr-0001",
    title: "Memory of Ashes",
    direction: "fr-en",
    sourceLanguage: "fr",
    targetLanguage: "en",
    translator: "Laila Riazi",
    pair: lailaMemoryOfAshesPairs[0],
  },
  {
    documentId: "azl-zh-0001",
    title: "Minotaur",
    direction: "zh-en",
    sourceLanguage: "zh",
    targetLanguage: "en",
    translator: "Han Li",
    pair: hanMinotaurPairs[0],
  },
];

function JsonObject({
  sample,
  side,
  text,
}: {
  sample: MappingSample;
  side: "source" | "target";
  text: string;
}) {
  const language = side === "source" ? sample.sourceLanguage : sample.targetLanguage;
  const lines: JsonLine[] = [
    { key: "segment_id", value: sample.documentId + ":s0001", tone: "meta" },
    { key: "language", value: language, tone: "language" },
    { key: "text", value: text, tone: "text" },
    { key: "document_id", value: sample.documentId, tone: "meta" },
    { key: "segment_index", value: 0, tone: "meta" },
  ];

  return (
    <div className={styles.codePane}>
      <div className={styles.codePaneHeader}>
        <span>{side === "source" ? "original" : "translated"}</span>
        <span className={side === "source" ? styles.sourceBadge : styles.targetBadge}>
          {language}
        </span>
      </div>
      <pre className={styles.codeBlock}>
        <span className={styles.punctuation}>{"{\n"}</span>
        {lines.map((line, index) => (
          <span className={styles.codeLine} key={line.key}>
            <span className={styles.key}>{"  " + JSON.stringify(line.key)}</span>
            <span className={styles.punctuation}>{": "}</span>
            <span className={styles[line.tone]}>{JSON.stringify(line.value)}</span>
            <span className={styles.punctuation}>{index === lines.length - 1 ? "" : ","}</span>
            {"\n"}
          </span>
        ))}
        <span className={styles.punctuation}>{"}"}</span>
      </pre>
    </div>
  );
}

export default function DataLicensingPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/">
          <Image src="/azalea-icon.webp" alt="" width={28} height={28} priority />
          <span>AZALEA / DATA</span>
        </Link>
        <nav className={styles.nav} aria-label="Data views">
          <Link className={styles.navLink + " " + styles.active} href="/data">
            01 MAPPING
          </Link>
          <Link className={styles.navLink} href="/data/pretraining">
            02 BLOCK TEXT
          </Link>
        </nav>
        <span className={styles.headerSpec}>JSONL · 0.1.1</span>
      </header>

      <div className={styles.mappingList}>
        {mappingSamples.map((sample, index) => (
          <article className={styles.mappingCard} key={sample.documentId}>
            <div className={styles.cardHeader}>
              <span>{String(index + 1).padStart(2, "0")} / {sample.documentId}:s0001</span>
              <span>{sample.direction} · 1:1</span>
            </div>
            <div className={styles.diffGrid}>
              <JsonObject sample={sample} side="source" text={sample.pair.original} />
              <JsonObject sample={sample} side="target" text={sample.pair.translation} />
            </div>
            <dl className={styles.metaStrip}>
              <div><dt>work</dt><dd>{sample.title}</dd></div>
              <div><dt>translator</dt><dd>{sample.translator}</dd></div>
              <div><dt>human_authored</dt><dd>true</dd></div>
              <div><dt>machine_translation_used</dt><dd>false</dd></div>
            </dl>
          </article>
        ))}
      </div>
      <div className={styles.inquiryRow}>
        <a
          className={styles.inquiryButton}
          href="mailto:nbaronia@gmail.com?subject=Azalea%20sample%20set%20inquiry"
        >
          INQUIRE FOR SAMPLE SET <span aria-hidden="true">↗</span>
        </a>
      </div>
    </main>
  );
}
