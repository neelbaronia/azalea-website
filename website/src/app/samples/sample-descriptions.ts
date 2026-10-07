// Short editorial summaries based on these books' existing Spotify listings.
// Use only while per-book metadata has a generic "Audiobook version of" blurb;
// a substantive metadata description automatically takes precedence.
// Keeping these local avoids fetching Spotify or the full catalog on page load.
export const sampleDescriptionFallbacks: Readonly<Record<string, string>> = {
  // https://open.spotify.com/show/1gVhghPFOaZKwjeBkzkLjI
  "anthropology-and-modern-life":
    "Franz Boas examines how biology, culture, and social institutions shape human life. Bringing anthropological evidence to debates about race and national identity, he challenges assumptions that turn cultural differences into claims of superiority. The book connects the study of human societies with the tensions of modern life, asking how inherited prejudices influence our understanding of ourselves and other people.",
  // https://open.spotify.com/show/1m2ENBQsCEtqSYEwzYaCNn
  "tarrano-the-conqueror":
    "Ray Cummings’s interplanetary adventure follows the resistance to Tarrano, a would-be ruler of Earth, Mars, and Venus. A journalist joins two brilliant twins and an exiled princess in a struggle involving political assassinations, advanced weapons, and a secret that promises extraordinary longevity. Across distant worlds, espionage and aerial combat drive a battle over who will control the Solar System.",
  // https://open.spotify.com/show/3R2BodaaBtvXWrMFjgeAtD
  "the-phantom-public":
    "Walter Lippmann questions the idea of an all-knowing public directing political life. He examines the limits of citizens’ knowledge and attention, and the roles played by leaders, persuasion, and the media in forming opinion. The result is a critical account of democratic participation: what the public can realistically do, how power operates, and why popular opinion is not the same as informed control.",
};
