import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useAnimationControls,
  useMotionValue,
  useSpring,
} from "framer-motion";
import type { Journey } from "@/types/strapi";
import { strapiImageUrl } from "@/services/api";
import { useProgressStore } from "@/store/progressStore";
import styles from "./JourneyCard.module.scss";

const TILT_SPRING = { stiffness: 280, damping: 26, mass: 0.6 };

const GLOW_OFF =
  "0 0 0 1px rgba(212,175,55,0), 0 10px 50px rgba(212,175,55,0), 0 0 80px rgba(212,175,55,0)";
const GLOW_LO =
  "0 0 0 1px rgba(212,175,55,0.55), 0 10px 50px rgba(212,175,55,0.42), 0 0 90px rgba(212,175,55,0.22)";
const GLOW_HI =
  "0 0 0 1px rgba(212,175,55,0.85), 0 14px 70px rgba(212,175,55,0.62), 0 0 130px rgba(212,175,55,0.38)";

const DIFFICULTY_LABEL: Record<string, string> = {
  easy: "Łatwa",
  medium: "Średnia",
  hard: "Trudna",
};

const DIFFICULTY_ICON: Record<string, string> = {
  easy: "eco",
  medium: "bolt",
  hard: "local_fire_department",
};

interface Props {
  journey: Journey;
}

export function JourneyCard({ journey }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glowControls = useAnimationControls();
  const isStepComplete = useProgressStore((s) => s.isStepComplete);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useSpring(rawX, TILT_SPRING);
  const rotateY = useSpring(rawY, TILT_SPRING);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    rawY.set(cx * 16);
    rawX.set(-cy * 10);
  }

  function handleMouseLeave() {
    rawX.set(0);
    rawY.set(0);
  }
  const steps = journey.steps ?? [];
  const totalSteps = steps.length;
  const completedCount = steps.filter((s) =>
    isStepComplete(s.documentId),
  ).length;
  const progressPct = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
  const isJourneyComplete = totalSteps > 0 && completedCount === totalSteps;
  const totalTime = steps.reduce((sum, s) => sum + (s.estimatedTime ?? 0), 0);

  return (
    <motion.div
      ref={cardRef}
      animate={glowControls}
      initial={{ boxShadow: GLOW_OFF }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onHoverStart={() =>
        glowControls.start({
          boxShadow: [GLOW_LO, GLOW_HI, GLOW_LO],
          transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
        })
      }
      onHoverEnd={() =>
        glowControls.start({
          boxShadow: GLOW_OFF,
          transition: { duration: 0.4, ease: "easeOut" },
        })
      }
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
          {totalTime > 0 && (
            <div className={styles.timeLabel}>
              <span className="material-symbols-outlined">schedule</span>
              {totalTime} min
            </div>
          )}
          {journey.difficulty && (
            <div
              className={`${styles.difficultyBadge} ${styles[journey.difficulty]}`}
            >
              <span className="material-symbols-outlined">
                {DIFFICULTY_ICON[journey.difficulty]}
              </span>
              {DIFFICULTY_LABEL[journey.difficulty]}
            </div>
          )}
          {journey.tags && journey.tags.length > 0 && (
            <div className={styles.tags}>
              {journey.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
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
            <span>Przejdź do Podróży</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
