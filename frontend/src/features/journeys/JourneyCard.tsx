import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Journey } from "@/types/strapi";
import { strapiImageUrl } from "@/services/api";
import { useProgressStore } from "@/store/progressStore";
import styles from "./JourneyCard.module.scss";

interface Props {
  journey: Journey;
}

export function JourneyCard({ journey }: Props) {
  const isStepComplete = useProgressStore((s) => s.isStepComplete);
  const steps = journey.steps ?? [];
  const totalSteps = steps.length;
  const completedCount = steps.filter((s) => isStepComplete(s.documentId)).length;
  const progressPct = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
  const isJourneyComplete = totalSteps > 0 && completedCount === totalSteps;
  const totalTime = steps.reduce((sum, s) => sum + (s.estimatedTime ?? 0), 0);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
    >
      <Link to={`/journey/${journey.slug}`} className={styles.card}>
        <div className={styles.imageWrap}>
          {journey.image ? (
            <img
              src={strapiImageUrl(journey.image.url)}
              alt={journey.image.alternativeText ?? journey.title}
              className={styles.image}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span className="material-symbols-outlined">auto_stories</span>
            </div>
          )}
        </div>
        <div className={styles.body}>
          <h3 className={styles.title}>
            {journey.title}
            {isJourneyComplete && (
              <span className={styles.completeBadge} title="Ukończono">
                <span className="material-symbols-outlined">check_circle</span>
              </span>
            )}
          </h3>
          <p className={styles.description}>{journey.description}</p>
          {totalSteps > 0 && (
            <div className={styles.progress}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className={styles.progressLabel}>
                {completedCount} / {totalSteps} kroków ukończono
              </span>
            </div>
          )}
          <div className={styles.cta}>
            {totalTime > 0 && (
              <span className={styles.timeLabel}>
                <span className="material-symbols-outlined">schedule</span>
                {totalTime} min
              </span>
            )}
            <span>Przejdź do Podróży</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
