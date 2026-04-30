import { motion } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { FadeInView } from "@/components/animations/FadeInView";

const gridVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.10, delayChildren: 0.35 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 90, rotateX: 28, scale: 0.88 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 160, damping: 18, mass: 0.9 },
  },
};
import { useFetch } from "@/hooks/useFetch";
import { getBooks } from "@/services/books.service";
import { strapiImageUrl } from "@/services/api";
import styles from "./BooksPage.module.scss";

export function BooksPage() {
  const { data: books, loading } = useFetch(getBooks);

  return (
    <PageTransition>
      <main className={styles.page}>
        {/* Hero */}
        <section className={styles.hero}>
          <motion.span
            className={styles.heroLabel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            Starannie Dobrana Kolekcja
          </motion.span>
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            Półka Uczonego
          </motion.h1>
          <motion.p
            className={styles.heroDesc}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
          >
            „Czytamy, by wiedzieć, że nie jesteśmy sami." Odkryj najważniejsze
            dzieła C.S. Lewisa, gdzie rozum spotyka wyobraźnię w dążeniu do
            wiecznych prawd.
          </motion.p>
          <motion.div
            className={styles.heroDivider}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span>◆</span>
          </motion.div>
        </section>

        {/* Grid */}
        {loading ? (
          <div className={styles.grid}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  height: 440,
                  background: "rgba(212,175,55,0.04)",
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
            {(books ?? []).map((book) => (
              <motion.div
                key={book.id}
                variants={cardVariants}
                style={{ transformOrigin: "bottom center" }}
              >
                <motion.article
                  className={styles.card}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                >
                  <div className={styles.imageWrap}>
                    {book.image ? (
                      <img
                        src={strapiImageUrl(book.image.url)}
                        alt={book.image.alternativeText ?? book.title}
                        className={styles.bookImage}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        <span className="material-symbols-outlined">
                          menu_book
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={styles.body}>
                    <h2 className={styles.bookTitle}>{book.title}</h2>
                    <p className={styles.bookDesc}>{book.description}</p>
                    <a
                      href={book.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.bookLink}
                    >
                      <span>Kup lub Wypożycz</span>
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "1rem" }}
                      >
                        open_in_new
                      </span>
                    </a>
                  </div>
                </motion.article>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Motto */}
        <FadeInView delay={0.3}>
          <div className={styles.motto}>
            <div className={styles.mottoDivider} />
            <p className={styles.mottoText}>Sapientia et Veritas</p>
          </div>
        </FadeInView>
      </main>
    </PageTransition>
  );
}
