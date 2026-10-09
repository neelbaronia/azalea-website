// Countries with any Spotify listener activity in the available analytics
// history, December 2025 through October 2026. Shared by all site maps.
export const LISTENER_FOOTPRINT_PERIOD = "December 2025–October 2026";

export const LISTENER_FOOTPRINT = [
  { name: "United States of America", label: "United States", color: "#5d5df5" },
  { name: "United Kingdom", label: "United Kingdom", color: "#ec4978" },
  { name: "Canada", label: "Canada", color: "#ff9900" },
  { name: "Ireland", label: "Ireland", color: "#00ef82" },
  { name: "Australia", label: "Australia", color: "#00dd33" },
  { name: "Germany", label: "Germany", color: "#d62036" },
  { name: "New Zealand", label: "New Zealand", color: "#ffcf00" },
  { name: "Belgium", label: "Belgium", color: "#f06b2f" },
  { name: "Denmark", label: "Denmark", color: "#e76f51" },
  { name: "Netherlands", label: "Netherlands", color: "#3566ff" },
  { name: "Sweden", label: "Sweden", color: "#00b870" },
  { name: "Switzerland", label: "Switzerland", color: "#9b5de5" },
  { name: "Austria", label: "Austria", color: "#192aff" },
  { name: "Finland", label: "Finland", color: "#2a9d8f" },
  { name: "France", label: "France", color: "#8d5fd3" },
  { name: "Monaco", label: "Monaco", color: "#d65a31" },
] as const;

// Audiobook storefront markets (not a claim that every title is live in each
// market). Apple and Spotify publish separate country lists for audiobooks.
// Sources checked 2026-10-09:
// https://itunespartner.apple.com/books/support/45-sell-audiobooks-apple-books
// https://support.spotify.com/authors/article/audiobooks-availability/
// Country names are normalized to the names used by world-atlas.
export const APPLE_BOOKS_AUDIOBOOK_MARKETS = new Set([
  "Australia",
  "Austria",
  "Belgium",
  "Canada",
  "Denmark",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Ireland",
  "Italy",
  "Japan",
  "Luxembourg",
  "Netherlands",
  "New Zealand",
  "Norway",
  "Portugal",
  "Spain",
  "Sweden",
  "Switzerland",
  "United Kingdom",
  "United States",
]);

export const SPOTIFY_AUDIOBOOK_MARKETS = new Set([
  "Australia",
  "Austria",
  "Belgium",
  "Canada",
  "Denmark",
  "Finland",
  "France",
  "Germany",
  "Iceland",
  "Ireland",
  "Liechtenstein",
  "Luxembourg",
  "Monaco",
  "Netherlands",
  "New Zealand",
  "Saudi Arabia",
  "South Africa",
  "Sweden",
  "Switzerland",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
]);

export type CatalogPlatform = "apple" | "spotify";

export function getCatalogPlatforms(countryName: string): CatalogPlatform[] {
  const marketName =
    countryName === "United States of America" ? "United States" : countryName;
  const platforms: CatalogPlatform[] = [];

  if (APPLE_BOOKS_AUDIOBOOK_MARKETS.has(marketName)) platforms.push("apple");
  if (SPOTIFY_AUDIOBOOK_MARKETS.has(marketName)) platforms.push("spotify");

  return platforms;
}

export const CATALOG_MARKET_COUNTRY_COUNT = new Set([
  ...APPLE_BOOKS_AUDIOBOOK_MARKETS,
  ...SPOTIFY_AUDIOBOOK_MARKETS,
]).size;

export const CATALOG_MARKET_COUNTS = {
  appleBooks: APPLE_BOOKS_AUDIOBOOK_MARKETS.size,
  spotify: SPOTIFY_AUDIOBOOK_MARKETS.size,
  both: [...APPLE_BOOKS_AUDIOBOOK_MARKETS].filter((country) =>
    SPOTIFY_AUDIOBOOK_MARKETS.has(country),
  ).length,
  total: CATALOG_MARKET_COUNTRY_COUNT,
} as const;

// The low-resolution world-atlas map omits these microstates, so the map
// renders small markers at their approximate geographic centers instead.
export const SMALL_COUNTRY_MARKERS: ReadonlyArray<{
  name: string;
  coordinates: [number, number];
}> = [
  { name: "Liechtenstein", coordinates: [9.555, 47.166] },
  { name: "Monaco", coordinates: [7.424, 43.738] },
];
