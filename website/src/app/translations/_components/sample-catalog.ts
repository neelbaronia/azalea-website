import { sentencePairs, type SentencePair } from "./text-sample";

export type TranslationSample = {
  id: string;
  language: string;
  languageCode: string;
  originalTitle: string;
  translatedTitle?: string;
  author: string;
  translator: string;
  translatorBioUrl: string;
  source: string;
  sourceUrl: string;
  sourceFolio?: number;
  pairs: SentencePair[];
};

export const samples: TranslationSample[] = [
  {
    id: "ich-hoere-sie-lachen-anna-lynn-dolman",
    language: "German",
    languageCode: "de",
    originalTitle: "Ich höre sie lachen",
    translatedTitle: "I Hear Her Laughing",
    author: "Monika Helfer",
    translator: "Anna Lynn Dolman",
    translatorBioUrl: "https://german.berkeley.edu/people/anna-lynn-dolman",
    source: "VOLLTEXT 4/2024",
    sourceUrl: "https://volltext.net/wp-content/uploads/2025/08/Volltext_2024-04.pdf",
    sourceFolio: 48,
    pairs: sentencePairs,
  },
  {
    id: "la-giostra-sophia-barry-gordon",
    language: "Italian",
    languageCode: "it",
    originalTitle: "La giostra",
    author: "Filippo Rigli",
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
    author: "Riccardo Manzotti",
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
    author: "Filippo Rigli",
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
    author: "Riccardo Manzotti",
    translator: "Jess Dubie",
    translatorBioUrl: "https://symposium.gafis.frit.wisc.edu/contacts-3/",
    source: "L’Indiscreto",
    sourceUrl: "https://www.indiscreto.org/io-non-sono-il-mio-colon-la-teoria-della-mente-allargata/",
    pairs: [],
  },
];

export function getSample(sampleId: string) {
  return samples.find((sample) => sample.id === sampleId);
}
