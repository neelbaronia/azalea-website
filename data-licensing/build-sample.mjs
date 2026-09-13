// Builds the Azalea Labs licensing sample package from the live site data.
//
//   node data-licensing/build-sample.mjs
//
// Reads the translation samples that back /translations, strips the TypeScript
// annotations, and emits the JSONL + manifest files under data-licensing/sample/.
// Regenerate whenever new translator deliveries land in the site catalog.

import { mkdtemp, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const componentsDir = path.join(
  repoRoot,
  "website/src/app/translations/_components",
);
const outDir = path.join(here, "sample");

const DATASET_VERSION = "0.1.1";
const RELEASE_DATE = "2026-09-13";

// ---------------------------------------------------------------------------
// Load the site's sample data (TS -> ESM, types stripped)
// ---------------------------------------------------------------------------

async function loadSiteData() {
  const staging = await mkdtemp(path.join(tmpdir(), "azalea-ds-"));
  const files = [
    "text-sample",
    "han-text-samples",
    "lynn-text-samples",
    "landon-text-samples",
  ];

  for (const name of files) {
    let src = await readFile(path.join(componentsDir, `${name}.ts`), "utf8");
    src = src
      .replace(/^import type .*$/gm, "")
      .replace(/export type SentencePair = \{[\s\S]*?\};\n/, "")
      .replace(/: SentencePair\[\]/g, "")
      .replace(/: string\[\]/g, "")
      .replace(/^const /gm, "export const ")
      .replace(/from "\.\/text-sample"/g, 'from "./text-sample.mjs"');
    await writeFile(path.join(staging, `${name}.mjs`), src);
  }

  const mods = await Promise.all(
    files.map((name) =>
      import(path.join(staging, `${name}.mjs`)).then((m) => ({ ...m })),
    ),
  );
  await rm(staging, { recursive: true, force: true });
  return Object.assign({}, ...mods);
}

// ---------------------------------------------------------------------------
// Editorial metadata. Mirrors sample-catalog.ts, plus the licensing fields a
// buyer needs that the website has no reason to carry.
// ---------------------------------------------------------------------------

const TRANSLATORS = {
  "anna-lynn-dolman": {
    translator_id: "azl-tr-0001",
    name: "Anna Lynn Dolman",
    affiliation: "UC Berkeley, Dept. of German",
    credential: "PhD candidate, German literature",
    credential_url: "https://german.berkeley.edu/people/anna-lynn-dolman",
    native_language: "en",
    working_languages: ["de", "en"],
  },
  "laila-riazi": {
    translator_id: "azl-tr-0002",
    name: "Laila Riazi",
    affiliation: "UC Berkeley, Dept. of Comparative Literature",
    credential: "PhD candidate, comparative literature",
    credential_url: "https://complit.berkeley.edu/people/laila-riazi",
    native_language: "en",
    working_languages: ["fr", "en"],
  },
  "han-li": {
    translator_id: "azl-tr-0003",
    name: "Han Li",
    affiliation: "Cornell University, Dept. of Asian Studies",
    credential: "PhD student, Asian studies",
    credential_url: "https://asianstudies.cornell.edu/current-grad-students",
    native_language: "zh",
    working_languages: ["zh", "en"],
  },
  "landon-kramer": {
    translator_id: "azl-tr-0004",
    name: "Landon Kramer",
    affiliation: "UC Berkeley, Dept. of Comparative Literature",
    credential: "Graduate student, comparative literature",
    credential_url: "https://complit.berkeley.edu/people/landon-kramer",
    native_language: "en",
    working_languages: ["es", "en"],
  },
};

const WORKS = [
  {
    document_id: "azl-de-0001",
    source_key: "lynnHelferPairs",
    source_language: "de",
    target_language: "en",
    source_title: "Ich höre sie lachen",
    target_title: "I Hear Her Laughing",
    source_author: "Monika Helfer",
    translator: "anna-lynn-dolman",
    genre: "literary_fiction",
    form: "short_story",
    register: "literary",
    publication: {
      venue: "VOLLTEXT 4/2024",
      url: "https://volltext.net/wp-content/uploads/2025/08/Volltext_2024-04.pdf",
      folio: 48,
      source_first_published: 2024,
    },
    difficulty_tags: [
      "dialogue_heavy",
      "free_indirect_discourse",
      "colloquial_register",
      "austrian_german",
    ],
    delivery: { delivered: "2026-08-12", editorial_passes: 2 },
    notes:
      "Marital dialogue carried almost entirely in short exchanges; the register shift between the couple's speech and the narrator is the central translation problem.",
  },
  {
    document_id: "azl-fr-0001",
    source_key: "lailaMemoryOfAshesPairs",
    source_language: "fr",
    target_language: "en",
    source_title: "Mémoire de cendres",
    target_title: "Memory of Ashes",
    source_author: "Christian Malela",
    translator: "laila-riazi",
    genre: "literary_fiction",
    form: "short_story",
    register: "literary",
    publication: {
      venue: "Short Édition",
      url: "https://short-edition.com/fr/oeuvre/memoire-de-cendres",
      source_first_published: 2024,
    },
    difficulty_tags: ["lyric_prose", "figurative_density", "tense_sequencing"],
    delivery: { delivered: "2026-07-29", editorial_passes: 2 },
    notes:
      "Dense figurative prose; the French passé simple / imparfait alternation has no direct English carrier and is resolved through aspectual paraphrase.",
  },
  {
    document_id: "azl-fr-0002",
    source_key: "lailaMonBordierPairs",
    source_language: "fr",
    target_language: "en",
    source_title: "Mon bordièr et ma Rose",
    target_title: "My Farmer and My Rose",
    source_author: "Nicolas Guardiola",
    translator: "laila-riazi",
    genre: "literary_fiction",
    form: "short_story",
    register: "literary",
    publication: {
      venue: "Le Lecteur du Val, 2024",
      url: "https://www.lecteurduval.org/645-nouvelles_2024.html#bordier",
      source_first_published: 2024,
    },
    difficulty_tags: [
      "occitan_loanwords",
      "regional_dialect",
      "agricultural_terminology",
      "culture_bound_terms",
    ],
    delivery: { delivered: "2026-08-04", editorial_passes: 2 },
    notes:
      "Occitan-inflected southern French. 'Bordièr' is a regional tenant-farmer term with no clean English equivalent; the rendering is a documented editorial choice.",
  },
  {
    document_id: "azl-zh-0001",
    source_key: "hanMinotaurPairs",
    source_language: "zh",
    target_language: "en",
    source_title: "米诺陶洛斯",
    target_title: "Minotaur",
    source_author: "杨若兮 (Yang Ruoxi)",
    translator: "han-li",
    genre: "literary_fiction",
    form: "short_story",
    register: "literary",
    publication: {
      venue: "一苇轩",
      url: "https://www.gzywtk.com/tmshow/31525.html",
      source_first_published: 2025,
    },
    difficulty_tags: [
      "classical_allusion",
      "zero_anaphora",
      "aspect_without_tense",
      "chengyu",
    ],
    delivery: { delivered: "2026-08-21", editorial_passes: 2 },
    notes:
      "Greek myth refracted through contemporary Chinese prose. Zero-subject clauses require the translator to supply referents the source deliberately withholds.",
  },
  {
    document_id: "azl-zh-0002",
    source_key: "hanForeheadAndBenchPairs",
    source_language: "zh",
    target_language: "en",
    source_title: "奔儿头和板凳",
    target_title: "Forehead and Bench",
    source_author: "津子围 (Jin Ziwei)",
    translator: "han-li",
    genre: "literary_fiction",
    form: "short_story",
    register: "literary",
    publication: {
      venue: "北国网",
      url: "https://news.lnd.com.cn/system/2025/02/19/030502682.shtml",
      source_first_published: 2025,
    },
    difficulty_tags: [
      "nicknames_as_wordplay",
      "culture_bound_game",
      "beijing_colloquial",
      "proverb",
    ],
    delivery: { delivered: "2026-08-27", editorial_passes: 2 },
    notes:
      "Both protagonists are named by childhood nicknames that are also physical descriptions; the folk game 撞拐 is retained untranslated with an in-text gloss.",
  },
  {
    document_id: "azl-es-0001",
    source_key: "landonRosauroPairs",
    source_language: "es",
    target_language: "en",
    source_title: "Rosauro",
    target_title: "Rosauro",
    source_author: "Bárbara Sánchez",
    translator: "landon-kramer",
    genre: "literary_fiction",
    form: "short_story",
    register: "literary",
    publication: {
      venue: "Energheia",
      url: "https://www.energheia.org/rosauro-barbara-sanchez_madrid.html",
    },
    difficulty_tags: [
      "first_person_narration",
      "extended_metaphor",
      "register_shift",
      "legal_register",
    ],
    delivery: { delivered: "2026-09-13", editorial_passes: 1 },
    notes:
      "Surreal first-person fiction that sustains a plant/body metaphor across the narrative before shifting into a formal legal coda.",
  },
  {
    document_id: "azl-es-0002",
    source_key: "landonNidoDeAvionesPairs",
    source_language: "es",
    target_language: "en",
    source_title: "Nido de aviones",
    target_title: "Nest of Airplanes",
    source_author: "Iria Fariñas",
    translator: "landon-kramer",
    genre: "literary_fiction",
    form: "short_story",
    register: "literary",
    publication: {
      venue: "Energheia",
      url: "https://www.energheia.org/nido-de-aviones.html",
    },
    difficulty_tags: [
      "surrealism",
      "linguistic_play",
      "fragmented_dialogue",
      "narrative_transformation",
    ],
    delivery: { delivered: "2026-09-13", editorial_passes: 1 },
    notes:
      "Surreal village narrative built around linguistic breakdown, recurring transformation, and the protagonist's search for a living spirit of flight.",
  },
];

// Translator rationale layer. Keyed by document_id -> segment index. This is
// the annotation that does not exist in any public parallel corpus; it is
// collected from the translators at delivery time.
const RATIONALE = {
  "azl-fr-0002": {
    0: {
      difficulty: "culture_bound_term",
      decision:
        "'Bordièr' kept as 'farmer' in the title rather than 'sharecropper' or 'tenant farmer'.",
      rationale:
        "The Occitan term denotes a specific tenancy arrangement that no English word carries. 'Sharecropper' imports American antebellum connotations that would misdirect an anglophone reader; 'tenant farmer' is accurate but flattens the possessive intimacy of 'mon bordièr'. 'My Farmer' preserves the possessive, which is what the story is actually about.",
      alternatives_rejected: ["My Sharecropper and My Rose", "My Tenant Farmer and My Rose"],
    },
  },
  "azl-zh-0002": {
    2: {
      difficulty: "culture_bound_game",
      decision:
        "撞拐 transliterated as 'Zhuangguai' and glossed in-line by the paragraph that follows.",
      rationale:
        "The source paragraph already functions as a rules explanation for Chinese readers unfamiliar with the regional variant, so the gloss is native to the text rather than a translator's intrusion. Substituting 'chicken fight' or 'knee wars' would localise away the setting, which the story needs for its generational frame.",
      alternatives_rejected: ["chicken fighting", "knee wars", "one-legged tag"],
    },
  },
  "azl-de-0001": {
    1: {
      difficulty: "register_and_idiom",
      decision:
        "'Das ist doch penetrant' rendered as 'It's downright obnoxious' rather than 'That's so intrusive'.",
      rationale:
        "German 'penetrant' in this colloquial usage is a judgement about a person being grating, not about intrusion. The wife is being catty, and the English needs the same everyday nastiness; 'intrusive' reads clinical and loses the marital sniping the scene runs on.",
      alternatives_rejected: ["That's so intrusive", "It's really pushy", "How grating"],
    },
  },
};

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

const countWords = (s, lang) =>
  lang === "zh" || lang === "ja"
    ? (s.match(/[㐀-鿿぀-ヿ]/g) || []).length
    : (s.trim().match(/\S+/g) || []).length;

function buildDocument(work, data) {
  const pairs = data[work.source_key];
  if (!Array.isArray(pairs)) throw new Error(`missing ${work.source_key}`);
  const translator = TRANSLATORS[work.translator];
  const rationale = RATIONALE[work.document_id] || {};

  const segments = pairs.map((pair, i) => {
    const seg = {
      segment_id: `${work.document_id}:s${String(i + 1).padStart(4, "0")}`,
      index: i,
      source_text: pair.original,
      target_text: pair.translation,
      alignment: "1:1",
      alignment_confidence: 1.0,
      source_words: countWords(pair.original, work.source_language),
      target_words: countWords(pair.translation, work.target_language),
    };
    if (rationale[i]) seg.translator_annotation = rationale[i];
    return seg;
  });

  const sum = (k) => segments.reduce((a, s) => a + s[k], 0);

  return {
    schema_version: DATASET_VERSION,
    document_id: work.document_id,
    source_language: work.source_language,
    target_language: work.target_language,
    direction: `${work.source_language}-${work.target_language}`,
    source_title: work.source_title,
    target_title: work.target_title,
    source_author: work.source_author,
    genre: work.genre,
    form: work.form,
    register: work.register,
    domain: "literary",
    difficulty_tags: work.difficulty_tags,
    editorial_note: work.notes,

    translator,

    provenance: {
      source_publication: work.publication,
      source_rights_holder: "original author / original publisher",
      source_text_license: "NOT CLEARED — see RIGHTS.md",
      translation_rights_holder: translator.name,
      translation_license: "NOT CLEARED — see RIGHTS.md",
      commissioned_by: "Azalea Labs",
      work_for_hire: false,
    },

    process: {
      human_authored: true,
      machine_translation_used: false,
      mt_post_editing: false,
      llm_assistance: "none",
      attestation:
        "Translator attests the target text was composed without machine translation or LLM drafting/post-editing.",
      editorial_passes: work.delivery.editorial_passes,
      delivered: work.delivery.delivered,
    },

    contamination: {
      source_text_public: true,
      source_text_url: work.publication.url,
      target_text_public: false,
      target_text_previously_published: false,
      web_crawlable: false,
      note:
        "Target text has never been published or crawled. Source text is public at the URL above and may already appear in web-scale pretraining corpora; the English side is net-new.",
    },

    stats: {
      segments: segments.length,
      source_words: sum("source_words"),
      target_words: sum("target_words"),
      annotated_segments: Object.keys(rationale).length,
    },

    segments,
  };
}

const data = await loadSiteData();
const documents = WORKS.map((w) => buildDocument(w, data));

await mkdir(outDir, { recursive: true });

// 1. Document-level JSONL — the recommended delivery format.
const docJsonl = documents.map((d) => JSON.stringify(d)).join("\n") + "\n";
await writeFile(path.join(outDir, "azalea-literary-parallel-v0.1.jsonl"), docJsonl);

// 2. Flat segment-level JSONL — drop-in for standard MT/SFT pipelines.
const segRows = documents.flatMap((d) =>
  d.segments.map((s) => ({
    id: s.segment_id,
    document_id: d.document_id,
    direction: d.direction,
    source: s.source_text,
    target: s.target_text,
    domain: d.domain,
    register: d.register,
    difficulty_tags: d.difficulty_tags,
    translator_id: d.translator.translator_id,
    human_authored: true,
    machine_translation_used: false,
    target_text_public: false,
    prev_segment: s.index > 0 ? d.segments[s.index - 1].source_text : null,
    next_segment:
      s.index < d.segments.length - 1 ? d.segments[s.index + 1].source_text : null,
    translator_annotation: s.translator_annotation ?? null,
  })),
);
await writeFile(
  path.join(outDir, "azalea-segments-v0.1.jsonl"),
  segRows.map((r) => JSON.stringify(r)).join("\n") + "\n",
);

// 3. Manifest with inventory, counts and checksums.
const byDirection = {};
for (const d of documents) {
  const e = (byDirection[d.direction] ??= {
    documents: 0,
    segments: 0,
    source_words: 0,
    target_words: 0,
  });
  e.documents += 1;
  e.segments += d.stats.segments;
  e.source_words += d.stats.source_words;
  e.target_words += d.stats.target_words;
}

const sha = (s) => createHash("sha256").update(s).digest("hex");
const manifest = {
  dataset: "azalea-literary-parallel",
  version: DATASET_VERSION,
  release_date: RELEASE_DATE,
  publisher: "Azalea Labs",
  contact: "nbaronia@gmail.com",
  description:
    "Human-authored literary translations into English, segment-aligned, with translator provenance and a rationale annotation layer. Sample extract; not the full corpus.",
  status: "SAMPLE — rights clearance in progress, see RIGHTS.md",
  totals: {
    documents: documents.length,
    segments: segRows.length,
    source_words: documents.reduce((a, d) => a + d.stats.source_words, 0),
    target_words: documents.reduce((a, d) => a + d.stats.target_words, 0),
    annotated_segments: documents.reduce((a, d) => a + d.stats.annotated_segments, 0),
    translators: new Set(documents.map((d) => d.translator.translator_id)).size,
    directions: Object.keys(byDirection).length,
  },
  by_direction: byDirection,
  files: [
    {
      path: "azalea-literary-parallel-v0.1.jsonl",
      format: "jsonl",
      granularity: "document",
      records: documents.length,
      sha256: sha(docJsonl),
    },
    {
      path: "azalea-segments-v0.1.jsonl",
      format: "jsonl",
      granularity: "segment",
      records: segRows.length,
      sha256: sha(segRows.map((r) => JSON.stringify(r)).join("\n") + "\n"),
    },
  ],
  documents: documents.map((d) => ({
    document_id: d.document_id,
    direction: d.direction,
    target_title: d.target_title,
    translator: d.translator.name,
    ...d.stats,
  })),
};
await writeFile(
  path.join(outDir, "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);

console.log(`documents  ${manifest.totals.documents}`);
console.log(`segments   ${manifest.totals.segments}`);
console.log(`src words  ${manifest.totals.source_words}`);
console.log(`tgt words  ${manifest.totals.target_words}`);
console.log(`directions ${Object.entries(byDirection).map(([k, v]) => `${k}=${v.segments}`).join(" ")}`);
