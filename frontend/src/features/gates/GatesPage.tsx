import { motion } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { StaggerList, StaggerItem } from "@/components/animations/StaggerList";
import { FadeInView } from "@/components/animations/FadeInView";
import { GateCard } from "./GateCard";
import { useFetch } from "@/hooks/useFetch";
import { getGates } from "@/services/gates.service";
import styles from "./GatesPage.module.scss";

export function GatesPage() {
  const { data: gates, loading } = useFetch(getGates);

  return (
    <PageTransition>
      <main className={styles.page}>
        {/* Hero */}
        <section className={styles.hero}>
          <motion.span
            className={styles.heroLabel}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Granica Intelektu
          </motion.span>
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            Wybierz Swoją Bramę
          </motion.h1>
          <motion.p
            className={styles.heroDesc}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            Przekrocz próg codzienności. Odkryj głębię filozofii Inklingów
            poprzez wyjątkowe ścieżki poznania.
          </motion.p>
          <motion.div
            className={styles.heroDivider}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <span>◆</span>
          </motion.div>
        </section>

        {/* Gates Grid */}
        {loading ? (
          <div className={styles.grid}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: 320,
                  background: "rgba(212,175,55,0.06)",
                  border: "1px solid rgba(212,175,55,0.1)",
                }}
              />
            ))}
          </div>
        ) : (
          <StaggerList className={styles.grid}>
            {(gates ?? []).map((gate) => (
              <StaggerItem key={gate.id}>
                <GateCard gate={gate} />
              </StaggerItem>
            ))}
          </StaggerList>
        )}

        {/* Context section */}
        <FadeInView delay={0.2}>
          <section className={styles.contextSection}>
            <div className={styles.contextBody}>
              <span className={styles.contextLabel}>Archiwum</span>
              <h2 className={styles.contextTitle}>Wspólne Dziedzictwo</h2>
              <p className={styles.contextText}>
                Odkryj wspólną historię Inklingów w Oxfordzie — spotkania w
                Eagle and Child, czytanie niedokończonych dzieł oraz dążenie do
                &ldquo;Rzeczy Trwałych.&rdquo;
              </p>
              <a href="#" className={styles.contextLink}>
                Przeglądaj Bibliografię
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1rem" }}
                >
                  arrow_forward
                </span>
              </a>
            </div>
          </section>
        </FadeInView>
      </main>
    </PageTransition>
  );
}
