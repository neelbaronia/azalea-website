export interface FeaturedBook {
  id: string;
  title: string;
  image: string;
  categories: readonly string[];
  categorySource: "bisac" | "catalog-genre";
  description: string;
}

// Snapshot of Azalea's public per-title metadata.json records, checked 2026-10-26.
// Keep this small landing-page selection local: no full-library request on load.
// Records without bisacCodes use their existing genres as a labeled fallback.
// Do not present fallback genres as assigned BISAC classifications or infer codes.
// Source root: https://pub-ee342152cf1149298fc3cb54a286f268.r2.dev/<id>/metadata.json
// Descriptions are concise, original summaries of those catalog descriptions.
export const featuredBooks: readonly FeaturedBook[] = [
  {
    id: "the-generals-cook",
    title: "The General’s Cook",
    image: "the-generals-cook.webp",
    categorySource: "bisac",
    categories: [
      "Fiction / Historical / General",
      "Biography & Autobiography / General",
      "Literary Collections / General",
    ],
    description:
      "Step into George Washington’s kitchen through the life and artistry of his celebrated chef, Hercules.",
  },
  {
    id: "diana",
    title: "Diana",
    image: "diana.webp",
    categorySource: "catalog-genre",
    categories: ["Fiction", "Romance"],
    description:
      "On an Italian lake, a poet searches for answers after the woman he loves suddenly disappears.",
  },
  {
    id: "acts-of-allegiance",
    title: "Acts of Allegiance",
    image: "acts-of-allegiance.webp",
    categorySource: "catalog-genre",
    categories: ["Thriller", "Historical Fiction", "Political"],
    description:
      "During the Troubles, an Irish diplomat is drawn into espionage, where loyalties to country and family collide.",
  },
  {
    id: "the-golden-age-of-pirates",
    title: "The Golden Age of Pirates",
    image: "the-golden-age-of-pirates.webp",
    categorySource: "bisac",
    categories: ["History / General", "Biography & Autobiography / General"],
    description:
      "Meet the maritime outlaws whose daring lives challenged empires and shaped the golden age of piracy.",
  },
  {
    id: "the-homestead",
    title: "The Homestead",
    image: "the-homestead.webp",
    categorySource: "bisac",
    categories: [
      "Fiction / Historical / General",
      "Fiction / Women",
      "Fiction / Coming of Age",
    ],
    description:
      "On the high prairie, pioneers face a fierce landscape and the struggle to build a life of their own.",
  },
  {
    id: "the-conquest-of-happiness-project-gutenberg",
    title: "The Conquest of Happiness",
    image: "the-conquest-of-happiness-project-gutenberg.webp",
    categorySource: "catalog-genre",
    categories: ["Philosophy"],
    description:
      "Bertrand Russell explores everyday unhappiness and the habits that can help us live with greater joy.",
  },
  {
    id: "sky-ranch",
    title: "Sky Ranch",
    image:
      "https://pub-ee342152cf1149298fc3cb54a286f268.r2.dev/sky-ranch/cover.jpg",
    categorySource: "bisac",
    categories: [
      "Fiction / Coming of Age",
      "Fiction / Historical / General",
      "Fiction / Women",
    ],
    description:
      "A city girl finds adventure and a different way of life on a remote Idaho ranch before the smartphone era.",
  },
  {
    id: "love-in-unlikely-places",
    title: "Love in Unlikely Places",
    image:
      "https://pub-ee342152cf1149298fc3cb54a286f268.r2.dev/love-in-unlikely-places/cover.jpg",
    categorySource: "bisac",
    categories: [
      "Fiction / Romance / General",
      "Fiction / Historical / General",
      "Fiction / Women",
    ],
    description:
      "After a decade in a one-room schoolhouse, a devoted teacher follows the pull of a new life and unexpected connections.",
  },
  {
    id: "framed-in-monte-carlo",
    title: "Framed in Monte Carlo",
    image:
      "https://pub-ee342152cf1149298fc3cb54a286f268.r2.dev/framed-in-monte-carlo/cover.jpg",
    categorySource: "bisac",
    categories: ["Fiction / Thrillers / General"],
    description:
      "Ted Maher recounts his conviction after a billionaire’s death in Monaco, and his fight to clear his name.",
  },
  {
    id: "return-from-siberia",
    title: "Return from Siberia",
    image:
      "https://pub-ee342152cf1149298fc3cb54a286f268.r2.dev/return-from-siberia/cover.png",
    categorySource: "bisac",
    categories: [
      "Fiction / Literary",
      "Fiction / Historical / General",
      "Fiction / Psychological",
    ],
    description:
      "A century-old manuscript draws a modern family into a young revolutionary’s journey through exile, survival, and romance.",
  },
  {
    id: "i-am-the-storm",
    title: "I Am the Storm",
    image:
      "https://pub-ee342152cf1149298fc3cb54a286f268.r2.dev/i-am-the-storm/cover.jpg",
    categorySource: "bisac",
    categories: ["History / General"],
    description:
      "A physician reflects on the challenges of medicine and life, exploring resilience, empathy, and the enduring spirit of healing.",
  },
  {
    id: "kremlin-wives",
    title: "Kremlin Wives",
    image: "kremlin-wives.webp",
    categorySource: "bisac",
    categories: ["Biography & Autobiography / General", "History / General"],
    description:
      "Behind the official histories, discover the private lives and relationships of the women married to Soviet leaders.",
  },
  {
    id: "little-book-of-restorative-teaching-tools",
    title: "Little Book of Restorative Teaching Tools",
    image: "little-book-of-restorative-teaching-tools.jpg",
    categorySource: "bisac",
    categories: ["Self-Help / General"],
    description:
      "Practical restorative strategies help teachers strengthen relationships, navigate conflict, and create a more supportive classroom community.",
  },
  {
    id: "cowboys",
    title: "Cowboys",
    image: "cowboys.webp",
    categorySource: "catalog-genre",
    categories: ["History", "Western"],
    description:
      "Go beyond the frontier legend to discover the demanding daily lives and cattle-trade realities of the American cowboy.",
  },
  {
    id: "lincoln-and-the-irish",
    title: "Lincoln and the Irish",
    image: "lincoln-and-the-irish.webp",
    categorySource: "bisac",
    categories: ["History / General", "Biography & Autobiography / General"],
    description:
      "Explore the overlooked influence of Irish immigrants and soldiers on Abraham Lincoln’s life, presidency, and fight to preserve the Union.",
  },
  {
    id: "the-pasha-of-cuisine",
    title: "The Pasha of Cuisine",
    image:
      "https://pub-ee342152cf1149298fc3cb54a286f268.r2.dev/the-pasha-of-cuisine/cover.jpg",
    categorySource: "bisac",
    categories: [
      "Fiction / Historical / General",
      "Fiction / Literary",
      "Fiction / Mystery & Detective / General",
    ],
    description:
      "In opulent Constantinople, a lavish banquet and meticulous service conceal secrets waiting to surface.",
  },
  {
    id: "the-phantom-public",
    title: "The Phantom Public",
    image: "the-phantom-public.webp",
    categorySource: "catalog-genre",
    categories: ["History & Politics", "Social Science", "Philosophy"],
    description:
      "Walter Lippmann challenges idealized views of democracy and asks what role ordinary citizens can really play in public affairs.",
  },
  {
    id: "tarrano-the-conqueror",
    title: "Tarrano the Conqueror",
    image: "tarrano-the-conqueror.webp",
    categorySource: "catalog-genre",
    categories: ["Fiction", "Science Fiction"],
    description:
      "In the year 2430, assassinations and interplanetary intrigue draw a news-gatherer into a dangerous struggle for power.",
  },
  {
    id: "a-honeymoon-in-space",
    title: "A Honeymoon in Space",
    image: "a-honeymoon-in-space.webp",
    categorySource: "catalog-genre",
    categories: ["Science Fiction", "Romance"],
    description:
      "A revolutionary spacecraft carries two lovers into an interplanetary adventure, blending early space opera with romance and earthly tensions.",
  },
  {
    id: "anthropology-and-modern-life",
    title: "Anthropology and Modern Life",
    image: "anthropology-and-modern-life.webp",
    categorySource: "catalog-genre",
    categories: ["Social Science", "World & Culture"],
    description:
      "Franz Boas examines how culture and environment shape human lives, challenging assumptions about race, nationalism, and modern society.",
  },
];
