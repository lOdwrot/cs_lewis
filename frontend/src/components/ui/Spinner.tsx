import styles from "./Spinner.module.scss";

export function Spinner() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.ring} />
    </div>
  );
}
