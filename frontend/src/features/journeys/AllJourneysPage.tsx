import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { SEO } from "@/components/SEO";
import { GatesLoadingSkeleton } from "@/features/gates/GatesLoadingSkeleton";
import { JourneyCard } from "@/features/journeys/JourneyCard";
import { useJourneysInfiniteQuery } from "@/hooks/queries";
import type { Difficulty } from "@/types/strapi";
import styles from "./AllJourneysPage.module.scss";

const DIFFICULTY_FILTERS: { value: Difficulty; label: string; icon: string }[] =
  [
    { value: "easy", label: "Łatwa", icon: "eco" },
    { value: "medium", label: "Średnia", icon: "bolt" },
    { value: "hard", label: "Trudna", icon: "local_fire_department" },
  ];

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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);

  // ── Debounce ────────────────────────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value.trim()), 400);
  };

  // ── Data ─────────────────────────────────────────────────────────────────
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

  // ── Intersection Observer sentinel ──────────────────────────────────────
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

  return (
    <PageTransition>
      <SEO
        title="Wszystkie Przygody"
        description="Przeglądaj wszystkie podróże z myślą C.S. Lewisa — filtruj według poziomu trudności i znajdź swoją drogę."
        path="/journeys"
      />
      <main className={styles.page}>
        {/* ── Hero ── */}
        <motion.header
          className={styles.hero}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <span className={styles.heroLabel}>Odkryj</span>
          <h1 className={styles.heroTitle}>Wszystkie Przygody</h1>
          <p className={styles.heroDesc}>
            Przeglądaj wszystkie podróże przez świat myśli C.S.&nbsp;Lewisa
          </p>
          <div className={styles.divider} />
        </motion.header>

        {/* ── Search ── */}
        <div className={styles.searchWrap}>
          <span className={`material-symbols-outlined ${styles.searchIcon}`}>
            search
          </span>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Szukaj przygody…"
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

        {/* ── Filters ── */}
        <div className={styles.filterSection}>
          <span className={styles.filterLabel}>
            Filtruj po poziomie trudności przygody
          </span>
          <div className={styles.filterBar}>
            {DIFFICULTY_FILTERS.map((f) => (
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
              Wyczyść
            </button>
          </div>
        </div>

        {/* ── Result count ── */}
        {totalCount !== null && (
          <p className={styles.resultCount}>
            {totalCount === 0
              ? "Brak wyników"
              : `${totalCount} ${totalCount === 1 ? "przygoda" : totalCount < 5 ? "przygody" : "przygód"}`}
          </p>
        )}

        {/* ── Grid ── */}
        {isEmpty ? (
          <div className={styles.empty}>
            <span className="material-symbols-outlined">explore_off</span>
            <p>Nie znaleziono przygód dla podanych kryteriów.</p>
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

        {/* ── Loader ── */}
        {loading && <GatesLoadingSkeleton />}

        {/* ── Sentinel for infinite scroll ── */}
        {!loading && hasNextPage && (
          <div ref={sentinelRef} className={styles.sentinel} />
        )}

        {/* ── End of list ── */}
        {!hasNextPage && journeys.length > 0 && (
          <p className={styles.endMessage}>
            <span className="material-symbols-outlined">auto_stories</span>
            Wszystkie przygody załadowane
          </p>
        )}
      </main>
    </PageTransition>
  );
}
