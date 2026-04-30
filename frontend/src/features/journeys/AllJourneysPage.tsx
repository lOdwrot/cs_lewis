import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { JourneyCard } from "@/features/journeys/JourneyCard";
import { getJourneys } from "@/services/journeys.service";
import type { Difficulty, Journey } from "@/types/strapi";
import styles from "./AllJourneysPage.module.scss";

const PAGE_SIZE = 6;

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
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // ── Debounce ────────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  // ── Reset list when filters change ──────────────────────────────────────
  const prevFilterRef = useRef({ search: debouncedSearch, difficulty });
  useEffect(() => {
    const prev = prevFilterRef.current;
    if (prev.search !== debouncedSearch || prev.difficulty !== difficulty) {
      prevFilterRef.current = { search: debouncedSearch, difficulty };
      setJourneys([]);
      setPage(1);
      setHasMore(true);
      setTotalCount(null);
    }
  }, [debouncedSearch, difficulty]);

  // ── Fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getJourneys({
      page,
      pageSize: PAGE_SIZE,
      search: debouncedSearch,
      difficulty,
    })
      .then((result) => {
        if (cancelled) return;
        setJourneys((prev) =>
          page === 1 ? result.data : [...prev, ...result.data],
        );
        setHasMore(result.pagination.page < result.pagination.pageCount);
        setTotalCount(result.pagination.total);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, debouncedSearch, difficulty]);

  // ── Intersection Observer sentinel ──────────────────────────────────────
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node || !hasMore || loading) return;
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setPage((p) => p + 1);
        },
        { rootMargin: "200px" },
      );
      observerRef.current.observe(node);
    },
    [hasMore, loading],
  );

  const isEmpty = !loading && journeys.length === 0;

  return (
    <PageTransition>
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
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
          />
          {search && (
            <button
              className={styles.searchClear}
              type="button"
              onClick={() => setSearch("")}
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
                  difficulty === f.value ? styles.active : ""
                }`}
                onClick={() =>
                  setDifficulty(difficulty === f.value ? null : f.value)
                }
                type="button"
              >
                <span className="material-symbols-outlined">{f.icon}</span>
                {f.label}
              </button>
            ))}
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
        {loading && (
          <div className={styles.loader}>
            <span className={styles.spinner} />
          </div>
        )}

        {/* ── Sentinel for infinite scroll ── */}
        {!loading && hasMore && (
          <div ref={sentinelRef} className={styles.sentinel} />
        )}

        {/* ── End of list ── */}
        {!hasMore && journeys.length > 0 && (
          <p className={styles.endMessage}>
            <span className="material-symbols-outlined">auto_stories</span>
            Wszystkie przygody załadowane
          </p>
        )}
      </main>
    </PageTransition>
  );
}
