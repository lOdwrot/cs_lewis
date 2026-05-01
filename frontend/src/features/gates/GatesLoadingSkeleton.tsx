import styles from "./GatesLoadingSkeleton.module.scss";

export function GatesLoadingSkeleton() {
  return (
    <div className={styles.ornament}>
      <div className={styles.spinner}>
        <div className={`${styles.ringBase} ${styles.ringOuter}`} />
        <div className={`${styles.ringBase} ${styles.ringMid}`} />
        <div className={`${styles.ringBase} ${styles.ringInner}`} />
        <div className={styles.centerDot} />
      </div>
    </div>
  );
}
