import FullWorldMap from "@/components/publishing/FullWorldMap";
import styles from "./publications.module.css";

// All 46 titles returned by Azalea's PublishDrive account were checked on
// 2026-10-07: saleTerritory is ["ALL"] and these nine channels are enabled.
// This is a distribution setting, not confirmation of every store listing.
// Spotify is distributed separately.
const PLATFORMS = [
  "Apple Books",
  "Google Play Books",
  "Kobo",
  "Spotify",
  "OverDrive",
  "Bookmate",
  "ODILO",
  "Storytel",
  "Wehear",
  "Voxa",
];

export default function DistributionSection() {
  return (
    <section className={styles.distribution} aria-labelledby="distribution-title">
      <div className={styles.distributionHeading}>
        <p className={styles.eyebrow}>Stories without borders</p>
        <h2 id="distribution-title">Global distribution.</h2>
        <p className={styles.distributionIntro}>
          Our audiobooks are set for worldwide distribution through leading
          retail, streaming, and library partners.
        </p>
      </div>

      <div className={styles.distributionGrid}>
        <div className={styles.markets}>
          <FullWorldMap className={styles.publicationsMap} />
        </div>

        <div className={styles.platforms}>
          <h3 className={styles.eyebrow}>Our distribution partners</h3>
          <ul className={styles.platformList}>
            {PLATFORMS.map((platform) => (
              <li key={platform}>{platform}</li>
            ))}
          </ul>
          <p className={styles.distributionNote}>and more</p>
        </div>
      </div>
    </section>
  );
}
