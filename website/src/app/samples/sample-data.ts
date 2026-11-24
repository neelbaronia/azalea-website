import { canonicalSpotifyUrl } from "@/lib/listen-books";
import { sampleDescriptionFallbacks } from "./sample-descriptions";

const R2_BASE = "https://pub-ee342152cf1149298fc3cb54a286f268.r2.dev";

export const FEATURED_IDS = [
  "the-truth-about-the-oj-simpson-trial",
  "the-golden-age-of-pirates",
  "the-homestead",
  "tallys-corner-a-study-of-negro-streetcorner-men",
  "a-honeymoon-in-space",
  "kremlin-wives",
  "diana",
] as const;

const preferredSampleChapterTitles: Partial<Record<(typeof FEATURED_IDS)[number], string>> = {
  "the-golden-age-of-pirates": "Preface: Imagining Pirates and Piracy",
  "kremlin-wives": "Chapter 18 The Raisa Phenomenon",
};

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
  sampleTitle?: string;
}

// The public catalog still holds an older recording. Pin this preview to the
// current Nara chapter, copied unchanged to a public, content-versioned URL.
const tallysCornerSample: SampleEntry = {
  book: {
    id: "tallys-corner-a-study-of-negro-streetcorner-men",
    title: "Tally’s Corner",
    author: "Elliot Liebow",
    coverImageName: "cover.png",
    remoteBaseURL: `${R2_BASE}/tallys-corner-a-study-of-negro-streetcorner-men`,
    duration: 22961,
    description: "Elliot Liebow’s landmark study follows the lives, relationships, and everyday struggles of men in a Washington, D.C., neighborhood.",
  },
  audioUrl: `${R2_BASE}/samples/tallys-corner/husbands-and-wives-9941b73b6fe6514b65a7.mp3`,
  sampleDuration: 2406.3,
  sampleTitle: "Husbands and Wives",
};

export async function getFeaturedSamples(): Promise<SampleEntry[]> {
  // Fetch only the small metadata files for the other featured titles.
  return Promise.all(FEATURED_IDS.map(async (id) => {
    if (id === tallysCornerSample.book.id) return tallysCornerSample;

    const remoteBaseURL = `${R2_BASE}/${id}`;
    const response = await fetch(`${remoteBaseURL}/metadata.json`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Unable to load sample ${id}: ${response.status}`);

    const metadata = await response.json() as BookMetadata;
    const preferredChapterTitle = preferredSampleChapterTitles[id];
    const chapter = metadata.chapters?.find((item) => item.title === preferredChapterTitle)
      ?? metadata.chapters?.find((item) => /^chapter/i.test(item.title))
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
        title: metadata.title,
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
