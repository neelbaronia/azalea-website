import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./data-licensing.module.css";

export const metadata: Metadata = {
  title: "Literary Translation Data | Azalea Labs",
  description:
    "A confidential preview of Azalea Labs' human-authored literary translation dataset.",
  robots: {
    index: false,
    follow: false,
  },
};

const stats = [
  { value: "7", label: "works" },
  { value: "423", label: "aligned segments" },
  { value: "4", label: "directions into English" },
  { value: "4", label: "named translators" },
];

const works = [
  {
    direction: "de → en",
    tone: "blue",
    title: "I Hear Her Laughing",
    sourceTitle: "Ich höre sie lachen",
    author: "Monika Helfer",
    translator: "Anna Lynn Dolman",
    segments: "180",
    targetWords: "4,893",
  },
  {
    direction: "fr → en",
    tone: "mint",
    title: "Memory of Ashes",
    sourceTitle: "Mémoire de cendres",
    author: "Christian Malela",
    translator: "Laila Riazi",
    segments: "52",
    targetWords: "1,013",
  },
  {
    direction: "fr → en",
    tone: "mint",
    title: "My Farmer and My Rose",
    sourceTitle: "Mon bordièr et ma Rose",
    author: "Nicolas Guardiola",
    translator: "Laila Riazi",
    segments: "62",
    targetWords: "2,539",
  },
  {
    direction: "zh → en",
    tone: "gold",
    title: "Minotaur",
    sourceTitle: "米诺陶洛斯",
    author: "杨若兮",
    translator: "Han Li",
    segments: "27",
    targetWords: "1,557",
  },
  {
    direction: "zh → en",
    tone: "gold",
    title: "Forehead and Bench",
    sourceTitle: "奔儿头和板凳",
    author: "津子围",
    translator: "Han Li",
    segments: "19",
    targetWords: "1,062",
  },
  {
    direction: "es → en",
    tone: "peach",
    title: "Rosauro",
    sourceTitle: "Rosauro",
    author: "Bárbara Sánchez",
    translator: "Landon Kramer",
    segments: "40",
    targetWords: "2,827",
  },
  {
    direction: "es → en",
    tone: "peach",
    title: "Nest of Airplanes",
    sourceTitle: "Nido de aviones",
    author: "Iria Fariñas",
    translator: "Landon Kramer",
    segments: "43",
    targetWords: "2,931",
  },
];

const recordPreview = {
  document_id: "azl-es-0001",
  direction: "es-en",
  source_title: "Rosauro",
  target_title: "Rosauro",
  segments: 40,
  alignment: "1:1",
  translator: "Landon Kramer",
  source_text: "Ese es el sitio ideal. Entre la albahaca y el aloe vera…",
  target_text: "It’s the perfect spot. Between the basil and the aloe vera…",
  target_text_public: false,
};

export default function DataLicensingPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/">
          <span className={styles.logo}>
            <Image
              src="/azalea-icon.webp"
              alt=""
              width={44}
              height={44}
              priority
              unoptimized
            />
          </span>
          <span>
            Azalea
            <br />
            Labs
          </span>
        </Link>

        <div className={styles.headerCenter}>Human literary translation data</div>

        <div className={styles.headerRight}>
          <span className={styles.privatePill}>Private preview · v0.1.1</span>
          <a className={styles.contactButton} href="mailto:neel@azalea-labs.com">
            Request access <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Azalea Literary Parallel · Confidential sample</p>
          <h1>
            Human translation data,
            <br />
            <em>with the human still visible.</em>
          </h1>
          <p className={styles.heroLede}>
            A small, carefully structured collection of literary translations into English.
            Every record keeps the work, the translator, the provenance, and the discourse
            context together.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href="mailto:neel@azalea-labs.com?subject=Azalea%20translation%20data%20sample">
              Request the sample <span aria-hidden="true">↗</span>
            </a>
            <a className={styles.secondaryAction} href="#inventory">
              View inventory <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>

        <div className={styles.heroArtifact} aria-label="Dataset sample summary">
          <div className={styles.artifactTop}>
            <span>AZALEA LITERARY PARALLEL</span>
            <span>0.1.1</span>
          </div>
          <div className={styles.artifactBody}>
            <div className={styles.artifactGlyph} aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <p className={styles.artifactQuote}>
              The target text is not a byproduct. It is a person&apos;s considered rendering
              of another person&apos;s work.
            </p>
            <div className={styles.artifactSignal}>
              <span className={styles.signalDot} />
              <span>human-authored</span>
              <span className={styles.signalDot} />
              <span>uncrawled target</span>
            </div>
          </div>
          <div className={styles.artifactBottom}>
            <span>DOCUMENT-LEVEL JSONL</span>
            <span>SHA-256 MANIFESTED</span>
          </div>
        </div>
      </section>

      <div className={styles.statStrip}>
        {stats.map((stat) => (
          <div className={styles.stat} key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>

      <section className={styles.section} id="record">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>01 · The unit</p>
          <div>
            <h2>One work per record.</h2>
            <p>
              The sample preserves the document as a document. Segment alignment is there for
              the pipeline; context is there for the reader.
            </p>
          </div>
        </div>

        <div className={styles.recordLayout}>
          <aside className={styles.recordAside}>
            <div className={styles.recordNumber}>01 <span>/ 07</span></div>
            <p className={styles.recordLabel}>Featured record</p>
            <h3>Rosauro</h3>
            <p className={styles.recordSource}>Bárbara Sánchez · Spanish</p>
            <dl className={styles.recordDetails}>
              <div>
                <dt>Translator</dt>
                <dd>Landon Kramer</dd>
              </div>
              <div>
                <dt>Segments</dt>
                <dd>40 aligned</dd>
              </div>
              <div>
                <dt>Format</dt>
                <dd>Document-level JSONL</dd>
              </div>
            </dl>
            <a
              className={styles.sourceLink}
              href="https://www.energheia.org/rosauro-barbara-sanchez_madrid.html"
              rel="noreferrer"
              target="_blank"
            >
              View source publication <span aria-hidden="true">↗</span>
            </a>
          </aside>

          <div className={styles.recordPanel}>
            <div className={styles.panelBar}>
              <span>DOCUMENT RECORD</span>
              <span>azl-es-0001</span>
            </div>
            <pre className={styles.jsonPreview}>
              <code>{JSON.stringify(recordPreview, null, 2)}</code>
            </pre>
            <div className={styles.panelFooter}>
              <span>source + target + provenance</span>
              <span>rights fields retained</span>
            </div>
          </div>
        </div>

        <div className={styles.pairPreview}>
          <div className={styles.pairColumn}>
            <div className={styles.pairLabel}>
              <span className={styles.languageMark}>ES</span>
              <span>Source text</span>
            </div>
            <p>
              Ese es el sitio ideal. Entre la albahaca y el aloe vera, ahí es donde voy a dejar
              plantado a Rosauro.
            </p>
          </div>
          <div className={styles.pairRule} aria-hidden="true" />
          <div className={styles.pairColumn}>
            <div className={styles.pairLabel}>
              <span className={`${styles.languageMark} ${styles.languageMarkTarget}`}>EN</span>
              <span>Target text</span>
            </div>
            <p>
              It&apos;s the perfect spot. Between the basil and the aloe vera, that&apos;s where I&apos;m
              going to plant Rosauro.
            </p>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.inventorySection}`} id="inventory">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>02 · The sample</p>
          <div>
            <h2>Seven works, four windows into English.</h2>
            <p>
              Contemporary literary fiction, translated by named specialists and delivered in
              discourse order.
            </p>
          </div>
        </div>

        <div className={styles.inventoryFrame}>
          <div className={styles.inventoryHeader}>
            <span>Direction</span>
            <span>Work</span>
            <span>Translator</span>
            <span>Segments</span>
            <span>English words</span>
          </div>
          {works.map((work) => (
            <div className={styles.inventoryRow} key={`${work.direction}-${work.title}`}>
              <span className={`${styles.direction} ${styles[work.tone]}`}>{work.direction}</span>
              <div className={styles.workTitle}>
                <strong>{work.title}</strong>
                <span>{work.sourceTitle} · {work.author}</span>
              </div>
              <span className={styles.translator}>{work.translator}</span>
              <strong className={styles.rowNumber}>{work.segments}</strong>
              <strong className={styles.rowNumber}>{work.targetWords}</strong>
            </div>
          ))}
          <div className={styles.inventoryTotal}>
            <span>Total sample</span>
            <strong>7 works · 423 segments · 16,822 English words</strong>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.valueSection}`}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>03 · Why it matters</p>
          <div>
            <h2>Not just parallel text.</h2>
            <p>
              The useful signal is the chain around the sentence: who made it, how it was made,
              what is public, and what remains genuinely new.
            </p>
          </div>
        </div>

        <div className={styles.valueGrid}>
          <article>
            <span>01</span>
            <h3>Traceable provenance</h3>
            <p>Source publication, translator identity, credential URL, and rights status travel with every record.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Human-authored target text</h3>
            <p>No machine translation, LLM drafting, or post-editing. The English side is unpublished and uncrawled.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Discourse context intact</h3>
            <p>Each work stays ordered as a document, with a flat segment view available for standard pipelines.</p>
          </article>
          <article>
            <span>04</span>
            <h3>Annotation-ready</h3>
            <p>The schema leaves room for translator decisions, rationale, and rejected alternatives when collected.</p>
          </article>
        </div>
      </section>

      <section className={styles.caution}>
        <div>
          <p className={styles.eyebrow}>Before distribution</p>
          <h2>A sample to evaluate, not a corpus to resell.</h2>
        </div>
        <p>
          This preview is shared for evaluation under a confidentiality understanding. Every
          record currently carries <code>NOT CLEARED</code> for both source-text and translation
          licensing. Commercial distribution follows written clearance on both sides.
        </p>
      </section>

      <footer className={styles.footer}>
        <div>
          <span className={styles.footerMark}>A</span>
          <span>Azalea Labs · Literary translation data</span>
        </div>
        <a href="mailto:neel@azalea-labs.com?subject=Azalea%20literary%20translation%20data">
          Start a conversation <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </main>
  );
}
