import { motion } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { PageBackdrop } from "@/components/animations/PageBackdrop";
import { FadeInView } from "@/components/animations/FadeInView";
import { SEO } from "@/components/SEO";
import { GatesLoadingSkeleton } from "@/features/gates/GatesLoadingSkeleton";
import { useBooksPageQuery, useBooksQuery } from "@/hooks/queries";
import { strapiImageUrl } from "@/services/api";
import styles from "./BooksPage.module.scss";

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

export function BooksPage() {
  const { data: page } = useBooksPageQuery();
  const { data: books, isLoading: loading } = useBooksQuery();

  const title = page?.title ?? "Półka Uczonego";
  const seoDescription =
    page?.seoDescription ??
    "Odkryj najważniejsze książki C.S. Lewisa — od Narni po apologetykę i filozofię chrześcijańską.";
  const heroLabel = page?.heroLabel ?? "Starannie Dobrana Kolekcja";
  const heroDescription =
    page?.heroDescription ??
    "„Czytamy, by wiedzieć, że nie jesteśmy sami.” Odkryj najważniejsze dzieła C.S. Lewisa, gdzie rozum spotyka wyobraźnię w dążeniu do wiecznych prawd.";
  const buyLabel = page?.buyLabel ?? "Kup lub Wypożycz";
  const motto = page?.motto ?? "Sapientia et Veritas";

  const backgroundSrc = page?.backgroundImage
    ? strapiImageUrl(page.backgroundImage.url)
    : null;
  const backgroundAlt = page?.backgroundImage?.alternativeText ?? "";

  return (
    <>
      <PageBackdrop src={backgroundSrc} alt={backgroundAlt} />
      <PageTransition>
        <SEO title={title} description={seoDescription} path="/books" />
        <main className={styles.page}>
          <section className={styles.hero}>
          {heroLabel && (
            <motion.span
              className={styles.heroLabel}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {heroLabel}
            </motion.span>
          )}
          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            {title}
          </motion.h1>
          {heroDescription && (
            <motion.p
              className={styles.heroDesc}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 }}
            >
              {heroDescription}
            </motion.p>
          )}
          <motion.div
            className={styles.heroDivider}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <span>◆</span>
          </motion.div>
        </section>

        {loading ? (
          <GatesLoadingSkeleton />
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
                      <span>{buyLabel}</span>
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

        {motto && (
          <FadeInView delay={0.3}>
            <div className={styles.motto}>
              <div className={styles.mottoDivider} />
              <p className={styles.mottoText}>{motto}</p>
            </div>
          </FadeInView>
        )}
      </main>
    </PageTransition>
    </>
  );
}
