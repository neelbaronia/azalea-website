import DialHero from "@/components/dial/DialHero";
import SiteFooter from "@/components/SiteFooter";
import styles from "./home.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <section
        className={styles.dialHero}
        aria-label="Azalea Labs in languages from around the world"
      >
        <div className={styles.dialFrame}>
          <DialHero />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
