import Image from "next/image";
import Link from "next/link";
import {
  ebookLinksByBookId,
  overdriveLinksByBookId,
  retailerLinksByBookId,
} from "./retailer-links";
import DistributionSection from "./DistributionSection";
import PublicationsTabs from "./PublicationsTabs";
import { SKYHORSE_CATALOG_BOOK_IDS } from "@/lib/skyhorse-catalog";
import styles from "./publications.module.css";

const LIBRARY_URL =
  "https://pub-ee342152cf1149298fc3cb54a286f268.r2.dev/library.json";

export const revalidate = 3600;

interface Book {
  id: string;
  title: string;
  author: string;
  coverImageName: string;
  remoteBaseURL: string;
  duration: number;
  description?: string;
  spotifyUrl?: string;
}

function PublicationsHeader() {
  return (
    <header className={styles.header}>
      <Link className={styles.wordmark} href="/" aria-label="Azalea Labs home">
        <Image
          src="/azalea-icon.webp"
          alt=""
          width={30}
          height={30}
          priority
          unoptimized
        />
        <span>Azalea Labs</span>
      </Link>
    </header>
  );
}

function isAzaleaOriginal(book: Book): boolean {
  return !book.id.startsWith("librivox-");
}

async function getPublications(): Promise<Book[]> {
  try {
    const response = await fetch(LIBRARY_URL, { next: { revalidate } });
    if (!response.ok) return [];
    const books = (await response.json()) as Book[];
    return books.filter(
      (book) => isAzaleaOriginal(book) && SKYHORSE_CATALOG_BOOK_IDS.has(book.id),
    );
  } catch {
    return [];
  }
}

interface RetailerLink {
  name: string;
  href: string;
  icon: "spotify" | "apple" | "google-play" | "overdrive";
}

function PlatformMark({ icon }: { icon: RetailerLink["icon"] }) {
  if (icon === "overdrive") {
    return (
      <Image
        src="/overdrive-logo.png"
        alt=""
        width={72}
        height={12}
        className={styles.overdriveMark}
      />
    );
  }

  const paths = {
    spotify:
      "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
    apple:
      "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701",
    "google-play":
      "M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z",
  };
  const fill =
    icon === "spotify" ? "#1ed760" : icon === "apple" ? "#111111" : "#414141";

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill={fill}>
      <path d={paths[icon]} />
    </svg>
  );
}

function retailersFor(book: Book): {
  audio: RetailerLink[];
  ebook: RetailerLink[];
} {
  const retailerLinks = retailerLinksByBookId[book.id];
  const ebookLinks = ebookLinksByBookId[book.id];
  const overdriveLink = overdriveLinksByBookId[book.id];

  const audio: RetailerLink[] = [
    {
      name: "Spotify",
      href:
        book.spotifyUrl ??
        `https://open.spotify.com/search/${encodeURIComponent(book.title)}`,
      icon: "spotify",
    },
  ];

  if (retailerLinks?.appleBooks) {
    audio.push({
      name: "Apple Books",
      href: retailerLinks.appleBooks,
      icon: "apple",
    });
  }
  if (retailerLinks?.googlePlay) {
    audio.push({
      name: "Google Play",
      href: retailerLinks.googlePlay,
      icon: "google-play",
    });
  }

  if (overdriveLink) {
    audio.push({ name: "OverDrive", href: overdriveLink, icon: "overdrive" });
  }

  const ebook: RetailerLink[] = [];
  if (ebookLinks?.appleBooks) {
    ebook.push({
      name: "Apple Books",
      href: ebookLinks.appleBooks,
      icon: "apple",
    });
  }
  if (ebookLinks?.googlePlayBooks) {
    ebook.push({
      name: "Google Play Books",
      href: ebookLinks.googlePlayBooks,
      icon: "google-play",
    });
  }

  return { audio, ebook };
}

export default async function PublicationsPage() {
  const books = await getPublications();

  return (
    <main className={styles.page}>
      <PublicationsHeader />

      <section className={styles.hero}>
        <h1>
          Our
          <br />
          <em>publications.</em>
        </h1>
      </section>

      <PublicationsTabs
        network={<DistributionSection />}
        books={
          books.length === 0 ? (
            <p id="publications-catalog" className={styles.empty}>
              No publications available.
            </p>
          ) : (
            <ul
              id="publications-catalog"
              className={styles.wall}
              aria-label="Our publications"
            >
              {books.map((book, index) => {
                const coverUrl = `${book.remoteBaseURL}/${book.coverImageName}`;
                const retailers = retailersFor(book);

                return (
                  <li key={book.id} className={styles.tile}>
                    <div className={styles.cover}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverUrl}
                        alt={book.title}
                        width={280}
                        height={280}
                        loading={index < 8 ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={index < 4 ? "high" : "auto"}
                      />
                    </div>

                    <h2>{book.title}</h2>
                    <p className={styles.byline}>{book.author}</p>

                    <div
                      className={`${styles.availability} ${
                        retailers.ebook.length ? styles.hasEbooks : styles.audioOnly
                      }`}
                    >
                      {retailers.audio.length > 0 && (
                        <div className={styles.availabilityGroup}>
                          <span className={styles.availabilityLabel}>Audio</span>
                          <div className={styles.availabilityLinks}>
                            {retailers.audio.map((retailer) => (
                              <a
                                key={retailer.name}
                                href={retailer.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${book.title} audiobook on ${retailer.name}`}
                                title={`${retailer.name} audiobook`}
                                className={
                                  retailer.icon === "overdrive"
                                    ? styles.overdriveLink
                                    : undefined
                                }
                              >
                                <PlatformMark icon={retailer.icon} />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {retailers.ebook.length > 0 && (
                        <div className={styles.availabilityGroup}>
                          <span className={styles.availabilityLabel}>eBook</span>
                          <div className={styles.availabilityLinks}>
                            {retailers.ebook.map((retailer) => (
                              <a
                                key={retailer.name}
                                href={retailer.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${book.title} eBook on ${retailer.name}`}
                                title={`${retailer.name} eBook`}
                              >
                                <PlatformMark icon={retailer.icon} />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )
        }
      />

    </main>
  );
}
