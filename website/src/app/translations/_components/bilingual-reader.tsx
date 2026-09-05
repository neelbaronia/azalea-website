"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Info, MousePointerClick } from "lucide-react";
import { getLanguageTheme, getSample, samples } from "./sample-catalog";
import type { SentencePair } from "./text-sample";

const TARGET_WORDS_PER_PAGE = 220;
const MIN_PAIRS_PER_SPREAD = 1;
const MAX_PAIRS_PER_SPREAD = 16;

type IndexedPair = {
  pair: SentencePair;
  index: number;
};

function countWords(text: string) {
  return text.trim().split(/\s+/u).filter(Boolean).length;
}

function paginatePairs(pairs: SentencePair[]): IndexedPair[][] {
  const spreads: IndexedPair[][] = [];
  let spread: IndexedPair[] = [];
  let wordCount = 0;

  pairs.forEach((pair, index) => {
    const pairWordCount = countWords(pair.original);
    const pageIsFull =
      spread.length >= MAX_PAIRS_PER_SPREAD ||
      (spread.length >= MIN_PAIRS_PER_SPREAD
        && Math.abs(TARGET_WORDS_PER_PAGE - wordCount)
          <= Math.abs(TARGET_WORDS_PER_PAGE - (wordCount + pairWordCount)));

    if (pageIsFull) {
      spreads.push(spread);
      spread = [];
      wordCount = 0;
    }

    spread.push({ pair, index });
    wordCount += pairWordCount;
  });

  if (spread.length) spreads.push(spread);
  return spreads;
}

export function BilingualReader({ initialSampleId }: { initialSampleId: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentSpread, setCurrentSpread] = useState(0);
  const ticking = useRef(false);
  const activeSample = getSample(initialSampleId) ?? samples[0];
  const languageTheme = getLanguageTheme(activeSample.languageCode);
  const readerStyle = {
    "--accent": languageTheme.accent,
    "--accent-soft": languageTheme.accentSoft,
    "--accent-ink": languageTheme.accentInk,
    "--highlight": languageTheme.highlight,
    "--highlight-edge": languageTheme.accent,
  } as CSSProperties;
  const activePairs = activeSample.pairs;
  const spreads = useMemo(() => paginatePairs(activePairs), [activePairs]);
  const storySpreadCount = spreads.length;
  const totalSpreads = Math.max(1, storySpreadCount + 1);

  const findActiveSentence = useCallback(() => {
    const pairs = Array.from(document.querySelectorAll<HTMLElement>("[data-sentence-pair]"));
    if (!pairs.length) {
      ticking.current = false;
      return;
    }

    const readingLine = window.innerHeight * 0.54;
    let nearest = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    pairs.forEach((pair) => {
      const rect = pair.getBoundingClientRect();
      const distance = Math.abs(rect.top + rect.height / 2 - readingLine);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = Number(pair.dataset.sentencePair ?? 0);
      }
    });

    setActiveIndex(nearest);
    ticking.current = false;
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(findActiveSentence);
    };

    findActiveSentence();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [findActiveSentence]);

  const goTo = useCallback((index: number) => {
    const next = Math.max(0, Math.min(activePairs.length - 1, index));
    const nextSpread = Math.max(0, spreads.findIndex((spread) => spread.some((entry) => entry.index === next))) + 1;
    setActiveIndex(next);
    setCurrentSpread(nextSpread);
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-sentence-pair="${next}"]`)?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "center",
      });
    });
  }, [activePairs.length, spreads]);

  const turnToSpread = useCallback((spread: number) => {
    const nextSpread = Math.max(0, Math.min(totalSpreads - 1, spread));
    setCurrentSpread(nextSpread);
    if (nextSpread > 0) setActiveIndex(spreads[nextSpread - 1]?.[0]?.index ?? 0);
    window.requestAnimationFrame(() => {
      document.getElementById("reading-spread")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    });
  }, [spreads, totalSpreads]);

  useEffect(() => {
    const handlePageKeys = (event: globalThis.KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement) return;
      if (event.key === "ArrowLeft") turnToSpread(currentSpread - 1);
      if (event.key === "ArrowRight") turnToSpread(currentSpread + 1);
    };

    window.addEventListener("keydown", handlePageKeys);
    return () => window.removeEventListener("keydown", handlePageKeys);
  }, [currentSpread, turnToSpread]);

  const activateWithKeyboard = (event: KeyboardEvent<HTMLElement>, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      goTo(index);
    }
  };

  const storySpreadIndex = currentSpread - 1;
  const visibleSpread = currentSpread > 0 ? spreads[storySpreadIndex] : undefined;

  return (
    <main className="reader-shell" style={readerStyle}>
      <header className="reader-bar">
        <Link className="brand" href="/translations" aria-label="Return to the Azalea Labs translation sample library">
          <span className="brand-mark"><img src="/azalea-icon.webp" alt="" /></span>
          <span>AZALEA LABS</span>
        </Link>

        <div className="document-meta" aria-label="Work details">
          <div className="title-meta">
            <span>Original title</span>
            <strong>
              <a href={activeSample.sourceUrl} target="_blank" rel="noreferrer">
                {activeSample.originalTitle}<ExternalLink aria-hidden="true" />
              </a>
            </strong>
          </div>
          <div>
            <span>Original author</span>
            <strong>{activeSample.author}</strong>
          </div>
          <div>
            <span>Language</span>
            <strong>{activeSample.language}</strong>
          </div>
          <div>
            <span>Translator</span>
            <strong>
              <a href={activeSample.translatorBioUrl} target="_blank" rel="noreferrer">
                {activeSample.translator}<ExternalLink aria-hidden="true" />
              </a>
            </strong>
          </div>
          <div className="title-meta translated-meta">
            <span>English title / author</span>
            <strong>{activeSample.translatedTitle} · {activeSample.englishAuthor}</strong>
          </div>
        </div>

        <div className="spread-actions">
          <nav className="spread-controls" aria-label="Move between page spreads">
            <button type="button" onClick={() => turnToSpread(currentSpread - 1)} disabled={currentSpread === 0} aria-label="Previous spread">
              <ArrowLeft aria-hidden="true" />
            </button>
            <span><strong>{currentSpread + 1}</strong><i>/</i>{totalSpreads}</span>
            <button type="button" onClick={() => turnToSpread(currentSpread + 1)} disabled={currentSpread === totalSpreads - 1} aria-label="Next spread">
              <ArrowRight aria-hidden="true" />
            </button>
          </nav>

          <div className="navigation-guide">
            <button type="button" className="navigation-guide-trigger" aria-label="How to turn pages" aria-describedby="navigation-guide-tip">
              <Info aria-hidden="true" />
            </button>
            <div className="navigation-guide-tip" id="navigation-guide-tip" role="tooltip">
              <strong>Turn the page</strong>
              <div><MousePointerClick aria-hidden="true" /><span>Click a page edge</span></div>
              <div><span className="key-pair"><kbd>←</kbd><kbd>→</kbd></span><span>Use arrow keys</span></div>
            </div>
          </div>
        </div>
      </header>

      <section className="book-wrap" id="reading-spread">
        {activePairs.length > 0 && currentSpread === 0 && (
          <article className="book title-book" aria-label="Bilingual title pages">
            <div className="title-spread">
              <div className="title-page left-page">
                <div className="running-head"><span>{activeSample.source}</span><span>{activeSample.language}</span></div>
                <div className="title-lockup">
                  <span className="ornament">✦</span>
                  <h2>{activeSample.originalTitle}</h2>
                  <p>By {activeSample.author}</p>
                </div>
              </div>
              <div className="title-page right-page">
                <div className="running-head"><span>ENGLISH TRANSLATION</span><span>AZALEA</span></div>
                <div className="title-lockup">
                  <span className="ornament">✦</span>
                  <h2>{activeSample.translatedTitle ?? "Translation sample"}</h2>
                  <p>Translated by {activeSample.translator}</p>
                </div>
              </div>
            </div>
          </article>
        )}

        {visibleSpread && (
          <article
            className={`book story-book ${storySpreadIndex === 0 ? "opening-page" : ""}`}
            aria-label={`Side-by-side ${activeSample.language} and English story excerpt, spread ${storySpreadIndex + 1}`}
            key={`spread-${storySpreadIndex}`}
            onMouseLeave={findActiveSentence}
          >
            <div className="story-spread">
              <div className="page-label left-label"><span>{activeSample.author}</span><strong>{activeSample.originalTitle}</strong></div>
              <div className="page-label right-label"><strong>{activeSample.translatedTitle ?? activeSample.originalTitle}</strong><span>{activeSample.translator}</span></div>

              <div className="sentence-list">
                {visibleSpread.map(({ pair, index }) => {
                  const opening = index === 0
                    ? pair.original.match(/^([„»«“"]\s*)(\p{L})/u)
                    : null;
                  return (
                    <div
                      className={`sentence-pair ${activeIndex === index ? "is-active" : ""}`}
                      data-sentence-pair={index}
                      key={`${pair.original}-${index}`}
                      onPointerEnter={() => setActiveIndex(index)}
                    >
                      <p tabIndex={0} role="button" aria-label={`${activeSample.language} sentence ${index + 1}`} onClick={() => goTo(index)} onKeyDown={(event) => activateWithKeyboard(event, index)}>
                        <span className="sentence-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                        <span className="sentence-text" lang={activeSample.languageCode}>
                          {opening ? (
                            <>
                              <span className="opening-cluster">
                                <span className="opening-quote">{opening[1]}</span>
                                <span className="drop-letter">{opening[2]}</span>
                              </span>
                              {pair.original.slice(opening[0].length)}
                            </>
                          ) : pair.original}
                        </span>
                      </p>
                      <p tabIndex={0} role="button" aria-label={`English sentence ${index + 1}`} onClick={() => goTo(index)} onKeyDown={(event) => activateWithKeyboard(event, index)}>
                        <span className="sentence-text" lang="en">{pair.translation}</span>
                        <span className="sentence-number right-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      </p>
                    </div>
                  );
                })}
              </div>

              {storySpreadIndex === spreads.length - 1 && (
                <div className="end-mark" aria-label="End of sample">
                  <span>End of sample</span>
                  <strong>◆</strong>
                </div>
              )}

              <span className="spread-folio spread-folio-left">{storySpreadIndex * 2 + 1}</span>
              <span className="spread-folio spread-folio-right">{storySpreadIndex * 2 + 2}</span>
            </div>
          </article>
        )}

        {activePairs.length === 0 && (
          <article className="book pending-book" aria-label="Translation sample preview is being prepared">
            <div className="pending-page">
              <span className="ornament">✦</span>
              <span className="pending-kicker">Preview being prepared</span>
              <h2>{activeSample.originalTitle}</h2>
              <p>
                This commissioned work is in the library, but its side-by-side text has not yet been loaded into this local preview.
              </p>
              <Link href="/translations">Return to sample library</Link>
            </div>
          </article>
        )}

        {activePairs.length > 0 && (
          <nav className="page-edge-controls" aria-label="Turn pages from the page edges">
            <button
              type="button"
              className="page-edge-turn page-edge-turn-left"
              onClick={() => turnToSpread(currentSpread - 1)}
              disabled={currentSpread === 0}
              aria-label="Previous spread"
            >
              <ArrowLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              className="page-edge-turn page-edge-turn-right"
              onClick={() => turnToSpread(currentSpread + 1)}
              disabled={currentSpread === totalSpreads - 1}
              aria-label="Next spread"
            >
              <ArrowRight aria-hidden="true" />
            </button>
          </nav>
        )}
      </section>

    </main>
  );
}
