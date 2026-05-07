import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { SEO } from "@/components/SEO";
import { GatesLoadingSkeleton } from "@/features/gates/GatesLoadingSkeleton";
import {
  useEncyclopediaPageQuery,
  useTermsInfiniteQuery,
} from "@/hooks/queries";
import { strapiImageUrl } from "@/services/api";
import styles from "./EncyclopediaPage.module.scss";

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 220, damping: 24 },
  },
};

export function EncyclopediaPage() {
  const { data: page } = useEncyclopediaPageQuery();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value.trim()), 350);
  };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useTermsInfiniteQuery(debouncedSearch);

  const terms = data?.pages.flatMap((p) => p.data) ?? [];
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

  const isEmpty = !isLoading && terms.length === 0;

  const backgroundSrc = page?.backgroundImage
    ? strapiImageUrl(page.backgroundImage.url)
    : "/open_book.png";
  const backgroundAlt = page?.backgroundImage?.alternativeText ?? "";

  const title = page?.title ?? "Encyklopedia";
  const description = page?.description ?? "";

  return (
    <PageTransition>
      <SEO
        title={title}
        description={
          description ||
          "Słownik pojęć, postaci i miejsc kluczowych dla zrozumienia myśli C.S. Lewisa."
        }
        path="/encyclopedia"
      />
      <main className={styles.page}>
        <img
          src={backgroundSrc}
          alt={backgroundAlt}
          aria-hidden={backgroundAlt ? undefined : true}
          className={styles.bookBackdrop}
        />

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
            placeholder="Szukaj hasła…"
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
                    ? "hasło"
                    : totalCount % 10 >= 2 &&
                        totalCount % 10 <= 4 &&
                        (totalCount % 100 < 10 || totalCount % 100 >= 20)
                      ? "hasła"
                      : "haseł"
                }`}
          </p>
        )}

        {isEmpty ? (
          <div className={styles.empty}>
            <span className="material-symbols-outlined">menu_book</span>
            <p>Nie znaleziono haseł dla podanego zapytania.</p>
          </div>
        ) : (
          <ul className={styles.list}>
            <AnimatePresence initial={false}>
              {terms.map((term) => (
                <motion.li
                  key={term.documentId}
                  className={styles.entry}
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  layout="position"
                >
                  <h2 className={styles.entryName}>{term.name}</h2>
                  <p className={styles.entryDesc}>{term.description}</p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        {loading && <GatesLoadingSkeleton />}

        {!loading && hasNextPage && (
          <div ref={sentinelRef} className={styles.sentinel} />
        )}

        {!hasNextPage && terms.length > 0 && (
          <p className={styles.endMessage}>
            <span className="material-symbols-outlined">auto_stories</span>
            Wszystkie hasła załadowane
          </p>
        )}
      </main>
    </PageTransition>
  );
}
