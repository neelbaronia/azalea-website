export interface RetailerLinks {
  appleBooks?: string;
  googlePlay?: string;
}

export interface EbookLinks {
  appleBooks?: string;
  googlePlayBooks?: string;
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

// Ebook editions verified against Apple Books and Google Play Books listings.
export const ebookLinksByBookId: Record<string, EbookLinks> = {
  "a-horse-for-elsie": {
    appleBooks: "https://books.apple.com/us/book/a-horse-for-elsie/id1448366204",
    googlePlayBooks: "https://play.google.com/store/books/details?id=lTGCDwAAQBAJ",
  },
  "becky-meets-her-match": {
    appleBooks: "https://books.apple.com/us/book/becky-meets-her-match/id1448474991",
    googlePlayBooks: "https://play.google.com/store/books/details?id=WF6CDwAAQBAJ",
  },
  "fire-in-the-night": {
    appleBooks: "https://books.apple.com/us/book/fire-in-the-night/id1448472101",
    googlePlayBooks: "https://play.google.com/store/books/details?id=8F2CDwAAQBAJ",
  },
  "framed-in-monte-carlo": {
    appleBooks: "https://books.apple.com/us/book/framed-in-monte-carlo/id1472010486",
    googlePlayBooks: "https://play.google.com/store/books/details?id=ilKhDwAAQBAJ",
  },
  "hope-deferred": {
    appleBooks: "https://books.apple.com/us/book/hope-deferred/id1477851080",
    googlePlayBooks: "https://play.google.com/store/books/details?id=wlirDwAAQBAJ",
  },
  "hope-on-the-plains": {
    appleBooks: "https://books.apple.com/us/book/hope-on-the-plains/id1448475935",
    googlePlayBooks: "https://play.google.com/store/books/details?id=Dl-CDwAAQBAJ",
  },
  "i-am-the-storm": {
    appleBooks: "https://books.apple.com/us/book/i-am-the-storm/id1569672875",
    googlePlayBooks: "https://play.google.com/store/books/details?id=CE4wEAAAQBAJ",
  },
  "i-will": {
    appleBooks: "https://books.apple.com/us/book/i-will/id1536426625",
    googlePlayBooks: "https://play.google.com/store/books/details?id=7tADEAAAQBAJ",
  },
  "imperfect-solo": {
    appleBooks: "https://books.apple.com/us/book/imperfect-solo/id1437874532",
    googlePlayBooks: "https://play.google.com/store/books/details?id=HjgxDwAAQBAJ",
  },
  innovators: {
    appleBooks: "https://books.apple.com/us/book/innovators/id6445637639",
    googlePlayBooks: "https://play.google.com/store/books/details?id=3lmsEAAAQBAJ",
  },
  "judgment-in-berlin": {
    appleBooks: "https://books.apple.com/us/book/judgment-in-berlin/id1498464215",
    googlePlayBooks: "https://play.google.com/store/books/details?id=d1nPDwAAQBAJ",
  },
  "killing-kennedy": {
    appleBooks: "https://books.apple.com/us/book/killing-kennedy/id6442980921",
    googlePlayBooks: "https://play.google.com/store/books/details?id=4O10EAAAQBAJ",
  },
  "lincoln-and-the-irish": {
    appleBooks: "https://books.apple.com/us/book/lincoln-and-the-irish/id1448516264",
    googlePlayBooks: "https://play.google.com/store/books/details?id=0miCDwAAQBAJ",
  },
  "little-book-of-restorative-teaching-tools": {
    appleBooks: "https://books.apple.com/us/book/the-little-book-of-restorative-teaching-tools/id1470995686",
    googlePlayBooks: "https://play.google.com/store/books/details?id=WHagDwAAQBAJ",
  },
  "love-in-unlikely-places": {
    appleBooks: "https://books.apple.com/us/book/love-in-unlikely-places/id1489974511",
    googlePlayBooks: "https://play.google.com/store/books/details?id=UnjBDwAAQBAJ",
  },
  "mala-vida": {
    appleBooks: "https://books.apple.com/us/book/mala-vida/id1437872200",
    googlePlayBooks: "https://play.google.com/store/books/details?id=1_FwDwAAQBAJ",
  },
  "napoleon-a-biography": {
    googlePlayBooks: "https://play.google.com/store/books/details?id=rBZHUpiHRpUC",
  },
  "people-of-the-first-crusade": {
    appleBooks: "https://books.apple.com/us/book/people-of-the-first-crusade/id1448330357",
    googlePlayBooks: "https://play.google.com/store/books/details?id=7DuCDwAAQBAJ",
  },
  "pigs-of-paradise": {
    appleBooks: "https://books.apple.com/us/book/pigs-of-paradise/id1448577481",
    googlePlayBooks: "https://play.google.com/store/books/details?id=FGmCDwAAQBAJ",
  },
  "political-assassinations-and-attempts-in-us-history": {
    appleBooks: "https://books.apple.com/us/book/political-assassinations-and-attempts-in-us-history/id1516409609",
    googlePlayBooks: "https://play.google.com/store/books/details?id=7UjEDgAAQBAJ",
  },
  "real-irish-new-york": {
    appleBooks: "https://books.apple.com/us/book/real-irish-new-york/id1457916377",
  },
  "return-from-siberia": {
    appleBooks: "https://books.apple.com/us/book/return-from-siberia/id1518585900",
    googlePlayBooks: "https://play.google.com/store/books/details?id=EH_rDwAAQBAJ",
  },
  "running-around-and-such": {
    appleBooks: "https://books.apple.com/us/book/running-around-and-such/id1448480644",
    googlePlayBooks: "https://play.google.com/store/books/details?id=_l2CDwAAQBAJ",
  },
  "sky-ranch": {
    appleBooks: "https://books.apple.com/us/book/sky-ranch/id1472010037",
    googlePlayBooks: "https://play.google.com/store/books/details?id=BFChDwAAQBAJ",
  },
  "the-generals-cook": {
    appleBooks: "https://books.apple.com/us/book/the-generals-cook/id1448349753",
    googlePlayBooks: "https://play.google.com/store/books/details?id=AhV1EAAAQBAJ",
  },
  "the-golden-age-of-pirates": {
    appleBooks: "https://books.apple.com/us/book/the-golden-age-of-piracy/id1448324062",
    googlePlayBooks: "https://play.google.com/store/books/details?id=yTWCDwAAQBAJ",
  },
  "the-homestead": {
    appleBooks: "https://books.apple.com/us/book/the-homestead/id1448472485",
    googlePlayBooks: "https://play.google.com/store/books/details?id=el6CDwAAQBAJ",
  },
  "the-last-imperialist": {
    appleBooks: "https://books.apple.com/us/book/the-last-imperialist/id1566891394",
    googlePlayBooks: "https://play.google.com/store/books/details?id=H3QjEAAAQBAJ",
  },
  "the-pasha-of-cuisine": {
    appleBooks: "https://books.apple.com/us/book/the-pasha-of-cuisine/id1448336686",
    googlePlayBooks: "https://play.google.com/store/books/details?id=ET2CDwAAQBAJ",
  },
  "the-truth-about-the-oj-simpson-trial": {
    appleBooks: "https://books.apple.com/us/book/the-truth-about-the-o-j-simpson-trial/id1536425401",
    googlePlayBooks: "https://play.google.com/store/books/details?id=xesDEAAAQBAJ",
  },
  "the-young-hitler-i-knew": {
    appleBooks: "https://books.apple.com/us/book/the-young-hitler-i-knew/id1525225021",
    googlePlayBooks: "https://play.google.com/store/books/details?id=uRn2DwAAQBAJ",
  },
  "kremlin-wives": {
    appleBooks: "https://books.apple.com/us/book/kremlin-wives/id1516414396",
    googlePlayBooks: "https://play.google.com/store/books/details?id=sTKGCgAAQBAJ",
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
