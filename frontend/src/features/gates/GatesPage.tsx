import { motion } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { SEO } from "@/components/SEO";
import { GatesGrid } from "./GatesGrid";
import { useGatesQuery } from "@/hooks/queries";
import styles from "./GatesPage.module.scss";

export function GatesPage() {
  const { data: gates, isLoading } = useGatesQuery();

  return (
    <PageTransition>
      <SEO
        title="Wielki Portal"
        description="Odkryj myśl C.S. Lewisa przez interaktywne podróże przez Wyobraźnię, Rozum i Wiarę. Eseje, podcasty i quizy."
        path="/portal"
      />
      <main className={styles.page}>
        <img
          src="/open_book.png"
          alt=""
          aria-hidden="true"
          className={styles.bookBackdrop}
        />
        {/* Hero */}
        <section className={styles.hero}>
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Wielki Portal
          </motion.h1>
          <motion.div
            className={styles.heroDivider}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </section>

        {/* Section label */}
        <motion.p
          className={styles.sectionLabel}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
        >
          Wybierz Swoją Drogę
        </motion.p>

        <GatesGrid gates={gates} loading={isLoading} />
      </main>
    </PageTransition>
  );
}
