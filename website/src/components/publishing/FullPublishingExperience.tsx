import Image from "next/image";
import DialHero from "@/components/dial/DialHero";
import FullWorldMap from "./FullWorldMap";
import styles from "./full-publishing.module.css";

export default function FullPublishingExperience() {
  return (
    <main className={styles.page} id="top">
      <div
        className={styles.resolvedHeader}
        data-resolved-header
        aria-hidden="true"
      >
        <Image
          src="/azalea-icon.webp"
          alt=""
          width={30}
          height={30}
          priority
          unoptimized
        />
        <span>Azalea Labs</span>
      </div>

      <section
        className={styles.dialIntro}
        data-dial-stage
        aria-label="Azalea Publishing in languages from around the world"
      >
        <div className={styles.heroVisual}>
          <div className={styles.dialFrame} data-dial-frame>
            <DialHero />
          </div>
        </div>
      </section>

      <section
        className={styles.story}
        data-publishing-story
        id="publishing"
        aria-labelledby="publishing-title"
      >
        <div className={styles.storyGrid}>
          <div className={styles.titleBlock}>
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

          <FullWorldMap />

          <div className={styles.summary}>
            <p>
              We produce, translate, and distribute bestselling books across
              formats, languages, and borders.
            </p>
            <a href="mailto:neel@azalea-labs.com?subject=Publishing%20with%20Azalea">
              Get in touch <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <footer className={styles.footer}>
          <div className={styles.footerIdentity}>
            <a href="https://www.azalea-labs.com/">
              Azalea Publishing is a division of Azalea Labs
            </a>
            <span>© 2026 Azalea Labs. All rights reserved.</span>
          </div>
          <div className={styles.footerLinks}>
            <span>San Francisco · New York City</span>
            <a href="https://www.azalea-labs.com/privacy">Privacy</a>
            <a href="mailto:neel@azalea-labs.com">Contact</a>
          </div>
        </footer>
      </section>
    </main>
  );
}
