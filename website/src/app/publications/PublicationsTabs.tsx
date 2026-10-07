"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import styles from "./publications.module.css";

const TABS = [
  { id: "books", label: "Books" },
  { id: "network", label: "Publication network" },
] as const;

export default function PublicationsTabs({
  books,
  network,
}: {
  books: ReactNode;
  network: ReactNode;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = (index + 1) % TABS.length;
        break;
      case "ArrowLeft":
        next = (index - 1 + TABS.length) % TABS.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = TABS.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setActiveTab(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <div className={styles.tabs}>
      <div className={styles.tabList} role="tablist" aria-label="Publications">
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            id={`publications-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`publications-panel-${tab.id}`}
            tabIndex={activeTab === index ? 0 : -1}
            className={styles.tab}
            onClick={() => setActiveTab(index)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {TABS.map((tab, index) => (
        <div
          key={tab.id}
          id={`publications-panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`publications-tab-${tab.id}`}
          tabIndex={0}
          hidden={activeTab !== index}
          className={styles.tabPanel}
        >
          {tab.id === "books" ? books : network}
        </div>
      ))}
    </div>
  );
}
