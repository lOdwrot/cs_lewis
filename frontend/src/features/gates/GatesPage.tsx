import { motion } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { GateCard } from "./GateCard";
import { useFetch } from "@/hooks/useFetch";
import { getGates } from "@/services/gates.service";
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
  const { data: gates, loading } = useFetch(getGates);

  return (
    <PageTransition>
      <main className={styles.page}>
        {/* Hero */}
        <section className={styles.hero}>
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            C.S. Lewis: Trzy Drogi do Prawdy
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
          <motion.p
            className={styles.heroBody}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.45 }}
          >
            Lewis nie oddzielał opowieści od argumentu ani argumentu od wiary.
            Uważał, że wyobraźnia przygotowuje grunt dla rozumu, rozum domaga
            się prawdy, a wiara nie niszczy żadnego z nich. Ta strona proponuje
            lekturę Lewisa właśnie w tym duchu — poprzez teksty, które prowadzą
            różnymi drogami ku tym samym pytaniom.
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
