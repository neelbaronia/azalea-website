import Image from "next/image";
import Link from "next/link";
import { AUDIO_APP_ICON } from "@/lib/audio-branding";
import {
  ArrowUpRight,
  BookOpen,
  Headphones,
  Infinity as InfinityIcon,
  Plus,
} from "lucide-react";
import WaitlistForm from "./waitlist-form";
import styles from "./unlimited.module.css";
import OrnamentalHeading from "./ornamental/ornamental-heading";
import ornament from "./ornamental/ornamental.module.css";

const books = [
  {
    title: "The General’s Cook",
    author: "Ramin Ganeshram",
    image: "the-generals-cook.webp",
    category: "HISTORICAL FICTION",
  },
  {
    title: "Diana",
    author: "Emil Ludwig",
    image: "diana.webp",
    category: "LITERARY FICTION",
  },
  {
    title: "Acts of Allegiance",
    author: "Peter Cunningham",
    image: "acts-of-allegiance.webp",
    category: "LITERARY FICTION",
  },
  {
    title: "The Golden Age of Pirates",
    author: "Benerson Little",
    image: "the-golden-age-of-pirates.webp",
    category: "HISTORY & ADVENTURE",
  },
  {
    title: "The Conquest of Happiness",
    author: "Bertrand Russell",
    image: "the-conquest-of-happiness-project-gutenberg.webp",
    category: "A DIFFERENT PERSPECTIVE",
  },
] as const;

const questions = [
  {
    question: "What is Azalea Audio Unlimited?",
    answer:
      "Our forthcoming subscription for people who can’t get enough of books. One subscription gives you unlimited access to the audiobooks and ebooks in the subscription catalog—without a monthly credit allowance.",
  },
  {
    question: "When can I start?",
    answer:
      "We’re planning to launch in April 2027. Join the waitlist and we’ll email you with launch news and details on how to get started. The date is tentative, and we’ll keep you posted if it changes.",
  },
  {
    question: "Does joining cost anything?",
    answer:
      "No. The waitlist is free, and you don’t need a card or an account. Joining does not start a subscription. We’ll share pricing and full subscription terms before launch.",
  },
  {
    question: "Will these books be in the subscription?",
    answer:
      "The covers and app screens here give you a feel for Azalea’s existing catalog and app. We’re still building the subscription collection; launch titles, features, and availability may change.",
  },
] as const;

export default function UnlimitedLandingPage({
  ornamental = false,
}: {
  ornamental?: boolean;
}) {
  return (
    <div
      className={`${styles.page}${ornamental ? ` ${ornament.page}` : ""}`}
      data-audio-waitlist
      data-waitlist-design={ornamental ? "ornamental" : "editorial"}
    >
      <a className={styles.skipLink} href="#unlimited-content">
        Skip to content
      </a>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="Azalea Audio home">
          <Image
            src={AUDIO_APP_ICON}
            alt=""
            width={48}
            height={48}
            sizes="48px"
            priority
          />
          <span>
            azalea<span className={styles.brandAudio}>AUDIO</span>
          </span>
        </Link>
        <div className={styles.headerRight}>
          <span className={styles.launch}>
            <span /> PLANNED APRIL 2027
          </span>
          <a href="#waitlist" className={styles.navCta}>
            Join the waitlist <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          {ornamental ? (
            <Link href="/unlimited" className={ornament.compareLink}>
              Original version <ArrowUpRight size={13} aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </header>

      <main id="unlimited-content">
        <section
          className={styles.hero}
          aria-labelledby="unlimited-title"
          data-waitlist-part="hero"
        >
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span /> A LIBRARY WITHOUT LIMITS
            </p>
            {ornamental ? (
              <OrnamentalHeading />
            ) : (
              <h1 id="unlimited-title">
                One more
                <br />
                <em>chapter.</em>
                <br />
                No more limits.
              </h1>
            )}
            <p className={styles.heroDescription}>
              Unlimited audiobooks and ebooks.
              <br />
              One subscription. Wherever the story takes you.
            </p>
            <div id="waitlist" className={styles.formAnchor}>
              <WaitlistForm />
            </div>
            <div className={styles.heroNote}>
              <span aria-hidden="true">✳</span>
              <p>
                For the long walks. The late nights.
                <br />
                <strong>The “just one more chapter” people.</strong>
              </p>
            </div>
          </div>

          <figure
            className={styles.showcase}
            aria-label="A preview of the Azalea Audio app"
            data-waitlist-part="showcase"
          >
            <div className={styles.showcaseTop}>
              <span>YOUR NEXT OBSESSION IS IN HERE.</span>
              <Headphones size={20} strokeWidth={1.3} aria-hidden="true" />
            </div>
            <div
              className={styles.orbit}
              aria-hidden="true"
              data-waitlist-part="orbit"
            />
            <div
              className={styles.orbitInner}
              aria-hidden="true"
              data-waitlist-part="orbit"
            />
            <div className={styles.phoneBack}>
              <Image
                src="/subscription-preview/app-player.png"
                alt="Azalea Audio’s current app playing Sky Ranch, with playback and speed controls"
                width={1206}
                height={2622}
                sizes="(max-width: 640px) 180px, 220px"
              />
            </div>
            <div className={styles.phoneFront}>
              <Image
                src="/subscription-preview/app-browse.png"
                alt="Azalea Audio’s current app, showing its audiobook library and book discovery"
                width={1206}
                height={2622}
                sizes="(max-width: 640px) 205px, 250px"
                priority
              />
            </div>
            <div
              className={styles.unlimitedSeal}
              aria-hidden="true"
              data-waitlist-part="seal"
            >
              <InfinityIcon size={38} strokeWidth={1.3} />
              <span>
                LESS COUNTING.
                <br />
                MORE CHAPTERS.
              </span>
            </div>
            <div className={styles.floatingCover} aria-hidden="true">
              <Image
                src="/sample-covers/the-generals-cook.webp"
                alt=""
                width={140}
                height={140}
                sizes="105px"
              />
            </div>
            <figcaption className={styles.showcaseBottom}>
              <span>REAL APP. NEW CHAPTER.</span>
              <span>App preview · experience may change</span>
            </figcaption>
          </figure>
        </section>

        <section
          className={styles.promiseStrip}
          aria-label="The unlimited idea"
          data-waitlist-part="promises"
        >
          <div>
            <InfinityIcon size={27} strokeWidth={1.4} aria-hidden="true" />
            <p>
              <strong>Your curiosity. Uncapped.</strong>
              <span>No monthly book-credit allowance.</span>
            </p>
          </div>
          <div>
            <Headphones size={27} strokeWidth={1.4} aria-hidden="true" />
            <p>
              <strong>Listen. Read. Repeat.</strong>
              <span>Audiobooks and ebooks, together.</span>
            </p>
          </div>
          <div>
            <BookOpen size={27} strokeWidth={1.4} aria-hidden="true" />
            <p>
              <strong>Follow the next great story.</strong>
              <span>One subscription to the catalog.</span>
            </p>
          </div>
        </section>

        <section
          className={styles.library}
          aria-labelledby="library-title"
          data-waitlist-part="library"
        >
          <div className={styles.sectionIntro}>
            <div>
              <p className={styles.eyebrow}>A LITTLE TASTE OF AZALEA</p>
              <h2 id="library-title">
                Big ideas. Great escapes.
                <br />
                <em>And your next favorite.</em>
              </h2>
            </div>
            <p>
              Fiction that stays with you. Lives worth discovering. Worlds you
              haven’t met yet. This is the kind of bookshelf we’re building on.
            </p>
          </div>
          <div className={styles.bookGrid}>
            {books.map((book) => (
              <article className={styles.book} key={book.title}>
                <div className={styles.cover}>
                  <Image
                    src={`/sample-covers/${book.image}`}
                    alt={`${book.title} book cover`}
                    width={300}
                    height={300}
                    sizes="(max-width: 640px) 42vw, (max-width: 900px) 27vw, 200px"
                  />
                </div>
                <p className={styles.bookCategory}>{book.category}</p>
                <h3>{book.title}</h3>
                <p className={styles.bookAuthor}>{book.author}</p>
              </article>
            ))}
          </div>
          <p className={styles.catalogNote}>
            A selection from our existing catalog. The subscription launch
            collection may differ.
          </p>
        </section>

        <section
          className={styles.faq}
          aria-labelledby="faq-title"
          data-waitlist-part="faq"
        >
          <div className={styles.faqIntro}>
            <p className={styles.eyebrow}>THE SHORT VERSION</p>
            <h2 id="faq-title">
              A few things <br />
              <em>before chapter one.</em>
            </h2>
            <a href="#waitlist" className={styles.textCta}>
              Save your spot <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
          <div className={styles.questions}>
            {questions.map((item) => (
              <details key={item.question}>
                <summary>
                  {item.question}
                  <Plus size={18} aria-hidden="true" />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section
          className={styles.lastWord}
          aria-label="Join the waitlist"
          data-waitlist-part="invitation"
        >
          <span aria-hidden="true">✳</span>
          <div>
            <p>There’s always another great book.</p>
            <h2>
              Make room for <em>more.</em>
            </h2>
          </div>
          <a href="#waitlist">
            Join the waitlist <ArrowUpRight size={19} aria-hidden="true" />
          </a>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          AZALEA AUDIO <span>by Azalea Labs</span>
        </p>
        <nav aria-label="Waitlist footer">
          <Link href="/privacy">Privacy</Link>
          <a href="mailto:neel@azalea-labs.com">
            Get in touch <ArrowUpRight size={13} aria-hidden="true" />
          </a>
          <Link href="/">
            Azalea Labs <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
        </nav>
        <small>© {new Date().getFullYear()} Azalea Labs</small>
      </footer>
    </div>
  );
}
