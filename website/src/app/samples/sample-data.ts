import { canonicalSpotifyUrl } from "@/lib/listen-books";
import { sampleDescriptionFallbacks } from "./sample-descriptions";

const R2_BASE = "https://pub-ee342152cf1149298fc3cb54a286f268.r2.dev";

export const FEATURED_IDS = [
  "a-honeymoon-in-space",
  "anthropology-and-modern-life",
  "diana",
  "the-truth-about-the-oj-simpson-trial",
  "lincoln-and-the-irish",
  "the-homestead",
] as const;

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

interface Chapter {
  title: string;
  fileName?: string;
  duration: number;
  remoteAudioURL?: string;
}

interface BookMetadata extends Book {
  chapters: Chapter[];
}

export interface SampleEntry {
  book: Book;
  audioUrl: string;
  sampleDuration: number;
}

export async function getFeaturedSamples(): Promise<SampleEntry[]> {
  // These six small files contain everything we need. Don't fetch or serialize
  // the multi-megabyte library, and don't queue requests sequentially.
  return Promise.all(FEATURED_IDS.map(async (id) => {
    const remoteBaseURL = `${R2_BASE}/${id}`;
    const response = await fetch(`${remoteBaseURL}/metadata.json`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Unable to load sample ${id}: ${response.status}`);

    const metadata = await response.json() as BookMetadata;
    const chapter = metadata.chapters?.find((item) => /^chapter/i.test(item.title))
      ?? metadata.chapters?.find((item) => /^part/i.test(item.title))
      ?? metadata.chapters?.[0];
    const audioUrl = chapter?.remoteAudioURL
      || (chapter?.fileName ? `${remoteBaseURL}/chapters/${chapter.fileName}` : undefined);

    // Throw on an unsuccessful refresh so ISR retains the last complete page
    // instead of caching an empty or partially populated sample list.
    if (!metadata.title || !metadata.author || !metadata.coverImageName || !audioUrl) {
      throw new Error(`Incomplete sample metadata for ${id}`);
    }
    const description = typeof metadata.description === "string"
      ? metadata.description.replace(/[*_`]+/g, "").replace(/\s+/g, " ").trim()
      : "";

    return {
      book: {
        id,
        title: id === "lincoln-and-the-irish" ? "Lincoln and the Irish" : metadata.title,
        author: metadata.author,
        coverImageName: metadata.coverImageName,
        remoteBaseURL,
        duration: Number.isFinite(metadata.duration) ? metadata.duration : 0,
        description: description && !/^Audiobook version of\b/i.test(description)
          ? description
          : sampleDescriptionFallbacks[id] ?? "",
        spotifyUrl: canonicalSpotifyUrl(
          typeof metadata.spotifyUrl === "string" ? metadata.spotifyUrl : undefined,
        ) ?? undefined,
      },
      audioUrl,
      sampleDuration: chapter && Number.isFinite(chapter.duration) ? chapter.duration : 0,
    };
  }));
}
