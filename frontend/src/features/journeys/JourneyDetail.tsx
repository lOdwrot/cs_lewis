import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { GatesLoadingSkeleton } from "@/features/gates/GatesLoadingSkeleton";

const stepsContainerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.4 },
  },
};

const stepCardVariants = {
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
import { useJourneyQuery } from "@/hooks/queries";
import { useProgressStore } from "@/store/progressStore";
import { strapiImageUrl } from "@/services/api";
import { SEO } from "@/components/SEO";
import type { StepType } from "@/types/strapi";
import styles from "./JourneyDetail.module.scss";

const MotionLink = motion(Link);

const TYPE_ICON: Record<StepType, string> = {
  text: "description",
  podcast: "headphones",
  quiz: "fact_check",
};

const TYPE_LABEL: Record<StepType, string> = {
  text: "Lektura",
  podcast: "Podcast",
  quiz: "Quiz Wiedzy",
};

export function JourneyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: journey, isLoading: loading } = useJourneyQuery(slug!);
  const isStepComplete = useProgressStore((s) => s.isStepComplete);

  const steps = journey?.steps ?? [];
  const allComplete =
    steps.length > 0 && steps.every((s) => isStepComplete(s.documentId));
  const totalTime = steps.reduce((sum, s) => sum + (s.estimatedTime ?? 0), 0);

  return (
    <PageTransition>
      <SEO
        title={journey?.title}
        description={journey?.description ?? undefined}
        path={`/journey/${slug}`}
      />
      <main className={styles.page}>
        <Link to={-1 as never} className={styles.backLink}>
          <span className="material-symbols-outlined">arrow_back</span>
          Powrót do Bramy
        </Link>

        {loading || !journey ? (
          <GatesLoadingSkeleton />
        ) : (
          <>
            <motion.header
              className={styles.header}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <span className={styles.headerLabel}>Podróż</span>
              <h1 className={styles.headerTitle}>{journey.title}</h1>
              {journey.description && (
                <p className={styles.headerDesc}>{journey.description}</p>
              )}
              {totalTime > 0 && (
                <div className={styles.headerTime}>
                  <span className="material-symbols-outlined">schedule</span>
                  {totalTime} min
                </div>
              )}
            </motion.header>

            <div className={styles.timeline}>
              <motion.div
                className={styles.timelineLine}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
              />

              <motion.div
                className={styles.steps}
                style={{ perspective: 1200 }}
                variants={stepsContainerVariants}
                initial="hidden"
                animate="show"
              >
                {(journey.steps ?? []).map((step, i) => {
                  const done = isStepComplete(step.documentId);
                  return (
                    <motion.div
                      key={step.id}
                      variants={stepCardVariants}
                      style={{ transformOrigin: "bottom center" }}
                    >
                      <div className={styles.stepCard}>
                        <MotionLink
                          to={`/step/${step.documentId}`}
                          className={styles.card}
                          whileHover={{
                            scale: 1.018,
                            x: 4,
                            boxShadow:
                              "-10px 0 28px rgba(212,175,55,0.22), 0 12px 40px rgba(0,0,0,0.12)",
                          }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          style={{ transformOrigin: "left center" }}
                        >
                          <div className={styles.cardInner}>
                            <div className={styles.cardBody}>
                              <div className={styles.stopBadge}>
                                <span className={styles.stopNumber}>
                                  Przystanek {String(i + 1).padStart(2, "0")}
                                </span>
                                <span className={styles.stopMeta}>
                                  <span
                                    className={`material-symbols-outlined ${styles.stopMetaIcon}`}
                                  >
                                    {TYPE_ICON[step.type]}
                                  </span>
                                  {TYPE_LABEL[step.type]}
                                  {step.estimatedTime && (
                                    <> · {step.estimatedTime} min</>
                                  )}
                                </span>
                                {done && (
                                  <span className={styles.completedCheck}>
                                    <span
                                      className="material-symbols-outlined"
                                      style={{ fontSize: "1rem" }}
                                    >
                                      check_circle
                                    </span>
                                    Ukończono
                                  </span>
                                )}
                              </div>
                              <h3 className={styles.cardTitle}>{step.title}</h3>
                              <p className={styles.cardDesc}>
                                {step.description}
                              </p>
                              {step.tags && step.tags.length > 0 && (
                                <div className={styles.tags}>
                                  {step.tags.map((tag) => (
                                    <span key={tag} className={styles.tag}>
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            {step.image ? (
                              <img
                                src={strapiImageUrl(step.image.url)}
                                alt={step.image.alternativeText ?? step.title}
                                className={styles.cardThumb}
                              />
                            ) : (
                              <div className={styles.cardThumbPlaceholder}>
                                <span className="material-symbols-outlined">
                                  {TYPE_ICON[step.type]}
                                </span>
                              </div>
                            )}
                          </div>
                        </MotionLink>
                        <div
                          className={`${styles.dot} ${done ? styles.completed : ""}`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              {allComplete && (
                <motion.div
                  className={styles.journeyComplete}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.25,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <div className={styles.journeyCompleteLine}>
                    <span className={styles.journeyCompleteOrn}>✦</span>
                  </div>
                  <h2 className={styles.journeyCompleteTitle}>
                    Podróż Ukończona
                  </h2>
                  <p className={styles.journeyCompleteSubtitle}>
                    Wszystkie etapy zostały ukończone
                  </p>
                  <Link
                    to="/"
                    className={styles.journeyCompleteBtn}
                    onClick={() => window.scrollTo({ top: 0 })}
                  >
                    <span>Dalsza eksploracja</span>
                    <span className="material-symbols-outlined">explore</span>
                  </Link>
                  <div
                    className={styles.journeyCompleteLine}
                    style={{ marginTop: "2rem", marginBottom: 0 }}
                  >
                    <span className={styles.journeyCompleteOrn}>✦</span>
                  </div>
                </motion.div>
              )}
            </div>
          </>
        )}
      </main>
    </PageTransition>
  );
}
