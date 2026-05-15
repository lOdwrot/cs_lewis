import { motion } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { PageBackdrop } from "@/components/animations/PageBackdrop";
import { SEO } from "@/components/SEO";
import { PageLoading } from "@/components/ui/PageLoading";
import { PageError } from "@/components/ui/PageError";
import { useNewsPageQuery } from "@/hooks/queries";
import { getImageVariant } from "@/services/api";
import { NewsCard } from "./NewsCard";
import styles from "./NewsPage.module.scss";

export function NewsPage() {
  const { data: page, isLoading, isError, refetch } = useNewsPageQuery();

  if (isLoading) return <PageLoading />;
  if (isError || !page) return <PageError onRefresh={() => refetch()} />;

  const title = page.title ?? "Aktualności";
  const description = page.description ?? "";
  const news = page.news ?? [];

  const backgroundSrc = page.backgroundImage
    ? getImageVariant(page.backgroundImage, "large")
    : null;
  const backgroundAlt = page.backgroundImage?.alternativeText ?? "";

  return (
    <>
      <PageBackdrop src={backgroundSrc} alt={backgroundAlt} />
      <PageTransition>
        <SEO
          title={title}
          description={
            description ||
            "Bieżące wiadomości ze świata C.S. Lewisa — nowe wydania, konferencje i wydarzenia."
          }
          path="/news"
        />
        <main className={styles.page}>
          <section className={styles.hero}>
            <motion.h1
              className={styles.heroTitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {title}
            </motion.h1>
            <motion.div
              className={styles.heroDivider}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
            {description && (
              <motion.p
                className={styles.heroDesc}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.25 }}
              >
                {description}
              </motion.p>
            )}
          </section>

          <div className={styles.list}>
            {news.length > 0 ? (
              news.map((item) => <NewsCard key={item.documentId} news={item} />)
            ) : (
              <p className={styles.empty}>Brak aktualności.</p>
            )}
          </div>
        </main>
      </PageTransition>
    </>
  );
}
