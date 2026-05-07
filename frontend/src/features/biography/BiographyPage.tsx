import { useRef } from "react";
import {
  motion,
  useAnimationControls,
  useMotionValue,
  useSpring,
} from "framer-motion";

type GlowControls = ReturnType<typeof useAnimationControls>;
type Tilt = ReturnType<typeof useMotionValue<number>>;
import { PageTransition } from "@/components/animations/PageTransition";
import { PageBackdrop } from "@/components/animations/PageBackdrop";
import { SEO } from "@/components/SEO";
import { PageLoading } from "@/components/ui/PageLoading";
import { PageError } from "@/components/ui/PageError";
import { useBiographyPageQuery } from "@/hooks/queries";
import { strapiImageUrl } from "@/services/api";
import type { BiographyEvent } from "@/types/strapi";
import styles from "./BiographyPage.module.scss";

const TILT_SPRING = { stiffness: 280, damping: 26, mass: 0.6 };

const GLOW_OFF =
  "0 0 0 1px rgba(212,175,55,0), 0 8px 24px rgba(0,0,0,0.25), 0 0 0 rgba(212,175,55,0)";
const GLOW_LO =
  "0 0 0 1px rgba(212,175,55,0.45), 0 12px 40px rgba(0,0,0,0.35), 0 0 60px rgba(212,175,55,0.18)";
const GLOW_HI =
  "0 0 0 1px rgba(212,175,55,0.8), 0 18px 60px rgba(0,0,0,0.4), 0 0 110px rgba(212,175,55,0.34)";

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

  const cardRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLDivElement>(null);
  const cardGlow = useAnimationControls();
  const figureGlow = useAnimationControls();

  const cardRawX = useMotionValue(0);
  const cardRawY = useMotionValue(0);
  const cardRotateX = useSpring(cardRawX, TILT_SPRING);
  const cardRotateY = useSpring(cardRawY, TILT_SPRING);

  const figRawX = useMotionValue(0);
  const figRawY = useMotionValue(0);
  const figRotateX = useSpring(figRawX, TILT_SPRING);
  const figRotateY = useSpring(figRawY, TILT_SPRING);

  function handleTilt(
    e: React.MouseEvent<HTMLDivElement>,
    el: HTMLDivElement | null,
    rx: Tilt,
    ry: Tilt,
  ) {
    const rect = el?.getBoundingClientRect();
    if (!rect) return;
    const cx = (e.clientX - rect.left) / rect.width - 0.5;
    const cy = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(cx * 14);
    rx.set(-cy * 9);
  }

  function startGlow(controls: GlowControls) {
    controls.start({
      boxShadow: [GLOW_LO, GLOW_HI, GLOW_LO],
      transition: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
    });
  }

  function stopGlow(controls: GlowControls, rx: Tilt, ry: Tilt) {
    rx.set(0);
    ry.set(0);
    controls.start({
      boxShadow: GLOW_OFF,
      transition: { duration: 0.4, ease: "easeOut" },
    });
  }

  return (
    <li className={`${styles.entry} ${styles[`entry--${side}`]}`}>
      <span className={styles.marker} aria-hidden="true" />

      <motion.div
        className={`${styles.slot} ${styles[`slot--${side}`]}`}
        initial={{ opacity: 0, x: side === "left" ? -40 : 40, y: 12 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          ref={cardRef}
          className={styles.cardTilt}
          initial={{ boxShadow: GLOW_OFF }}
          animate={cardGlow}
          style={{
            rotateX: cardRotateX,
            rotateY: cardRotateY,
            transformPerspective: 900,
          }}
          onMouseMove={(e) => handleTilt(e, cardRef.current, cardRawX, cardRawY)}
          onHoverStart={() => startGlow(cardGlow)}
          onHoverEnd={() => stopGlow(cardGlow, cardRawX, cardRawY)}
        >
          <article className={styles.card}>
            <span className={styles.year}>{event.year}</span>
            <h2 className={styles.title}>{event.title}</h2>
            {event.description && (
              <p className={styles.desc}>{event.description}</p>
            )}
            <span className={styles.cardSheen} aria-hidden="true" />
          </article>
        </motion.div>
      </motion.div>

      {imageSrc ? (
        <motion.div
          className={`${styles.slot} ${styles[`slot--${oppositeSide}`]}`}
          initial={{ opacity: 0, x: oppositeSide === "left" ? -40 : 40, y: 12 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.7,
            delay: 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <motion.div
            ref={figureRef}
            className={styles.figureTilt}
            initial={{ boxShadow: GLOW_OFF }}
            animate={figureGlow}
            style={{
              rotateX: figRotateX,
              rotateY: figRotateY,
              transformPerspective: 900,
            }}
            onMouseMove={(e) =>
              handleTilt(e, figureRef.current, figRawX, figRawY)
            }
            onHoverStart={() => startGlow(figureGlow)}
            onHoverEnd={() => stopGlow(figureGlow, figRawX, figRawY)}
          >
            <figure className={styles.figure}>
              <img src={imageSrc} alt={imageAlt} loading="lazy" />
              <span className={styles.figureSheen} aria-hidden="true" />
            </figure>
          </motion.div>
        </motion.div>
      ) : null}
    </li>
  );
}
