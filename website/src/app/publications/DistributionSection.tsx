import FullWorldMap from "@/components/publishing/FullWorldMap";
import styles from "./publications.module.css";

// All 46 titles returned by Azalea's PublishDrive account were checked on
// 2026-10-07: saleTerritory is ["ALL"] and these nine channels are enabled.
// This is a distribution setting, not confirmation of every store listing.
// The 41 enabled-store names deduplicate to 29 platform families; Spotify is
// separate, for 30 unique platforms total. Format/brand variants (e.g. Apple,
// Google Play, and Kobo) are counted once.
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
const UNIQUE_PLATFORM_COUNT = 30;
const ADDITIONAL_PLATFORM_COUNT = UNIQUE_PLATFORM_COUNT - PLATFORMS.length;

export default function DistributionSection() {
  return (
    <section className={styles.distribution} aria-labelledby="distribution-title">
      <div className={styles.distributionHeading}>
        <p className={styles.eyebrow}>Stories without borders</p>
        <h2 id="distribution-title">Global distribution.</h2>
        <p className={styles.distributionIntro}>
          Our audiobooks are set for worldwide distribution through leading
          partners. The map shows every country with Spotify listener activity
          in our available analytics history through October 2026.
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
          <p className={styles.distributionNote}>
            and {ADDITIONAL_PLATFORM_COUNT} more platforms
          </p>
        </div>
      </div>
    </section>
  );
}
