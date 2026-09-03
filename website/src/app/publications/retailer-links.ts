export interface RetailerLinks {
  appleBooks?: string;
  googlePlay?: string;
}

// Verified against the live PublishDrive store listings on September 2, 2026.
// Titles that PublishDrive still marks as "Waiting on store" are intentionally omitted.
export const retailerLinksByBookId: Record<string, RetailerLinks> = {
  "a-horse-for-elsie": {
    appleBooks: "https://books.apple.com/audiobook/id6803185435",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGCCZIMM",
  },
  "becky-meets-her-match": {
    appleBooks: "https://books.apple.com/audiobook/id6806968204",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGVhoWDM",
  },
  "fire-in-the-night": {
    appleBooks: "https://books.apple.com/audiobook/id6807030209",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAG1jeWIM",
  },
  "framed-in-monte-carlo": {
    appleBooks: "https://books.apple.com/audiobook/id6803190215",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGSDUIIM",
  },
  "hope-deferred": {
    appleBooks: "https://books.apple.com/audiobook/id6805797792",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGijHKJM",
  },
  "hope-on-the-plains": {
    appleBooks: "https://books.apple.com/audiobook/id6805445100",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGMjVyIM",
  },
  "i-am-the-storm": {
    appleBooks: "https://books.apple.com/audiobook/id6803186436",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGiHnIbM",
  },
  "i-will": {
    appleBooks: "https://books.apple.com/audiobook/id6803186629",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGCHpIbM",
  },
  "imperfect-solo": {
    appleBooks: "https://books.apple.com/audiobook/id6803185902",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGCEZIUM",
  },
  innovators: {
    appleBooks: "https://books.apple.com/audiobook/id6803186118",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGCGdIcM",
  },
  "judgment-in-berlin": {
    appleBooks: "https://books.apple.com/audiobook/id6803186317",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGiEXIUM",
  },
  "killing-kennedy": {
    appleBooks: "https://books.apple.com/audiobook/id6803185421",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGCGZIcM",
  },
  "lincoln-and-the-irish": {
    appleBooks: "https://books.apple.com/audiobook/id6803188710",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGCEdIUM",
  },
  "little-book-of-restorative-teaching-tools": {
    appleBooks: "https://books.apple.com/audiobook/id6805798949",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGCjJKJM",
  },
  "love-in-unlikely-places": {
    appleBooks: "https://books.apple.com/audiobook/id6806972733",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGFh1WCM",
  },
  "mala-vida": {
    appleBooks: "https://books.apple.com/audiobook/id6803188956",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGCFpITM",
  },
  "napoleon-a-biography": {
    appleBooks: "https://books.apple.com/audiobook/id6803191269",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGiFnITM",
  },
  "nine-scorpions-in-a-bottle": {
    appleBooks: "https://books.apple.com/audiobook/id6803188381",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGCCdIMM",
  },
  "people-of-the-first-crusade": {
    appleBooks: "https://books.apple.com/audiobook/id6805799283",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGCntKbM",
  },
  "pigs-of-paradise": {
    appleBooks: "https://books.apple.com/audiobook/id6806967819",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGlnnWbM",
  },
  "political-assassinations-and-attempts-in-us-history": {
    appleBooks: "https://books.apple.com/audiobook/id6802661638",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGIFFgRM",
  },
  "real-irish-new-york": {
    appleBooks: "https://books.apple.com/audiobook/id6805800252",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAG8lWyQM",
  },
  "return-from-siberia": {
    appleBooks: "https://books.apple.com/audiobook/id6806969264",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGljnWLM",
  },
  "running-around-and-such": {
    appleBooks: "https://books.apple.com/audiobook/id6806969830",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAG1kSWUM",
  },
  "sky-ranch": {
    appleBooks: "https://books.apple.com/audiobook/id6806968725",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAG1g-WGM",
  },
  "the-generals-cook": {
    appleBooks: "https://books.apple.com/audiobook/id6803187026",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGiDnILM",
  },
  "the-golden-age-of-pirates": {
    appleBooks: "https://books.apple.com/audiobook/id6803189726",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGSFAIRM",
  },
  "the-homestead": {
    appleBooks: "https://books.apple.com/audiobook/id6805798312",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGSnwKaM",
  },
  "the-last-imperialist": {
    appleBooks: "https://books.apple.com/audiobook/id6802661323",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGoDDgJM",
  },
  "the-pasha-of-cuisine": {
    appleBooks: "https://books.apple.com/audiobook/id6805799582",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAG8nWyYM",
  },
  "the-truth-about-the-oj-simpson-trial": {
    appleBooks: "https://books.apple.com/audiobook/id6807028255",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAG1k-WWM",
  },
  "the-young-hitler-i-knew": {
    appleBooks: "https://books.apple.com/audiobook/id6807029746",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGVioWPM",
  },
  "we-the-women": {
    appleBooks: "https://books.apple.com/audiobook/id6806972156",
    googlePlay: "https://play.google.com/store/audiobooks/details?id=AQAAAEAGVmoWfM",
  },
};
