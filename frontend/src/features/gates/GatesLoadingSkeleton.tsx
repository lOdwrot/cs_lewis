import { motion } from "framer-motion";
import styles from "./GatesLoadingSkeleton.module.scss";

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.14, duration: 0.5, ease: "easeOut" },
  }),
};

export function GatesLoadingSkeleton() {
  return (
    <>
      <div className={styles.ornament}>
        <div className={styles.spinner}>
          <div className={`${styles.ringBase} ${styles.ringOuter}`} />
          <div className={`${styles.ringBase} ${styles.ringMid}`} />
          <div className={`${styles.ringBase} ${styles.ringInner}`} />
          <div className={styles.centerDot} />
        </div>
        <span className={styles.ornamentLabel}>Ładowanie</span>
        <div className={styles.ornamentDivider}>
          <div className={styles.ornamentDiamond} />
        </div>
      </div>

      <div className={styles.grid}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={styles.card}
            variants={cardVariants}
            initial="hidden"
            animate="show"
            custom={i}
          >
            <div
              className={styles.shimmer}
              style={{ "--shimmer-delay": `${i * 0.85}s` } as React.CSSProperties}
            />
            <div className={styles.spine} />
            <div className={styles.face}>
              <div className={styles.iconCircle} />
              <div className={styles.titleBar} />
              <div className={styles.descLines}>
                <div className={styles.descLine} />
                <div className={styles.descLine} />
                <div className={styles.descLine} />
                <div className={styles.descLine} />
              </div>
              <div className={styles.ctaBar} />
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}
