import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { SEO } from "@/components/SEO";
import { PageLoading } from "@/components/ui/PageLoading";
import { PageError } from "@/components/ui/PageError";
import { GatesGrid } from "@/features/gates/GatesGrid";
import { NewsSection } from "@/features/news/NewsSection";
import { useHomePageQuery } from "@/hooks/queries";
import { strapiImageUrl } from "@/services/api";
import styles from "./HomePage.module.scss";

export function HomePage() {
  const { data: home, isLoading, isError, refetch } = useHomePageQuery();
  const gatesSectionRef = useRef<HTMLElement | null>(null);
  const newsSectionRef = useRef<HTMLElement | null>(null);
  const { scrollY } = useScroll();
  const portraitY = useTransform(scrollY, (v) => -v * 0.1);

  if (isLoading) return <PageLoading />;
  if (isError || !home) return <PageError onRefresh={() => refetch()} />;
  const news = home?.news;

  const scrollTo = (ref: React.RefObject<HTMLElement | null>) => () => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const portraitSrc = home?.backgroundImage
    ? strapiImageUrl(home.backgroundImage.url)
    : undefined;
  const portraitAlt = home?.backgroundImage?.alternativeText ?? "";

  return (
    <PageTransition>
      <SEO
        title={home?.title ?? "C.S. Lewis: Trzy Drogi do Prawdy"}
        description={home?.subtitle ?? ""}
        path="/"
      />
      <main className={styles.page}>
        {portraitSrc && (
          <motion.img
            src={portraitSrc}
            alt={portraitAlt}
            aria-hidden={portraitAlt ? undefined : true}
            className={styles.portrait}
            style={{ y: portraitY }}
          />
        )}
        {home?.title && (
          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {home.title}
          </motion.h1>
        )}
        <motion.div
          className={styles.divider}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        {home?.subtitle && (
          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.25 }}
          >
            {home.subtitle}
          </motion.p>
        )}
        {home?.content && (
          <motion.p
            className={styles.body}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.35 }}
          >
            {home.content}
          </motion.p>
        )}

        {(home?.ctaLabel || home?.newsButtonLabel) && (
          <motion.div
            className={styles.cta}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.35 }}
          >
            {home?.ctaLabel && (
              <button
                type="button"
                onClick={scrollTo(gatesSectionRef)}
                className={styles.ctaLink}
              >
                {home.ctaLabel}
              </button>
            )}
            {home?.newsButtonLabel && (news?.length ?? 0) > 0 && (
              <button
                type="button"
                onClick={scrollTo(newsSectionRef)}
                className={styles.ctaLink}
              >
                {home.newsButtonLabel}
              </button>
            )}
          </motion.div>
        )}

        {(isLoading || (home?.gates?.length ?? 0) > 0) && (
          <section ref={gatesSectionRef} className={styles.gatesSection}>
            <div className={styles.gatesInner}>
              {home?.gatesSectionTitle && (
                <motion.h2
                  className={styles.gatesSectionTitle}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.55 }}
                >
                  <span className={styles.titleRule} aria-hidden="true" />
                  <span className={styles.titleFleur} aria-hidden="true">
                    ❦
                  </span>
                  <span className={styles.titleText}>
                    {home.gatesSectionTitle}
                  </span>
                  <span className={styles.titleFleur} aria-hidden="true">
                    ❦
                  </span>
                  <span className={styles.titleRule} aria-hidden="true" />
                </motion.h2>
              )}
              <GatesGrid gates={home?.gates} loading={isLoading} />
            </div>
          </section>
        )}

        {(news?.length ?? 0) > 0 && (
          <NewsSection
            ref={newsSectionRef}
            title={home?.newsSectionTitle}
            news={news}
          />
        )}
      </main>
    </PageTransition>
  );
}
