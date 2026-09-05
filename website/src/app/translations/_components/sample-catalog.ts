import {
  lailaMemoryOfAshesPairs,
  lailaMonBordierPairs,
  lynnHelferPairs,
  type SentencePair,
} from "./text-sample";
import { hanForeheadAndBenchParagraphs, hanMinotaurParagraphs } from "./han-text-samples";

export type TranslationSample = {
  id: string;
  language: string;
  languageCode: string;
  originalTitle: string;
  translatedTitle: string;
  author: string;
  englishAuthor: string;
  translator: string;
  translatorBioUrl: string;
  source: string;
  sourceUrl: string;
  sourceFolio?: number;
  pairs: SentencePair[];
  translationParagraphs?: string[];
};

export type LanguageTheme = {
  accent: string;
  accentSoft: string;
  accentInk: string;
  highlight: string;
};

const defaultLanguageTheme: LanguageTheme = {
  accent: "#3566ff",
  accentSoft: "#dfe7ff",
  accentInk: "#1f49d8",
  highlight: "rgba(53, 102, 255, 0.15)",
};

const languageThemes: Record<string, LanguageTheme> = {
  de: defaultLanguageTheme,
  it: {
    accent: "#d93668",
    accentSoft: "#ffe1ea",
    accentInk: "#b22150",
    highlight: "rgba(217, 54, 104, 0.15)",
  },
  fr: {
    accent: "#008a72",
    accentSoft: "#ddf3ed",
    accentInk: "#006a58",
    highlight: "rgba(0, 138, 114, 0.15)",
  },
  es: {
    accent: "#d47a13",
    accentSoft: "#fff0d8",
    accentInk: "#9a5205",
    highlight: "rgba(212, 122, 19, 0.16)",
  },
  zh: {
    accent: "#c43b42",
    accentSoft: "#fde5e6",
    accentInk: "#96252d",
    highlight: "rgba(196, 59, 66, 0.15)",
  },
  ja: {
    accent: "#087fa6",
    accentSoft: "#ddf2f7",
    accentInk: "#05617f",
    highlight: "rgba(8, 127, 166, 0.15)",
  },
};

export function getLanguageTheme(languageCode: string) {
  return languageThemes[languageCode] ?? defaultLanguageTheme;
}

export const samples: TranslationSample[] = [
  {
    id: "ich-hoere-sie-lachen-anna-lynn-dolman",
    language: "German",
    languageCode: "de",
    originalTitle: "Ich höre sie lachen",
    translatedTitle: "I Hear Her Laughing",
    author: "Monika Helfer",
    englishAuthor: "Monika Helfer",
    translator: "Anna Lynn Dolman",
    translatorBioUrl: "https://german.berkeley.edu/people/anna-lynn-dolman",
    source: "VOLLTEXT 4/2024",
    sourceUrl: "https://volltext.net/wp-content/uploads/2025/08/Volltext_2024-04.pdf",
    sourceFolio: 48,
    pairs: lynnHelferPairs,
  },
  {
    id: "was-haettest-du-getan-anna-lynn-dolman",
    language: "German",
    languageCode: "de",
    originalTitle: "Was hättest du getan?",
    translatedTitle: "What Would You Have Done?",
    author: "Dana Vowinckel",
    englishAuthor: "Dana Vowinckel",
    translator: "Anna Lynn Dolman",
    translatorBioUrl: "https://german.berkeley.edu/people/anna-lynn-dolman",
    source: "VOLLTEXT 4/2024",
    sourceUrl: "https://volltext.net/wp-content/uploads/2025/08/Volltext_2024-04.pdf",
    sourceFolio: 57,
    pairs: [],
  },
  {
    id: "memoire-de-cendres-laila-riazi",
    language: "French",
    languageCode: "fr",
    originalTitle: "Mémoire de cendres",
    translatedTitle: "Memory of Ashes",
    author: "Christian Malela",
    englishAuthor: "Christian Malela",
    translator: "Laila Riazi",
    translatorBioUrl: "https://complit.berkeley.edu/people/laila-riazi",
    source: "Short Édition",
    sourceUrl: "https://short-edition.com/fr/oeuvre/memoire-de-cendres",
    pairs: lailaMemoryOfAshesPairs,
  },
  {
    id: "mon-bordier-et-ma-rose-laila-riazi",
    language: "French",
    languageCode: "fr",
    originalTitle: "Mon bordièr et ma Rose",
    translatedTitle: "My Farmer and My Rose",
    author: "Nicolas Guardiola",
    englishAuthor: "Nicolas Guardiola",
    translator: "Laila Riazi",
    translatorBioUrl: "https://complit.berkeley.edu/people/laila-riazi",
    source: "Le Lecteur du Val, 2024",
    sourceUrl: "https://www.lecteurduval.org/645-nouvelles_2024.html#bordier",
    pairs: lailaMonBordierPairs,
  },
  {
    id: "la-giostra-sophia-barry-gordon",
    language: "Italian",
    languageCode: "it",
    originalTitle: "La giostra",
    translatedTitle: "The Carousel",
    author: "Filippo Rigli",
    englishAuthor: "Filippo Rigli",
    translator: "Sophia Barry Gordon",
    translatorBioUrl: "https://societyofauthors.org/soa-member/sophia-barry-gordon/",
    source: "L’Indiscreto",
    sourceUrl: "https://www.indiscreto.org/la-giostra/",
    pairs: [],
  },
  {
    id: "io-non-sono-il-mio-colon-sophia-barry-gordon",
    language: "Italian",
    languageCode: "it",
    originalTitle: "Io non sono il mio colon",
    translatedTitle: "I Am Not My Colon",
    author: "Riccardo Manzotti",
    englishAuthor: "Riccardo Manzotti",
    translator: "Sophia Barry Gordon",
    translatorBioUrl: "https://societyofauthors.org/soa-member/sophia-barry-gordon/",
    source: "L’Indiscreto",
    sourceUrl: "https://www.indiscreto.org/io-non-sono-il-mio-colon-la-teoria-della-mente-allargata/",
    pairs: [],
  },
  {
    id: "la-giostra-jess-dubie",
    language: "Italian",
    languageCode: "it",
    originalTitle: "La giostra",
    translatedTitle: "The Carousel",
    author: "Filippo Rigli",
    englishAuthor: "Filippo Rigli",
    translator: "Jess Dubie",
    translatorBioUrl: "https://symposium.gafis.frit.wisc.edu/contacts-3/",
    source: "L’Indiscreto",
    sourceUrl: "https://www.indiscreto.org/la-giostra/",
    pairs: [],
  },
  {
    id: "io-non-sono-il-mio-colon-jess-dubie",
    language: "Italian",
    languageCode: "it",
    originalTitle: "Io non sono il mio colon",
    translatedTitle: "I Am Not My Colon",
    author: "Riccardo Manzotti",
    englishAuthor: "Riccardo Manzotti",
    translator: "Jess Dubie",
    translatorBioUrl: "https://symposium.gafis.frit.wisc.edu/contacts-3/",
    source: "L’Indiscreto",
    sourceUrl: "https://www.indiscreto.org/io-non-sono-il-mio-colon-la-teoria-della-mente-allargata/",
    pairs: [],
  },
  {
    id: "rosauro-landon-kramer",
    language: "Spanish",
    languageCode: "es",
    originalTitle: "Rosauro",
    translatedTitle: "Rosauro",
    author: "Bárbara Sánchez",
    englishAuthor: "Bárbara Sánchez",
    translator: "Landon Kramer",
    translatorBioUrl: "https://complit.berkeley.edu/people/landon-kramer",
    source: "Energheia",
    sourceUrl: "https://www.energheia.org/rosauro-barbara-sanchez_madrid.html",
    pairs: [],
  },
  {
    id: "nido-de-aviones-landon-kramer",
    language: "Spanish",
    languageCode: "es",
    originalTitle: "Nido de aviones",
    translatedTitle: "Nest of Airplanes",
    author: "Iria Fariñas",
    englishAuthor: "Iria Fariñas",
    translator: "Landon Kramer",
    translatorBioUrl: "https://complit.berkeley.edu/people/landon-kramer",
    source: "Energheia",
    sourceUrl: "https://www.energheia.org/nido-de-aviones.html",
    pairs: [],
  },
  {
    id: "minotaur-han-li",
    language: "Chinese",
    languageCode: "zh",
    originalTitle: "米诺陶洛斯",
    translatedTitle: "Minotaur",
    author: "杨若兮",
    englishAuthor: "Yang Ruoxi",
    translator: "Han Li",
    translatorBioUrl: "https://asianstudies.cornell.edu/current-grad-students",
    source: "一苇轩",
    sourceUrl: "https://www.gzywtk.com/tmshow/31525.html",
    pairs: [],
    translationParagraphs: hanMinotaurParagraphs,
  },
  {
    id: "forehead-and-bench-han-li",
    language: "Chinese",
    languageCode: "zh",
    originalTitle: "奔儿头和板凳",
    translatedTitle: "Forehead and Bench",
    author: "津子围",
    englishAuthor: "Jin Ziwei",
    translator: "Han Li",
    translatorBioUrl: "https://asianstudies.cornell.edu/current-grad-students",
    source: "北国网",
    sourceUrl: "https://news.lnd.com.cn/system/2025/02/19/030502682.shtml",
    pairs: [],
    translationParagraphs: hanForeheadAndBenchParagraphs,
  },
  {
    id: "a-substitute-for-fiction-jordan-niver-johnson",
    language: "Japanese",
    languageCode: "ja",
    originalTitle: "虚構の代替品",
    translatedTitle: "A Substitute for Fiction",
    author: "あみに",
    englishAuthor: "Amini",
    translator: "Jordan Niver-Johnson",
    translatorBioUrl: "https://asian.washington.edu/people/jordan-niver-johnson",
    source: "オレンジ文庫",
    sourceUrl: "https://orangebunko.shueisha.co.jp/online/tanpen235_kyoko_no_daitaihin",
    pairs: [],
  },
  {
    id: "the-fools-bus-to-station-b-jordan-niver-johnson",
    language: "Japanese",
    languageCode: "ja",
    originalTitle: "B駅行き愚者のバス",
    translatedTitle: "The Fool’s Bus to Station B",
    author: "遠窓ヒスイ",
    englishAuthor: "Tōmado Hisui",
    translator: "Jordan Niver-Johnson",
    translatorBioUrl: "https://asian.washington.edu/people/jordan-niver-johnson",
    source: "オレンジ文庫",
    sourceUrl: "https://orangebunko.shueisha.co.jp/online/tanpen235_gusha_no_bus",
    pairs: [],
  },
];

export function getSample(sampleId: string) {
  return samples.find((sample) => sample.id === sampleId);
}
