import Image from "next/image";
import { overdriveLinksByBookId, retailerLinksByBookId } from "./retailer-links";
import SiteFooter from "@/components/SiteFooter";
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
      <a className={styles.wordmark} href="/" aria-label="Azalea Labs home">
        <Image
          src="/azalea-icon.webp"
          alt=""
          width={30}
          height={30}
          priority
          unoptimized
        />
        <span>Azalea Labs</span>
      </a>
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

function retailersFor(book: Book): { name: string; href: string }[] {
  const retailerLinks = retailerLinksByBookId[book.id];
  const overdriveLink = overdriveLinksByBookId[book.id];

  const retailers = [
    {
      name: "Spotify",
      href:
        book.spotifyUrl ??
        `https://open.spotify.com/search/${encodeURIComponent(book.title)}`,
    },
  ];

  if (retailerLinks?.appleBooks) {
    retailers.push({ name: "Apple Books", href: retailerLinks.appleBooks });
  }
  if (retailerLinks?.googlePlay) {
    retailers.push({ name: "Google Play", href: retailerLinks.googlePlay });
  }
  if (overdriveLink) {
    retailers.push({ name: "OverDrive", href: overdriveLink });
  }

  return retailers;
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

      {books.length === 0 ? (
        <p className={styles.empty}>No publications available.</p>
      ) : (
        <ul className={styles.wall}>
          {books.map((book, index) => {
            const coverUrl = `${book.remoteBaseURL}/${book.coverImageName}`;
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

                <p className={styles.availability}>
                  {retailersFor(book).map((retailer) => (
                    <a
                      key={retailer.name}
                      href={retailer.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${book.title} on ${retailer.name}`}
                    >
                      {retailer.name}
                    </a>
                  ))}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <SiteFooter />
    </main>
  );
}
