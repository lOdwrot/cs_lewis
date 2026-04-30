import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { JourneyCard } from "@/features/journeys/JourneyCard";
import { useFetch } from "@/hooks/useFetch";
import { getGate } from "@/services/gates.service";
import type { Difficulty } from "@/types/strapi";
import styles from "./GateDetail.module.scss";

const DIFFICULTY_FILTERS: { value: Difficulty; label: string; icon: string }[] =
  [
    { value: "easy", label: "Łatwa", icon: "eco" },
    { value: "medium", label: "Średnia", icon: "bolt" },
    { value: "hard", label: "Trudna", icon: "local_fire_department" },
  ];

const gridVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 90, rotateX: 28, scale: 0.88 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 160,
      damping: 18,
      mass: 0.9,
    },
  },
};

export function GateDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: gate, loading } = useFetch(() => getGate(slug!), [slug]);
  const [activeFilter, setActiveFilter] = useState<Difficulty | null>(null);

  const journeys = gate?.journeys ?? [];
  const filteredJourneys = activeFilter
    ? journeys.filter((j) => j.difficulty === activeFilter)
    : journeys;

  return (
    <PageTransition>
      <main className={styles.page}>
        <Link to="/" className={styles.backLink}>
          <span className="material-symbols-outlined">arrow_back</span>
          Wielki Portal
        </Link>

        {loading || !gate ? (
          <div
            style={{
              textAlign: "center",
              paddingTop: "4rem",
              color: "#7f7663",
            }}
          >
            Ładowanie…
          </div>
        ) : (
          <>
            <section className={styles.hero}>
              <motion.span
                className={styles.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                Brama
              </motion.span>
              <motion.h1
                className={styles.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
              >
                {gate.title}
              </motion.h1>
              {gate.description && (
                <motion.p
                  className={styles.description}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.15 }}
                >
                  {gate.description}
                </motion.p>
              )}
              <div className={styles.divider} />
            </section>

            <div className={styles.filterBar}>
              <span className={styles.filterLabel}>
                Filtruj po poziomie trudności przygody
              </span>
              {DIFFICULTY_FILTERS.map((f) => (
                <button
                  key={f.value}
                  className={`${styles.filterTag} ${styles[f.value]} ${activeFilter === f.value ? styles.active : ""}`}
                  onClick={() =>
                    setActiveFilter(activeFilter === f.value ? null : f.value)
                  }
                  type="button"
                >
                  <span className="material-symbols-outlined">{f.icon}</span>
                  {f.label}
                </button>
              ))}
            </div>

            <motion.div
              className={styles.grid}
              style={{ perspective: 1200 }}
              variants={gridVariants}
              initial="hidden"
              animate="show"
            >
              {filteredJourneys.map((journey) => (
                <motion.div
                  key={journey.id}
                  variants={cardVariants}
                  style={{ transformOrigin: "bottom center" }}
                >
                  <JourneyCard journey={journey} />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </main>
    </PageTransition>
  );
}
