import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PageTransition } from "@/components/animations/PageTransition";
import { PageBackdrop } from "@/components/animations/PageBackdrop";
import { SEO } from "@/components/SEO";
import { PageError } from "@/components/ui/PageError";
import { GatesLoadingSkeleton } from "@/features/gates/GatesLoadingSkeleton";
import {
  usePublicationsPageQuery,
  usePublicationsInfiniteQuery,
} from "@/hooks/queries";
import { getImageVariant } from "@/services/api";
import styles from "./PublicationsPage.module.scss";

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 220, damping: 26 },
  },
};

export function PublicationsPage() {
  const {
    data: page,
    isError: pageError,
    refetch: refetchPage,
  } = usePublicationsPageQuery();

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
    isError: pubsError,
    refetch: refetchPubs,
  } = usePublicationsInfiniteQuery(debouncedSearch);

  const publications = data?.pages.flatMap((p) => p.data) ?? [];
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

  const isEmpty = !isLoading && publications.length === 0;

  const backgroundSrc = page?.backgroundImage
    ? getImageVariant(page.backgroundImage, "large")
    : null;
  const backgroundAlt = page?.backgroundImage?.alternativeText ?? "";

  if (pageError || pubsError) {
    return (
      <PageError
        onRefresh={() => {
          if (pageError) refetchPage();
          if (pubsError) refetchPubs();
        }}
      />
    );
  }

  const title = page?.title ?? "Publikacje";
  const description = page?.description ?? "";

  return (
    <>
      <PageBackdrop src={backgroundSrc} alt={backgroundAlt} />
      <PageTransition>
        <SEO
        title={title}
        description={
          description ||
          "Pełna lista dzieł C.S. Lewisa posortowana chronologicznie."
        }
        path="/publikacje"
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
            placeholder="Szukaj publikacji…"
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
                    ? "publikacja"
                    : totalCount % 10 >= 2 &&
                        totalCount % 10 <= 4 &&
                        (totalCount % 100 < 10 || totalCount % 100 >= 20)
                      ? "publikacje"
                      : "publikacji"
                }`}
          </p>
        )}

        {isEmpty ? (
          <div className={styles.empty}>
            <span className="material-symbols-outlined">auto_stories</span>
            <p>Nie znaleziono publikacji dla podanego zapytania.</p>
          </div>
        ) : (
          <ul className={styles.list}>
            <AnimatePresence initial={false}>
              {publications.map((pub) => {
                const imgSrc = pub.image
                  ? getImageVariant(pub.image, "medium")
                  : null;
                const imgAlt = pub.image?.alternativeText ?? pub.title;
                return (
                  <motion.li
                    key={pub.documentId}
                    className={styles.card}
                    variants={cardVariants}
                    initial="hidden"
                    animate="show"
                    layout="position"
                  >
                    {imgSrc && (
                      <div className={styles.cardImage}>
                        <img src={imgSrc} alt={imgAlt} loading="lazy" />
                      </div>
                    )}
                    <div className={styles.cardBody}>
                      <div className={styles.cardMeta}>
                        <span className={styles.year}>{pub.publicationYear}</span>
                      </div>
                      <h2 className={styles.cardTitle}>{pub.title}</h2>
                      <div className={styles.cardDesc}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {pub.description}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}

        {loading && <GatesLoadingSkeleton />}

        {!loading && hasNextPage && (
          <div ref={sentinelRef} className={styles.sentinel} />
        )}

        {!hasNextPage && publications.length > 0 && (
          <p className={styles.endMessage}>
            <span className="material-symbols-outlined">menu_book</span>
            Wszystkie publikacje załadowane
          </p>
        )}
      </main>
    </PageTransition>
    </>
  );
}
