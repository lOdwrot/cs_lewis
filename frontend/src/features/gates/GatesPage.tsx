import { motion } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { PageBackdrop } from "@/components/animations/PageBackdrop";
import { SEO } from "@/components/SEO";
import { PageError } from "@/components/ui/PageError";
import { GatesGrid } from "./GatesGrid";
import { useGatePageQuery, useGatesQuery } from "@/hooks/queries";
import { strapiImageUrl } from "@/services/api";
import styles from "./GatesPage.module.scss";

export function GatesPage() {
  const {
    data: page,
    isLoading: pageLoading,
    isError: pageError,
    refetch: refetchPage,
  } = useGatePageQuery();
  const {
    data: allGates,
    isLoading: gatesLoading,
    isError: gatesError,
    refetch: refetchGates,
  } = useGatesQuery();

  if (pageError || gatesError) {
    return (
      <PageError
        onRefresh={() => {
          if (pageError) refetchPage();
          if (gatesError) refetchGates();
        }}
      />
    );
  }

  const title = page?.title ?? "Wielki Portal";
  const description = page?.description ?? "";
  const dividerText = page?.dividerText ?? "Wybierz Swoją Drogę";

  const curatedGates = page?.gates && page.gates.length > 0 ? page.gates : null;
  const gates = curatedGates ?? allGates;
  const isLoading = pageLoading || (curatedGates ? false : gatesLoading);

  const backgroundSrc = page?.backgroundImage
    ? strapiImageUrl(page.backgroundImage.url)
    : "/open_book.png";
  const backgroundAlt = page?.backgroundImage?.alternativeText ?? "";

  return (
    <>
      <PageBackdrop src={backgroundSrc} alt={backgroundAlt} />
      <PageTransition>
        <SEO
          title={title}
          description={
            description ||
            "Odkryj myśl C.S. Lewisa przez interaktywne podróże przez Wyobraźnię, Rozum i Wiarę. Eseje, podcasty i quizy."
          }
          path="/portal"
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

        {dividerText && (
          <motion.p
            className={styles.sectionLabel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.55 }}
          >
            {dividerText}
          </motion.p>
        )}

        <GatesGrid gates={gates} loading={isLoading} />
      </main>
    </PageTransition>
    </>
  );
}
