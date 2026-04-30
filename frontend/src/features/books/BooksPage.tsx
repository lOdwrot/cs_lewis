import { motion } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { StaggerList, StaggerItem } from "@/components/animations/StaggerList";
import { FadeInView } from "@/components/animations/FadeInView";
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
            Curated Collection
          </motion.span>
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            The Scholar's Bookshelf
          </motion.h1>
          <motion.p
            className={styles.heroDesc}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
          >
            "We read to know we are not alone." Explore the definitive works of
            C.S. Lewis, where reason meets imagination in the pursuit of eternal
            truths.
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
          <StaggerList className={styles.grid}>
            {(books ?? []).map((book) => (
              <StaggerItem key={book.id}>
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
                      <span>Buy or Borrow</span>
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "1rem" }}
                      >
                        open_in_new
                      </span>
                    </a>
                  </div>
                </motion.article>
              </StaggerItem>
            ))}
          </StaggerList>
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
