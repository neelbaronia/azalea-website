import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteFooter from "@/components/SiteFooter";
import { getListenBook } from "@/lib/listen-books";
import GoogleAdsTag from "./GoogleAdsTag";
import ListenButton from "./ListenButton";
import styles from "./listen.module.css";

export const revalidate = 3600;

const SITE_URL = "https://www.azalea-labs.com";

type Props = { params: Promise<{ bookId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bookId } = await params;
  const book = await getListenBook(bookId);
  if (!book) return { title: "Not found | Azalea Labs" };

  const title = `Listen to ${book.title} by ${book.author} on Spotify | Azalea Labs`;
  const description =
    book.hook || `${book.title} by ${book.author}, narrated by Azalea Labs.`;
  const url = `${SITE_URL}/listen/${book.id}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "Azalea Labs",
      images: [{ url: book.coverUrl, alt: `${book.title} by ${book.author}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [book.coverUrl],
    },
  };
}

export default async function ListenPage({ params }: Props) {
  const { bookId } = await params;
  const book = await getListenBook(bookId);
  if (!book) notFound();

  return (
    <main className={styles.page}>
      <GoogleAdsTag />

      <header className={styles.header}>
        <Link className={styles.wordmark} href="/" aria-label="Azalea Labs home">
          <Image
            src="/azalea-icon.webp"
            alt=""
            width={24}
            height={24}
            priority
            unoptimized
          />
          <span>Azalea Labs</span>
        </Link>
      </header>

      <section className={styles.listen}>
        <div className={styles.cover}>
          <Image
            src={book.coverUrl}
            alt={`${book.title} by ${book.author}`}
            width={360}
            height={360}
            sizes="(max-width: 480px) 72vw, 360px"
            priority
          />
        </div>

        <h1 className={styles.title}>{book.title}</h1>
        <p className={styles.author}>
          <span>by</span> {book.author}
        </p>

        {book.hook && <p className={styles.hook}>{book.hook}</p>}

        <ListenButton
          bookId={book.id}
          title={book.title}
          author={book.author}
          spotifyUrl={book.spotifyUrl}
          className={styles.button}
        />
      </section>

      <SiteFooter />
    </main>
  );
}
