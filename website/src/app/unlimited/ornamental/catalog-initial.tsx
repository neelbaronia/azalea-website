import styles from "./catalog-initial.module.css";

const cartouche =
  "M38 8H162C164 23 178 30 192 32V184C177 186 166 197 162 208H38C34 195 22 186 8 184V32C23 30 35 21 38 8Z";

/** Original copperplate-inspired E: a cut-paper cartouche and pen flourishes. */
export default function CatalogInitial({
  edition,
  patternId,
}: {
  edition: number;
  patternId: string;
}) {
  return (
    <svg
      className={styles.ornament}
      viewBox="0 0 200 216"
      focusable="false"
      aria-hidden="true"
      data-ornament-edition={edition}
      data-ornament-style="copperplate"
      data-ornamental-letter="E"
    >
      <defs>
        <pattern
          id={patternId}
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
        >
          <circle className={styles.grain} cx="1" cy="1" r=".55" />
        </pattern>
      </defs>
      <path className={styles.paper} d={cartouche} />
      <path d={cartouche} fill={`url(#${patternId})`} />
      <path
        className={styles.innerFrame}
        d="M41 17H159C164 29 174 36 183 39V177C170 180 162 190 158 199H42C38 190 28 180 17 177V39C29 35 37 27 41 17Z"
      />
      <g className={styles.flourishes}>
        <path
          pathLength={1}
          d="M33 64C15 57 17 37 31 35C45 33 55 52 42 58C32 62 24 49 32 45C41 40 52 50 55 61"
        />
        <path
          pathLength={1}
          d="M147 47C164 29 185 37 176 49C168 60 152 49 160 42C169 36 183 50 177 64"
        />
        <path
          pathLength={1}
          d="M27 164C12 174 24 196 45 185C59 178 54 166 44 172C35 178 48 191 68 186"
        />
        <path
          pathLength={1}
          d="M145 164C161 148 184 156 174 169C166 179 151 166 160 161C175 153 189 180 166 188"
        />
      </g>
      <path
        className={styles.letter}
        data-catalog-letter
        d="M150 44C132 22 84 27 60 48C37 67 37 96 72 108C40 117 24 143 37 167C54 201 110 192 149 162L143 151C113 177 68 182 55 160C43 138 72 116 110 116L119 102C86 113 51 94 60 70C70 46 119 34 139 55Z"
      />
      <path
        className={styles.hairline}
        d="M62 67C73 43 117 34 138 49M52 143C51 160 65 169 82 170"
      />
      <g className={styles.diamonds}>
        <path d="M100 17L103 21L100 25L97 21Z" />
        <path d="M100 192L103 196L100 200L97 196Z" />
      </g>
    </svg>
  );
}
