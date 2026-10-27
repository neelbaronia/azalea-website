"use client";

import { useId, useState, type CSSProperties } from "react";
import { RotateCcw } from "lucide-react";
import { createBotanicalOrnament, flowerCenters } from "./botanical-geometry";
import styles from "./ornamental.module.css";

const vines = createBotanicalOrnament();
const delayStyle = (seconds: number) =>
  ({ "--grow-delay": `${seconds}s` }) as CSSProperties;

const headingCopy = {
  chapters: {
    label: "One more chapter. No more limits.",
    initial: "O",
    opening: "ne more",
    accent: "chapter.",
  },
  unlimited: {
    label: "Unlimited audiobooks.",
    initial: "U",
    opening: "nlimited",
    accent: "audiobooks.",
  },
  catalog: {
    label: "Explore the catalog",
    initial: "E",
    opening: "xplore the",
    accent: "catalog",
  },
} as const;

export default function OrnamentalHeading({
  variant = "chapters",
  replayable = true,
  className = "",
}: {
  variant?: "chapters" | "unlimited" | "catalog";
  replayable?: boolean;
  className?: string;
}) {
  const [edition, setEdition] = useState(0);
  const patternId = `ornament-hatch-${useId().replaceAll(":", "")}`;
  const copy = headingCopy[variant];
  const Heading = variant === "catalog" ? "h2" : "h1";

  return (
    <div className={`${styles.headingBlock} ${className}`}>
      <Heading
        id={variant === "catalog" ? "bookshelf-title" : "unlimited-title"}
        className={styles.heading}
      >
        <span className={styles.srOnly}>{copy.label}</span>
        <span
          className={styles.titleComposition}
          aria-hidden="true"
          data-ornamental-part="composition"
        >
          <span className={styles.initial} data-ornamental-part="initial">
            <svg
              key={edition}
              viewBox="0 0 200 216"
              focusable="false"
              aria-hidden="true"
              data-ornament-edition={edition}
              data-ornament-style="botanical"
              data-ornamental-letter={copy.initial}
            >
              <defs>
                <pattern
                  id={patternId}
                  width="5"
                  height="5"
                  patternUnits="userSpaceOnUse"
                >
                  <path d="M0 5L5 0" stroke="currentColor" strokeWidth=".35" />
                </pattern>
              </defs>
              <path
                className={styles.initialGround}
                d="M3 3Q100 5 197 3L196 213Q100 211 4 213Z"
              />
              <path
                className={styles.frame}
                d="M7 7Q100 9 193 7L192 209Q100 207 8 209Z M11 11L189 12L188 205L12 204Z"
              />
              <path
                className={styles.hatching}
                d="M14 14H186V202H14Z"
                fill={`url(#${patternId})`}
              />
              <g className={styles.botany}>
                {vines.map((vine, index) => (
                  <g key={index}>
                    <path
                      className={styles.vine}
                      d={vine.path}
                      pathLength={1}
                      style={delayStyle(vine.delay)}
                    />
                    {vine.leaves.map((leaf, leafIndex) => (
                      <g
                        key={leafIndex}
                        transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})`}
                      >
                        <g
                          className={styles.leaf}
                          style={delayStyle(leaf.delay)}
                        >
                          <path d={leaf.path} />
                          <path d={leaf.vein} className={styles.leafVein} />
                        </g>
                      </g>
                    ))}
                  </g>
                ))}
                {flowerCenters.map(([x, y], index) => (
                  <g key={index} transform={`translate(${x} ${y})`}>
                    <g
                      className={styles.flower}
                      style={delayStyle(1.55 + index * 0.1)}
                    >
                      {Array.from({ length: 6 }, (_, petal) => (
                        <path
                          key={petal}
                          transform={`rotate(${petal * 60})`}
                          d="M0 0C-7 -2 -7 -10 0 -12C7 -10 7 -2 0 0Z"
                        />
                      ))}
                      <circle r="3.1" />
                      <circle r="1" />
                    </g>
                  </g>
                ))}
              </g>
              <text
                className={styles.initialLetter}
                x="100"
                y="168"
                textAnchor="middle"
              >
                {copy.initial}
              </text>
              <path className={styles.gildedRule} d="M18 196Q100 202 183 196" />
            </svg>
          </span>
          <span className={styles.openingWords} data-ornamental-part="words">
            <span>{copy.opening}</span>
            <em>{copy.accent}</em>
          </span>
          {variant === "chapters" ? (
            <span className={styles.closingWords}>No more limits.</span>
          ) : null}
        </span>
      </Heading>
      {replayable ? (
        <button
          className={styles.replay}
          onClick={() => setEdition((current) => current + 1)}
          type="button"
          aria-label="Replay the decorative lettering"
        >
          <RotateCcw size={11} aria-hidden="true" /> Replay the ornament
        </button>
      ) : null}
    </div>
  );
}
