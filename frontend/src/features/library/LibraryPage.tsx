import { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { PageBackdrop } from "@/components/animations/PageBackdrop";
import { SEO } from "@/components/SEO";
import { PageError } from "@/components/ui/PageError";
import { GatesLoadingSkeleton } from "@/features/gates/GatesLoadingSkeleton";
import {
  useArticlesInfiniteQuery,
  useLibraryPageQuery,
} from "@/hooks/queries";
import { strapiImageUrl } from "@/services/api";
import styles from "./LibraryPage.module.scss";

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 220, damping: 24 },
  },
};

export function LibraryPage() {
  const {
    data: page,
    isError: pageError,
    refetch: refetchPage,
  } = useLibraryPageQuery();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => setDebouncedSearch(value.trim()),
      350,
    );
  };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError: articlesError,
    refetch: refetchArticles,
  } = useArticlesInfiniteQuery(debouncedSearch);

  const articles = data?.pages.flatMap((p) => p.data) ?? [];
  const totalCount = data?.pages[0]?.pagination.total ?? null;
  const loading = isLoading || isFetchingNextPage;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node || !hasNextPage || isFetchingNextPage) return;
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) fetchNextPage();
        },
        { rootMargin: "300px" },
      );
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  const isEmpty = !isLoading && articles.length === 0;

  if (pageError || articlesError) {
    return (
      <PageError
        onRefresh={() => {
          if (pageError) refetchPage();
          if (articlesError) refetchArticles();
        }}
      />
    );
  }

  const backgroundSrc = page?.backgroundImage
    ? strapiImageUrl(page.backgroundImage.url)
    : "/old_book.png";
  const backgroundAlt = page?.backgroundImage?.alternativeText ?? "";

  const title = page?.title ?? "Biblioteka";
  const description = page?.description ?? "";

  return (
    <>
      <PageBackdrop src={backgroundSrc} alt={backgroundAlt} />
      <PageTransition>
        <SEO
          title={title}
          description={
            description ||
            "Zbiór esejów, analiz i komentarzy poświęconych myśli C.S. Lewisa."
          }
          path="/library"
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

          <div className={styles.searchWrap}>
            <span className={`material-symbols-outlined ${styles.searchIcon}`}>
              search
            </span>
            <input
              className={styles.searchInput}
              type="search"
              placeholder="Szukaj artykułu po tytule…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              autoComplete="off"
            />
            {search && (
              <button
                className={styles.searchClear}
                type="button"
                onClick={() => handleSearchChange("")}
                aria-label="Wyczyść"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>

          {totalCount !== null && (
            <p className={styles.resultCount}>
              {totalCount === 0
                ? "Brak wyników"
                : `${totalCount} ${
                    totalCount === 1
                      ? "artykuł"
                      : totalCount % 10 >= 2 &&
                          totalCount % 10 <= 4 &&
                          (totalCount % 100 < 10 || totalCount % 100 >= 20)
                        ? "artykuły"
                        : "artykułów"
                  }`}
            </p>
          )}

          {isEmpty ? (
            <div className={styles.empty}>
              <span className="material-symbols-outlined">menu_book</span>
              <p>Nie znaleziono artykułów dla podanego zapytania.</p>
            </div>
          ) : (
            <ul className={styles.list}>
              <AnimatePresence initial={false}>
                {articles.map((article) => (
                  <motion.li
                    key={article.documentId}
                    className={styles.entry}
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    layout="position"
                  >
                    <Link
                      to={`/library/${article.slug}`}
                      className={styles.entryLink}
                    >
                      <h2 className={styles.entryName}>{article.title}</h2>
                      {article.description && (
                        <p className={styles.entryDesc}>{article.description}</p>
                      )}
                      <span className={styles.entryArrow}>
                        <span className="material-symbols-outlined">
                          arrow_forward
                        </span>
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}

          {loading && <GatesLoadingSkeleton />}

          {!loading && hasNextPage && (
            <div ref={sentinelRef} className={styles.sentinel} />
          )}

          {!hasNextPage && articles.length > 0 && (
            <p className={styles.endMessage}>
              <span className="material-symbols-outlined">auto_stories</span>
              Wszystkie artykuły załadowane
            </p>
          )}
        </main>
      </PageTransition>
    </>
  );
}
