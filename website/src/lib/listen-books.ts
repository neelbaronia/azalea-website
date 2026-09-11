import { cache } from "react";

const LIBRARY_URL =
  "https://pub-ee342152cf1149298fc3cb54a286f268.r2.dev/library.json";

const REVALIDATE_SECONDS = 3600;

// Same shape as /publications reads from library.json.
export interface Book {
  id: string;
  title: string;
  author: string;
  coverImageName: string;
  remoteBaseURL: string;
  duration?: number;
  description?: string;
  spotifyUrl?: string;
}

export interface ListenBook {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  hook: string;
  spotifyUrl: string;
}

/**
 * Returns the canonical open.spotify.com URL (no si= or other share params),
 * or null if the value is not a real Spotify show/episode/audiobook link.
 * Search URLs are rejected on purpose.
 */
export function canonicalSpotifyUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" || url.hostname !== "open.spotify.com") {
      return null;
    }
    const match = url.pathname.match(
      /^\/(?:intl-[a-z-]+\/)?(show|episode|audiobook)\/([A-Za-z0-9]+)\/?$/,
    );
    if (!match) return null;
    return `https://open.spotify.com/${match[1]}/${match[2]}`;
  } catch {
    return null;
  }
}

function stripMarkdown(text: string): string {
  return text
    .replace(/[*_`]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** First sentence of the catalog description, without breaking on initials like "O.J." or "F. Lee". */
export function firstSentence(description: string | undefined): string {
  if (!description) return "";
  const text = stripMarkdown(description);
  const match = text.match(
    /^.*?(?<![A-Z]|\b(?:Mr|Mrs|Ms|Dr|St|Jr|Sr|vs|No))[.!?]["”’)]?(?=\s+["“(]?[A-Z]|$)/,
  );
  return (match ? match[0] : text).trim();
}

async function fetchLibrary(): Promise<Book[]> {
  try {
    const response = await fetch(LIBRARY_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return [];
    return (await response.json()) as Book[];
  } catch {
    return [];
  }
}

// library.json can lag behind per-book metadata.json (it is rebuilt by a
// separate scan), so fall back to the book's own metadata for spotifyUrl.
async function fetchMetadataSpotifyUrl(book: Book): Promise<string | undefined> {
  try {
    const response = await fetch(`${book.remoteBaseURL}/metadata.json`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return undefined;
    const metadata = (await response.json()) as { spotifyUrl?: string };
    return metadata.spotifyUrl;
  } catch {
    return undefined;
  }
}

export const getListenBook = cache(
  async (bookId: string): Promise<ListenBook | null> => {
    const books = await fetchLibrary();
    const book = books.find((candidate) => candidate.id === bookId);
    if (!book) return null;

    const spotifyUrl = canonicalSpotifyUrl(
      book.spotifyUrl ?? (await fetchMetadataSpotifyUrl(book)),
    );
    if (!spotifyUrl) return null;

    return {
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: `${book.remoteBaseURL}/${book.coverImageName}`,
      hook: firstSentence(book.description),
      spotifyUrl,
    };
  },
);
