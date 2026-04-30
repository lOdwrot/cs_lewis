import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import styles from "./QuizComplete.module.scss";

interface Props {
  quizTitle: string;
  score: number;
  total: number;
  onRedo: () => void;
}

export function QuizComplete({ quizTitle, score, total, onRedo }: Props) {
  const pct = Math.round((score / total) * 100);

  return (
    <motion.div
      className={styles.wrap}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div
        className={styles.icon}
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 18,
          delay: 0.15,
        }}
      >
        <span className="material-symbols-outlined">emoji_events</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <h2 className={styles.title}>Gratulacje!</h2>
        <p className={styles.quizTitle}>{quizTitle}</p>

        <div className={styles.scoreWrap}>
          <div className={styles.score}>{pct}%</div>
          <p className={styles.scoreLabel}>
            {score} z {total} poprawnych
          </p>
        </div>
      </motion.div>

      <div className={styles.divider}>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "0.6rem" }}
        >
          diamond
        </span>
      </div>

      <motion.div
        className={styles.actions}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <motion.button
          className={styles.redoBtn}
          onClick={onRedo}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "1rem" }}
          >
            replay
          </span>
          Powtórz Quiz
        </motion.button>
        <Link to={-1 as never} className={styles.backBtn}>
          ← Powrót do Podróży
        </Link>
      </motion.div>
    </motion.div>
  );
}
