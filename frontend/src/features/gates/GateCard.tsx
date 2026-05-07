import { useMemo, useState, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
} from "framer-motion";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import type { Gate } from "@/types/strapi";
import { strapiImageUrl } from "@/services/api";
import styles from "./GateCard.module.scss";

type Phase = "idle" | "open" | "exit";

interface Particle {
  id: number;
  size: number;
  vx: number;
  vy: number;
  delay: number;
  duration: number;
}

function makeParticles(n: number): Particle[] {
  return Array.from({ length: n }, (_, i) => {
    const base = (i / n) * Math.PI * 2;
    const angle = base + (Math.random() - 0.5) * 0.7;
    const dist = 70 + Math.random() * 120;
    return {
      id: i,
      size: 4 + Math.random() * 8,
      vx: Math.cos(angle) * dist,
      vy: Math.sin(angle) * dist,
      delay: Math.random() * 0.35,
      duration: 0.9 + Math.random() * 0.6,
    };
  });
}

// Icon float variants — mirror repeat creates smooth infinite oscillation
const iconVariants = {
  idle: { y: 0, scale: 1 },
  floating: {
    y: [0, -14],
    scale: [1, 1.07],
    transition: {
      duration: 1.4,
      repeat: Infinity,
      repeatType: "mirror" as const,
      ease: "easeInOut" as const,
    },
  },
};

interface Props {
  gate: Gate;
}

export function GateCard({ gate }: Props) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("idle");
  const [isHovered, setIsHovered] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const particles = useMemo(() => makeParticles(38), []);

  // Motion values for the portal-suck — driven imperatively on exit
  const portalX = useMotionValue(0);
  const portalY = useMotionValue(0);
  const portalScale = useMotionValue(1);

  // ── Cursor-tracked tilt ─────────────────────────────────────────────────
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  // Spring smoothing so tilt glides rather than snapping
  const springX = useSpring(rawX, { stiffness: 180, damping: 24 });
  const springY = useSpring(rawY, { stiffness: 180, damping: 24 });
  // Map normalised cursor offset (−0.5 … 0.5) to rotation degrees
  const rotateX = useTransform(springY, [-0.5, 0.5], [4.5, -4.5]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-4.5, 4.5]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (phase !== "idle") return;
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - r.left) / r.width - 0.5);
    rawY.set((e.clientY - r.top) / r.height - 0.5);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
    setIsHovered(false);
  };

  const handleClick = () => {
    if (phase !== "idle") return;
    rawX.set(0);
    rawY.set(0);
    setIsHovered(false);

    // Capture position now — it won't change during the book-open animation
    const rect = sceneRef.current?.getBoundingClientRect();

    setPhase("open");

    setTimeout(() => {
      setPhase("exit");
      if (rect) {
        const tx = window.innerWidth / 2 - (rect.left + rect.width / 2);
        const ty = window.innerHeight / 2 - (rect.top + rect.height / 2);

        animate(portalX, tx, { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] });
        animate(portalY, ty, { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] });
        animate(portalScale, [1, 1.04, 1.15, 2, 6, 20, 65], {
          duration: 1.25,
          times: [0, 0.08, 0.22, 0.42, 0.62, 0.82, 1],
        });
      }
    }, 1150);

    setTimeout(() => navigate(`/gate/${gate.slug}`), 2400);
  };

  return (
    <>
      <motion.div
        ref={sceneRef}
        className={styles.scene}
        style={{
          x: portalX,
          y: portalY,
          scale: portalScale,
          ...(phase !== "idle" ? { position: "relative", zIndex: 9999 } : {}),
        }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => phase === "idle" && setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Book body — tilt follows cursor, preserve-3d lets cover compose */}
        <motion.div
          className={styles.book}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
          }}
          whileHover={phase === "idle" ? { y: -6 } : {}}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
        >
          {/* Golden aura — radiates from within the book on hover, masked by
              the book silhouette so it hugs the leather instead of the rect */}
          <motion.div
            className={styles.aura}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={
              isHovered && phase === "idle"
                ? { opacity: 1, scale: 1.05 }
                : { opacity: 0, scale: 0.92 }
            }
            transition={{ duration: 0.7, ease: "easeOut" }}
          />

          {/* Inner pages — revealed when cover swings open */}
          <div className={styles.pages}>
            {/* Aged-parchment surface — fades in only when the book opens so
                the cover's transparent corners stay clean while closed */}
            <motion.div
              className={styles.pageSurface}
              initial={{ opacity: 0 }}
              animate={phase !== "idle" ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
            <motion.div
              className={styles.pagesGlow}
              animate={
                phase !== "idle"
                  ? { opacity: 1, scale: 1.15 }
                  : { opacity: 0, scale: 0.3 }
              }
              transition={{ duration: 0.55, ease: "easeOut" }}
            />
          </div>

          {/* Cover — rotates fully open around left spine */}
          <motion.div
            className={styles.cover}
            style={{
              transformOrigin: "left center",
              transformStyle: "preserve-3d",
            }}
            animate={phase !== "idle" ? { rotateY: -180 } : { rotateY: 0 }}
            transition={{ duration: 1.0, ease: [0.4, 0, 0.15, 1] }}
          >
            {/* Front face — old leather book image */}
            <div className={styles.coverFront}>
              <div className={styles.face}>
                {/* Icon floats when the card is hovered */}
                <motion.div
                  className={styles.iconWrap}
                  variants={iconVariants}
                  animate={isHovered && phase === "idle" ? "floating" : "idle"}
                >
                  {gate.image ? (
                    <img
                      src={strapiImageUrl(gate.image.url)}
                      alt={gate.image.alternativeText ?? gate.title}
                      className={styles.image}
                    />
                  ) : gate.iconCharacter ? (
                    <span className={styles.iconCharacter}>
                      {gate.iconCharacter}
                    </span>
                  ) : (
                    <span
                      className={`material-symbols-outlined ${styles.iconFallback}`}
                    >
                      auto_stories
                    </span>
                  )}
                </motion.div>
                <h3 className={styles.title}>{gate.title}</h3>
                <p className={styles.description}>{gate.description}</p>
                <div className={styles.cta}>
                  {gate.enterButtonLabel ?? "Open"}
                </div>
              </div>
            </div>

            {/* Back face — plain white page revealed when fully open */}
            <div className={styles.coverBack} />
          </motion.div>
        </motion.div>

        {/* Particle burst from book centre */}
        <AnimatePresence>
          {phase !== "idle" &&
            particles.map((p) => (
              <motion.div
                key={p.id}
                className={styles.particle}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  marginTop: -p.size / 2,
                  marginLeft: -p.size / 2,
                  width: p.size,
                  height: p.size,
                }}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0.85, 0],
                  x: p.vx,
                  y: p.vy,
                  scale: [0, 1.6, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: "easeOut",
                }}
              />
            ))}
        </AnimatePresence>
      </motion.div>

      {createPortal(
        <AnimatePresence>
          {phase === "exit" && (
            <motion.div
              className={styles.exitOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.45, ease: "easeIn", delay: 1.0 }}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
