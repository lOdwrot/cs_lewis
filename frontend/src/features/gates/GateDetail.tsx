import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { PageBackdrop } from "@/components/animations/PageBackdrop";
import { SEO } from "@/components/SEO";
import { PageError } from "@/components/ui/PageError";
import { GatesLoadingSkeleton } from "./GatesLoadingSkeleton";
import { JourneyCard } from "@/features/journeys/JourneyCard";
import { useGateQuery } from "@/hooks/queries";
import { strapiImageUrl } from "@/services/api";
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
  const { data: gate, isLoading: loading, isError, refetch } = useGateQuery(slug!);

  if (isError) return <PageError onRefresh={() => refetch()} />;

  const backgroundSrc = gate?.backgroundImage
    ? strapiImageUrl(gate.backgroundImage.url)
    : null;
  const backgroundAlt = gate?.backgroundImage?.alternativeText ?? "";

  return (
    <>
      <PageBackdrop src={backgroundSrc} alt={backgroundAlt} />
      <PageTransition>
      <SEO
        title={gate ? gate.title : "Brama"}
        description={gate?.description ?? undefined}
        path={`/gate/${slug}`}
      />
      <main className={styles.page}>
        <Link to="/portal" className={styles.backLink}>
          <span className="material-symbols-outlined">arrow_back</span>
          Wielki Portal
        </Link>

        {loading || !gate ? (
          <GatesLoadingSkeleton />
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
              {(gate?.journeys ?? []).map((journey) => (
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
    </>
  );
}
