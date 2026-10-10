import Image from "next/image";
import Link from "next/link";
import {
  ebookLinksByBookId,
  overdriveLinksByBookId,
  retailerLinksByBookId,
} from "./retailer-links";
import DistributionSection from "./DistributionSection";
import PublicationsTabs from "./PublicationsTabs";
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
    return books.filter(isAzaleaOriginal);
  } catch {
    return [];
  }
}

interface RetailerLink {
  name: string;
  href: string;
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
    },
  ];

  if (retailerLinks?.appleBooks) {
    audio.push({ name: "Apple Books", href: retailerLinks.appleBooks });
  }
  if (retailerLinks?.googlePlay) {
    audio.push({ name: "Google Play", href: retailerLinks.googlePlay });
  }

  if (overdriveLink) {
    audio.push({ name: "OverDrive", href: overdriveLink });
  }

  const ebook: RetailerLink[] = [];
  if (ebookLinks?.appleBooks) {
    ebook.push({ name: "Apple Books", href: ebookLinks.appleBooks });
  }
  if (ebookLinks?.googlePlayBooks) {
    ebook.push({ name: "Google Play Books", href: ebookLinks.googlePlayBooks });
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

                    <div className={styles.availability}>
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
                              >
                                {retailer.name}
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
                              >
                                {retailer.name}
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
