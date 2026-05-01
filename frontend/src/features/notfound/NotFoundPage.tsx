import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PageTransition } from "@/components/animations/PageTransition";
import styles from "./NotFoundPage.module.scss";

export function NotFoundPage() {
  return (
    <PageTransition>
      <main className={styles.page}>
        <div className={styles.inner}>
          <motion.div
            className={styles.ornament}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            ✦
          </motion.div>

          <motion.p
            className={styles.code}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            404
          </motion.p>

          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
          >
            Tej strony nie ma na mapie
          </motion.h1>

          <motion.div
            className={styles.divider}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <span>◆</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <Link to="/" className={styles.homeLink}>
              <span className="material-symbols-outlined">arrow_back</span>
              Wróć do Początku
            </Link>
          </motion.div>
        </div>
      </main>
    </PageTransition>
  );
}
