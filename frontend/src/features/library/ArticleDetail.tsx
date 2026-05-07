import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PageTransition } from "@/components/animations/PageTransition";
import { PageBackdrop } from "@/components/animations/PageBackdrop";
import { FadeInView } from "@/components/animations/FadeInView";
import { SEO } from "@/components/SEO";
import { Spinner } from "@/components/ui/Spinner";
import { useArticleQuery, useLibraryPageQuery } from "@/hooks/queries";
import { strapiImageUrl } from "@/services/api";
import styles from "./ArticleDetail.module.scss";

export function ArticleDetail() {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: page } = useLibraryPageQuery();
  const { data: article, isLoading, isError } = useArticleQuery(slug);

  const backgroundSrc = page?.backgroundImage
    ? strapiImageUrl(page.backgroundImage.url)
    : "/old_book.png";
  const backgroundAlt = page?.backgroundImage?.alternativeText ?? "";

  if (isLoading) {
    return (
      <>
        <PageBackdrop src={backgroundSrc} alt={backgroundAlt} />
        <PageTransition>
          <main className={styles.page}>
            <div className={styles.loading}>
              <Spinner />
            </div>
          </main>
        </PageTransition>
      </>
    );
  }

  if (isError || !article) {
    return (
      <>
        <PageBackdrop src={backgroundSrc} alt={backgroundAlt} />
        <PageTransition>
          <main className={styles.page}>
            <div className={styles.empty}>
              <span className="material-symbols-outlined">menu_book</span>
              <p>Nie znaleziono artykułu.</p>
              <button
                className={styles.backBtn}
                onClick={() => navigate("/library")}
              >
                Wróć do Biblioteki
              </button>
            </div>
          </main>
        </PageTransition>
      </>
    );
  }

  return (
    <>
      <PageBackdrop src={backgroundSrc} alt={backgroundAlt} />
      <PageTransition>
        <SEO
          title={article.title}
          description={article.description ?? undefined}
          path={`/library/${article.slug}`}
        />
        <main className={styles.page}>
          <Link to="/library" className={styles.backLink}>
            <span className="material-symbols-outlined">arrow_back</span>
            Powrót do Biblioteki
          </Link>

          <motion.article
            className={styles.surface}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <header className={styles.header}>
              <div className={styles.typeLabel}>
                <span className="material-symbols-outlined">article</span>
                Artykuł
              </div>
              <h1 className={styles.title}>{article.title}</h1>
              {article.description && (
                <p className={styles.desc}>{article.description}</p>
              )}
            </header>

            <FadeInView delay={0.15}>
              <div className={styles.markdownContent}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {article.content}
                </ReactMarkdown>
              </div>
            </FadeInView>

            <div className={styles.divider}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "0.75rem" }}
              >
                diamond
              </span>
            </div>

            <FadeInView delay={0.2}>
              <div className={styles.footer}>
                <Link to="/library" className={styles.backBtn}>
                  <span className="material-symbols-outlined">menu_book</span>
                  Wszystkie artykuły
                </Link>
              </div>
            </FadeInView>
          </motion.article>
        </main>
      </PageTransition>
    </>
  );
}
