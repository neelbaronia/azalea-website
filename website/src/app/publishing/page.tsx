import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import DialHero from "./DialHero";
import WorldMap from "./WorldMap";
import styles from "./publishing.module.css";

export const metadata: Metadata = {
  title: "Azalea Publishing | Books from around the world",
  description:
    "Full-stack print, ebook, translation, and distribution for bestselling books worldwide.",
};

export default function PublishingPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link
          className={styles.wordmark}
          href="/publishing"
          aria-label="Azalea Publishing home"
        >
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
            Publishing
          </span>
        </Link>

        <span className={styles.headerLabel}>Print · Ebook · Translation</span>

        <a className={styles.contactButton} href="mailto:neel@azalea-labs.com">
          Get in touch
        </a>
      </header>

      <section
        className={styles.dialIntro}
        data-dial-stage
        aria-label="Azalea Publishing in languages from around the world"
      >
        <div className={styles.dialViewport}>
          <DialHero />
          <div className={styles.dialCaption} aria-hidden="true">
            <span>Publishing across languages, formats, and borders</span>
            <span>Scroll to explore ↓</span>
          </div>
        </div>
      </section>

      <section className={styles.story} aria-labelledby="publishing-title">
        <div className={styles.hero}>
          <div className={styles.heroTitle}>
            <p>Full-stack publishing</p>
            <h1 id="publishing-title">
              Books from
              <br />
              <em>
                around the
                <br />
                world.
              </em>
            </h1>
          </div>

          <WorldMap />

          <div className={styles.heroSummary}>
            <p>
              We produce, translate, and distribute bestselling books across
              formats, languages, and borders.
            </p>
            <a
              href="mailto:neel@azalea-labs.com?subject=Publishing%20with%20Azalea"
            >
              Get in touch <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className={styles.heroFooter}>
            <a href="https://www.azalea-labs.com/">
              Azalea Publishing is a division of Azalea Labs
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
