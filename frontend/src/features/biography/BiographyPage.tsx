import { motion } from "framer-motion";
import { PageTransition } from "@/components/animations/PageTransition";
import { PageBackdrop } from "@/components/animations/PageBackdrop";
import { FadeInView } from "@/components/animations/FadeInView";
import { SEO } from "@/components/SEO";
import { PageLoading } from "@/components/ui/PageLoading";
import { PageError } from "@/components/ui/PageError";
import { useBiographyPageQuery } from "@/hooks/queries";
import { strapiImageUrl } from "@/services/api";
import type { BiographyEvent } from "@/types/strapi";
import styles from "./BiographyPage.module.scss";

export function BiographyPage() {
  const { data: page, isLoading, isError, refetch } = useBiographyPageQuery();

  if (isLoading) return <PageLoading />;
  if (isError || !page) return <PageError onRefresh={() => refetch()} />;

  const backgroundSrc = page?.backgroundImage
    ? strapiImageUrl(page.backgroundImage.url)
    : "/old_book.png";
  const backgroundAlt = page?.backgroundImage?.alternativeText ?? "";

  const title = page?.title ?? "Życiorys";
  const description = page?.description ?? "";
  const events = page?.events ?? [];

  return (
    <>
      <PageBackdrop src={backgroundSrc} alt={backgroundAlt} />
      <PageTransition>
        <SEO
          title={title}
          description={
            description ||
            "Linia czasu życia C.S. Lewisa — kluczowe daty i wydarzenia."
          }
          path="/biography"
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

          {events.length > 0 && (
            <div className={styles.timelineSurface}>
              <ol className={styles.timeline}>
                <span className={styles.timelineLine} aria-hidden="true" />
                {events.map((event, index) => (
                  <TimelineItem
                    key={event.id}
                    event={event}
                    side={index % 2 === 0 ? "right" : "left"}
                  />
                ))}
              </ol>
            </div>
          )}
        </main>
      </PageTransition>
    </>
  );
}

interface TimelineItemProps {
  event: BiographyEvent;
  side: "left" | "right";
}

function TimelineItem({ event, side }: TimelineItemProps) {
  const imageSrc = event.image ? strapiImageUrl(event.image.url) : null;
  const imageAlt = event.image?.alternativeText ?? event.title;
  const oppositeSide = side === "left" ? "right" : "left";

  return (
    <li className={`${styles.entry} ${styles[`entry--${side}`]}`}>
      <span className={styles.marker} aria-hidden="true" />

      <FadeInView
        className={`${styles.slot} ${styles[`slot--${side}`]}`}
        direction={side === "left" ? "left" : "right"}
      >
        <article className={styles.card}>
          <span className={styles.year}>{event.year}</span>
          <h2 className={styles.title}>{event.title}</h2>
          {event.description && (
            <p className={styles.desc}>{event.description}</p>
          )}
        </article>
      </FadeInView>

      {imageSrc ? (
        <FadeInView
          className={`${styles.slot} ${styles[`slot--${oppositeSide}`]}`}
          direction={oppositeSide === "left" ? "left" : "right"}
        >
          <figure className={styles.figure}>
            <img src={imageSrc} alt={imageAlt} loading="lazy" />
          </figure>
        </FadeInView>
      ) : null}
    </li>
  );
}
