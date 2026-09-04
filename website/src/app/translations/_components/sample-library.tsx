"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import { RightsNotice } from "./rights-notice";
import { getLanguageTheme, samples } from "./sample-catalog";

const uniqueValues = (field: "language" | "originalTitle" | "translator") =>
  Array.from(new Set(samples.map((sample) => sample[field])));

export function SampleLibrary() {
  const [language, setLanguage] = useState("");
  const [title, setTitle] = useState("");
  const [translator, setTranslator] = useState("");

  const visibleSamples = useMemo(
    () => samples.filter((sample) =>
      (!language || sample.language === language)
      && (!title || sample.originalTitle === title)
      && (!translator || sample.translator === translator)),
    [language, title, translator],
  );

  return (
    <main className="library-shell">
      <header className="library-bar">
        <a className="brand" href="#sample-index" aria-label="Azalea translation sample library">
          <span className="brand-mark"><img src="/azalea-icon.webp" alt="" /></span>
          <span>AZALEA</span>
        </a>
        <div className="library-identity">
          <strong>Translation samples</strong>
        </div>
      </header>

      <section className="library-content" id="sample-index">
        <RightsNotice />

        <div className="index-title-row">
          <div>
            <h1>Sample library</h1>
          </div>
        </div>

        <div className="library-filters" aria-label="Filter translation samples">
          <label className="sample-filter">
            <span>Language</span>
            <span className="select-wrap">
              <select value={language} onChange={(event) => setLanguage(event.target.value)}>
                <option value="">All languages</option>
                {uniqueValues("language").map((value) => <option key={value}>{value}</option>)}
              </select>
              <ChevronDown aria-hidden="true" />
            </span>
          </label>

          <label className="sample-filter title-filter">
            <span>Original title</span>
            <span className="select-wrap">
              <select value={title} onChange={(event) => setTitle(event.target.value)}>
                <option value="">All titles</option>
                {uniqueValues("originalTitle").map((value) => <option key={value}>{value}</option>)}
              </select>
              <ChevronDown aria-hidden="true" />
            </span>
          </label>

          <label className="sample-filter">
            <span>Translator</span>
            <span className="select-wrap">
              <select value={translator} onChange={(event) => setTranslator(event.target.value)}>
                <option value="">All translators</option>
                {uniqueValues("translator").map((value) => <option key={value}>{value}</option>)}
              </select>
              <ChevronDown aria-hidden="true" />
            </span>
          </label>
        </div>

        <div className="sample-index" aria-live="polite">
          <div className="sample-index-head" aria-hidden="true">
            <span />
            <span>Original work</span>
            <span>Language</span>
            <span>Translator</span>
            <span>Preview</span>
            <span />
          </div>

          {visibleSamples.map((sample, index) => {
            const isReady = sample.pairs.length > 0;
            const theme = getLanguageTheme(sample.languageCode);
            const rowStyle = {
              "--sample-accent": theme.accent,
              "--sample-accent-soft": theme.accentSoft,
              "--sample-accent-ink": theme.accentInk,
            } as CSSProperties;
            return (
              <Link className="sample-row" href={`/translations/${sample.id}`} key={sample.id} style={rowStyle}>
                <span className="row-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="work-cell">
                  <strong>{sample.originalTitle}</strong>
                  <small>{sample.author}</small>
                </span>
                <span className="language-cell" data-label="Language">{sample.language}</span>
                <span className="translator-cell" data-label="Translator">{sample.translator}</span>
                <span className={`status-cell ${isReady ? "is-ready" : "is-pending"}`} data-label="Preview">
                  <i aria-hidden="true" />{isReady ? "Ready to read" : "Being prepared"}
                </span>
                <span className="open-cell" aria-hidden="true"><ArrowUpRight /></span>
              </Link>
            );
          })}

          {visibleSamples.length === 0 && (
            <div className="empty-index">
              <strong>No matching samples</strong>
              <button type="button" onClick={() => { setLanguage(""); setTitle(""); setTranslator(""); }}>Clear filters</button>
            </div>
          )}
        </div>
      </section>

    </main>
  );
}
