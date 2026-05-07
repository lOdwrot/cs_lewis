import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { PageBackdrop } from "@/components/animations/PageBackdrop";
import { SEO } from "@/components/SEO";
import { GatesLoadingSkeleton } from "@/features/gates/GatesLoadingSkeleton";
import { JourneyCard } from "@/features/journeys/JourneyCard";
import { useJourneysInfiniteQuery, useJourneysPageQuery } from "@/hooks/queries";
import { strapiImageUrl } from "@/services/api";
import type { Difficulty } from "@/types/strapi";
import styles from "./AllJourneysPage.module.scss";

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 22 },
  },
};

export function AllJourneysPage() {
  const { data: page } = useJourneysPageQuery();

  const title = page?.title ?? "Wszystkie Przygody";
  const seoDescription =
    page?.seoDescription ??
    "Przeglądaj wszystkie podróże z myślą C.S. Lewisa — filtruj według poziomu trudności i znajdź swoją drogę.";
  const heroLabel = page?.heroLabel ?? "Odkryj";
  const heroDescription =
    page?.heroDescription ??
    "Przeglądaj wszystkie podróże przez świat myśli C.S. Lewisa";
  const searchPlaceholder = page?.searchPlaceholder ?? "Szukaj przygody…";
  const filterLabel =
    page?.filterLabel ?? "Filtruj po poziomie trudności przygody";
  const clearFiltersLabel = page?.clearFiltersLabel ?? "Wyczyść";
  const emptyMessage =
    page?.emptyMessage ?? "Nie znaleziono przygód dla podanych kryteriów.";
  const endMessage = page?.endMessage ?? "Wszystkie przygody załadowane";

  const difficultyFilters: { value: Difficulty; label: string; icon: string }[] =
    [
      { value: "easy", label: page?.easyLabel ?? "Łatwa", icon: "eco" },
      { value: "medium", label: page?.mediumLabel ?? "Średnia", icon: "bolt" },
      {
        value: "hard",
        label: page?.hardLabel ?? "Trudna",
        icon: "local_fire_department",
      },
    ];

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value.trim()), 400);
  };

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useJourneysInfiniteQuery(debouncedSearch, difficulties);

  const journeys = data?.pages.flatMap((p) => p.data) ?? [];
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
        { rootMargin: "200px" },
      );
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  const isEmpty = !isLoading && journeys.length === 0;

  const backgroundSrc = page?.backgroundImage
    ? strapiImageUrl(page.backgroundImage.url)
    : null;
  const backgroundAlt = page?.backgroundImage?.alternativeText ?? "";

  return (
    <>
      <PageBackdrop src={backgroundSrc} alt={backgroundAlt} />
      <PageTransition>
        <SEO title={title} description={seoDescription} path="/journeys" />
        <main className={styles.page}>
          <motion.header
          className={styles.hero}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {heroLabel && <span className={styles.heroLabel}>{heroLabel}</span>}
          <h1 className={styles.heroTitle}>{title}</h1>
          {heroDescription && (
            <p className={styles.heroDesc}>{heroDescription}</p>
          )}
          <div className={styles.divider} />
        </motion.header>

        <div className={styles.searchWrap}>
          <span className={`material-symbols-outlined ${styles.searchIcon}`}>
            search
          </span>
          <input
            className={styles.searchInput}
            type="search"
            placeholder={searchPlaceholder}
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

        <div className={styles.filterSection}>
          <span className={styles.filterLabel}>{filterLabel}</span>
          <div className={styles.filterBar}>
            {difficultyFilters.map((f) => (
              <button
                key={f.value}
                className={`${styles.filterTag} ${styles[f.value]} ${
                  difficulties.includes(f.value) ? styles.active : ""
                }`}
                onClick={() =>
                  setDifficulties((prev) =>
                    prev.includes(f.value)
                      ? prev.filter((d) => d !== f.value)
                      : [...prev, f.value]
                  )
                }
                type="button"
              >
                <span className="material-symbols-outlined">{f.icon}</span>
                {f.label}
                {difficulties.includes(f.value) && (
                  <span className={`material-symbols-outlined ${styles.filterCheck}`}>
                    check
                  </span>
                )}
              </button>
            ))}
            <button
              className={styles.filterClearAll}
              type="button"
              onClick={() => setDifficulties([])}
              disabled={difficulties.length === 0}
            >
              <span className="material-symbols-outlined">close</span>
              {clearFiltersLabel}
            </button>
          </div>
        </div>

        {totalCount !== null && (
          <p className={styles.resultCount}>
            {totalCount === 0
              ? "Brak wyników"
              : `${totalCount} ${totalCount === 1 ? "przygoda" : totalCount < 5 ? "przygody" : "przygód"}`}
          </p>
        )}

        {isEmpty ? (
          <div className={styles.empty}>
            <span className="material-symbols-outlined">explore_off</span>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <motion.div className={styles.grid} style={{ perspective: 1200 }}>
            <AnimatePresence initial={false}>
              {journeys.map((journey) => (
                <motion.div
                  key={journey.documentId}
                  variants={cardVariants}
                  initial="hidden"
                  animate="show"
                  style={{ transformOrigin: "bottom center" }}
                >
                  <JourneyCard journey={journey} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {loading && <GatesLoadingSkeleton />}

        {!loading && hasNextPage && (
          <div ref={sentinelRef} className={styles.sentinel} />
        )}

        {!hasNextPage && journeys.length > 0 && (
          <p className={styles.endMessage}>
            <span className="material-symbols-outlined">auto_stories</span>
            {endMessage}
          </p>
        )}
      </main>
    </PageTransition>
    </>
  );
}
