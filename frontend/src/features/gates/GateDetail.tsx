import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { JourneyCard } from "@/features/journeys/JourneyCard";
import { useFetch } from "@/hooks/useFetch";
import { getGate } from "@/services/gates.service";
import styles from "./GateDetail.module.scss";

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
    transition: { type: "spring" as const, stiffness: 160, damping: 18, mass: 0.9 },
  },
};

export function GateDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: gate, loading } = useFetch(() => getGate(slug!), [slug]);

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

            <motion.div
              className={styles.grid}
              style={{ perspective: 1200 }}
              variants={gridVariants}
              initial="hidden"
              animate="show"
            >
              {(gate.journeys ?? []).map((journey) => (
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
