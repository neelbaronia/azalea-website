import Image from "next/image";
import Link from "next/link";
import WaitlistForm from "../waitlist-form";
import OrnamentalHeading from "./ornamental-heading";
import BookshelfCarousel from "./bookshelf-carousel";
import base from "../unlimited.module.css";
import ornament from "./ornamental.module.css";
import styles from "./compact-waitlist.module.css";

export default function CompactWaitlist() {
  return (
    <div
      className={`${base.page} ${ornament.page} ${styles.page}`}
      data-audio-waitlist
      data-waitlist-design="compact-ornamental"
    >
      <a href="#unlimited-content" className={base.skipLink}>
        Skip to content
      </a>
      <header className={styles.header}>
        <Link href="/" className={base.brand} aria-label="Azalea Audio home">
          <Image
            src="/subscription-preview/azalea-audio-icon.png"
            alt=""
            width={44}
            height={44}
            sizes="44px"
            priority
          />
          <span>
            azalea<span className={base.brandAudio}>AUDIO</span>
          </span>
        </Link>
        <p className={styles.coming}>
          <span aria-hidden="true" />
          Coming early 2027
        </p>
      </header>

      <main id="unlimited-content" className={styles.main}>
        <div className={styles.hero}>
          <section aria-labelledby="unlimited-title" className={styles.copy}>
            <OrnamentalHeading
              variant="unlimited"
              replayable={false}
              className={styles.title}
            />
            <p className={styles.description}>
              <strong>Exclusive titles from around the world.</strong>
              <span>Across fiction and nonfiction.</span>
            </p>
            <div className={styles.offer}>
              <p className={styles.price}>
                $9<span> / mo</span>
              </p>
              <span className={styles.offerRule} aria-hidden="true" />
              <p className={styles.catalog}>1,000s of titles</p>
            </div>
            <div className={styles.signup} id="waitlist">
              <WaitlistForm compact />
            </div>
          </section>

          <figure
            className={styles.showcase}
            aria-label="Azalea Audio app preview"
          >
            <div className={styles.phoneBack}>
              <Image
                src="/subscription-preview/app-player.png"
                alt="Azalea Audio’s current app playing Sky Ranch, with playback and speed controls"
                width={1206}
                height={2622}
                sizes="(max-width: 760px) 110px, 200px"
              />
            </div>
            <div className={styles.phoneFront}>
              <Image
                src="/subscription-preview/app-browse.png"
                alt="Azalea Audio’s current app, showing its audiobook library and book discovery"
                width={1206}
                height={2622}
                sizes="(max-width: 760px) 115px, 215px"
                priority
              />
            </div>
          </figure>
        </div>

        <section className={styles.library} aria-labelledby="bookshelf-title">
          <div className={styles.libraryIntro}>
            <h2 id="bookshelf-title">Explore the catalog</h2>
          </div>
          <div>
            <BookshelfCarousel />
            <p className={styles.catalogNote}>
              From our existing catalog. Subscription launch titles may differ.
            </p>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <Link href="/">Azalea Audio by Azalea Labs</Link>
      </footer>
    </div>
  );
}
