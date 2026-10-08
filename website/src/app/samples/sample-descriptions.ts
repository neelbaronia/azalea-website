// Short editorial summaries based on these books' existing Spotify listings.
// Use only while per-book metadata has a generic "Audiobook version of" blurb;
// a substantive metadata description automatically takes precedence.
// Keeping these local avoids fetching Spotify or the full catalog on page load.
export const sampleDescriptionFallbacks: Readonly<Record<string, string>> = {
  // https://open.spotify.com/show/1gVhghPFOaZKwjeBkzkLjI
  "anthropology-and-modern-life":
    "Franz Boas examines how biology, culture, and social institutions shape human life. Bringing anthropological evidence to debates about race and national identity, he challenges assumptions that turn cultural differences into claims of superiority. The book connects the study of human societies with the tensions of modern life, asking how inherited prejudices influence our understanding of ourselves and other people.",
};
