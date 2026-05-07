import { motion } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { SEO } from "@/components/SEO";
import { GateCard } from "./GateCard";
import { GatesLoadingSkeleton } from "./GatesLoadingSkeleton";
import { useGatesQuery } from "@/hooks/queries";
import styles from "./GatesPage.module.scss";

const gridVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.22,
      delayChildren: 0.65,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 90,
    rotateX: 28,
    scale: 0.88,
  },
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

export function GatesPage() {
  const { data: gates, isLoading: loading } = useGatesQuery();

  return (
    <PageTransition>
      <SEO
        title="Wielki Portal"
        description="Odkryj myśl C.S. Lewisa przez interaktywne podróże przez Wyobraźnię, Rozum i Wiarę. Eseje, podcasty i quizy."
        path="/portal"
      />
      <main className={styles.page}>
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
          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
          >
            Eseje, analizy i komentarze ukazujące myśl C.S. Lewisa jako spójną
            całość, w której wyobraźnia, rozum i wiara wzajemnie się przenikają
          </motion.p>
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

        {/* Gates Grid */}
        {loading ? (
          <GatesLoadingSkeleton />
        ) : (
          <motion.div
            className={styles.grid}
            style={{ perspective: 1200 }}
            variants={gridVariants}
            initial="hidden"
            animate="show"
          >
            {(gates ?? []).map((gate) => (
              <motion.div key={gate.id} variants={cardVariants} style={{ transformOrigin: "bottom center" }}>
                <GateCard gate={gate} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </PageTransition>
  );
}
