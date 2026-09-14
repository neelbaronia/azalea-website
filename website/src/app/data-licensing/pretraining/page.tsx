import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { landonNidoDeAvionesParagraphs, landonRosauroParagraphs } from "../../translations/_components/landon-text-samples";
import styles from "../data-licensing.module.css";

export const metadata: Metadata = {
  title: "Document Text | Azalea Labs",
  description: "A document-level JSONL sample for pretraining data workflows.",
  robots: { index: false, follow: false },
};

type TrainingRecord = {
  document_id: string;
  text: string;
  language: string;
  split: string;
  metadata: {
    title: string;
    source_language: string;
    translator: string;
    segment_count: number;
    document_level: boolean;
    human_authored: boolean;
  };
};

const trainingRecords: TrainingRecord[] = [
  {
    document_id: "azl-es-0001",
    text: landonRosauroParagraphs.join("\n\n"),
    language: "en",
    split: "train",
    metadata: { title: "Rosauro", source_language: "es", translator: "Landon Kramer", segment_count: 40, document_level: true, human_authored: true },
  },
  {
    document_id: "azl-es-0002",
    text: landonNidoDeAvionesParagraphs.join("\n\n"),
    language: "en",
    split: "train",
    metadata: { title: "Nest of Airplanes", source_language: "es", translator: "Landon Kramer", segment_count: 43, document_level: true, human_authored: true },
  },
];

function RecordObject({ record }: { record: TrainingRecord }) {
  return (
    <pre className={styles.recordCode}>
      <span className={styles.punctuation}>{"{\n  "}</span>
      <span className={styles.key}>{'"document_id"'}</span><span className={styles.punctuation}>{": "}</span><span className={styles.meta}>{JSON.stringify(record.document_id)}</span>
      <span className={styles.punctuation}>{",\n  "}</span>
      <span className={styles.key}>{'"text"'}</span><span className={styles.punctuation}>{": "}</span><span className={styles.blockText}>{JSON.stringify(record.text)}</span>
      <span className={styles.punctuation}>{",\n  "}</span>
      <span className={styles.key}>{'"language"'}</span><span className={styles.punctuation}>{": "}</span><span className={styles.language}>{JSON.stringify(record.language)}</span>
      <span className={styles.punctuation}>{",\n  "}</span>
      <span className={styles.key}>{'"split"'}</span><span className={styles.punctuation}>{": "}</span><span className={styles.meta}>{JSON.stringify(record.split)}</span>
      <span className={styles.punctuation}>{",\n  "}</span>
      <span className={styles.key}>{'"metadata"'}</span><span className={styles.punctuation}>{": {\n    "}</span>
      <span className={styles.key}>{'"title"'}</span><span className={styles.punctuation}>{": "}</span><span className={styles.meta}>{JSON.stringify(record.metadata.title)}</span>
      <span className={styles.punctuation}>{",\n    "}</span>
      <span className={styles.key}>{'"source_language"'}</span><span className={styles.punctuation}>{": "}</span><span className={styles.language}>{JSON.stringify(record.metadata.source_language)}</span>
      <span className={styles.punctuation}>{",\n    "}</span>
      <span className={styles.key}>{'"translator"'}</span><span className={styles.punctuation}>{": "}</span><span className={styles.meta}>{JSON.stringify(record.metadata.translator)}</span>
      <span className={styles.punctuation}>{",\n    "}</span>
      <span className={styles.key}>{'"segment_count"'}</span><span className={styles.punctuation}>{": "}</span><span className={styles.meta}>{record.metadata.segment_count}</span>
      <span className={styles.punctuation}>{",\n    "}</span>
      <span className={styles.key}>{'"document_level"'}</span><span className={styles.punctuation}>{": "}</span><span className={styles.language}>{String(record.metadata.document_level)}</span>
      <span className={styles.punctuation}>{",\n    "}</span>
      <span className={styles.key}>{'"human_authored"'}</span><span className={styles.punctuation}>{": "}</span><span className={styles.language}>{String(record.metadata.human_authored)}</span>
      <span className={styles.punctuation}>{"\n  }\n}"}</span>
    </pre>
  );
}

export default function PretrainingPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/">
          <Image src="/azalea-icon.webp" alt="" width={28} height={28} priority />
          <span>AZALEA / DATA</span>
        </Link>
        <nav className={styles.nav} aria-label="Data views">
          <Link className={styles.navLink} href="/data-licensing">01 MAPPING</Link>
          <Link className={styles.navLink + " " + styles.active} href="/data-licensing/pretraining">02 BLOCK TEXT</Link>
        </nav>
        <span className={styles.headerSpec}>JSONL · DOCUMENT / ROW</span>
      </header>

      <div className={styles.blockList}>
        {trainingRecords.map((record, index) => (
          <article className={styles.blockCard} key={record.document_id}>
            <div className={styles.blockHeader}>
              <span>{String(index + 1).padStart(2, "0")} / {record.document_id}</span>
              <span>{record.metadata.title} · {record.language}</span>
            </div>
            <RecordObject record={record} />
            <dl className={styles.recordFooter}>
              <div><dt>document</dt><dd>{record.document_id}</dd></div>
              <div><dt>tokens_in</dt><dd>tokenizer → sequence pack</dd></div>
              <div><dt>text</dt><dd>full document</dd></div>
              <div><dt>split</dt><dd>{record.split}</dd></div>
            </dl>
          </article>
        ))}
      </div>
    </main>
  );
}
