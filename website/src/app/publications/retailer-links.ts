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

export const overdriveLinksByBookId: Record<string, string> = {
  "a-horse-for-elsie": "https://www.overdrive.com/media/13531009",
  "becky-meets-her-match": "https://www.overdrive.com/media/13553057",
  "fire-in-the-night": "https://www.overdrive.com/media/13553087",
  "framed-in-monte-carlo": "https://www.overdrive.com/media/13531004",
  "home-is-where-the-heart-is": "https://www.overdrive.com/media/13553102",
  "hope-deferred": "https://www.overdrive.com/media/13553120",
  "hope-on-the-plains": "https://www.overdrive.com/media/13553084",
  "i-am-the-storm": "https://www.overdrive.com/media/13531020",
  "i-will": "https://www.overdrive.com/media/13531032",
  "imperfect-solo": "https://www.overdrive.com/media/13530961",
  innovators: "https://www.overdrive.com/media/13530989",
  "judgment-in-berlin": "https://www.overdrive.com/media/13530962",
  "killing-kennedy": "https://www.overdrive.com/media/13530985",
  "lincoln-and-the-irish": "https://www.overdrive.com/media/13531010",
  "little-book-of-restorative-teaching-tools": "https://www.overdrive.com/media/13553071",
  "love-in-unlikely-places": "https://www.overdrive.com/media/13553095",
  "mala-vida": "https://www.overdrive.com/media/13530976",
  "napoleon-a-biography": "https://www.overdrive.com/media/13530960",
  "nine-scorpions-in-a-bottle": "https://www.overdrive.com/media/13530952",
  "people-of-the-first-crusade": "https://www.overdrive.com/media/13553063",
  "pigs-of-paradise": "https://www.overdrive.com/media/13553118",
  "political-assassinations-and-attempts-in-us-history": "https://www.overdrive.com/media/13530950",
  "real-irish-new-york": "https://www.overdrive.com/media/13553061",
  "return-from-siberia": "https://www.overdrive.com/media/13553105",
  "running-around-and-such": "https://www.overdrive.com/media/13553085",
  "sky-ranch": "https://www.overdrive.com/media/13553069",
  "the-generals-cook": "https://www.overdrive.com/media/13530972",
  "the-golden-age-of-pirates": "https://www.overdrive.com/media/13530947",
  "the-homestead": "https://www.overdrive.com/media/13553096",
  "the-last-imperialist": "https://www.overdrive.com/media/13530984",
  "the-pasha-of-cuisine": "https://www.overdrive.com/media/13553091",
  "the-truth-about-the-oj-simpson-trial": "https://www.overdrive.com/media/13553077",
  "the-young-hitler-i-knew": "https://www.overdrive.com/media/13553110",
  "we-the-women": "https://www.overdrive.com/media/13553060",
};
