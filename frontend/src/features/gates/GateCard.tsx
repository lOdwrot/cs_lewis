import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

interface Props {
  gate: Gate;
}

export function GateCard({ gate }: Props) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("idle");
  const particles = useMemo(() => makeParticles(38), []);

  const handleClick = () => {
    if (phase !== "idle") return;
    setPhase("open");
    setTimeout(() => setPhase("exit"), 1150);
    setTimeout(() => navigate(`/gate/${gate.slug}`), 1700);
  };

  return (
    <>
      <div className={styles.scene} onClick={handleClick}>
        <motion.div
          className={styles.book}
          whileHover={phase === "idle" ? { y: -6 } : {}}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
        >
          {/* Inner pages — revealed when cover swings open */}
          <div className={styles.pages}>
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

          {/* Cover — rotates open around left spine; hidden once past 90° */}
          <motion.div
            className={styles.cover}
            style={{
              transformOrigin: "left center",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            animate={phase !== "idle" ? { rotateY: -168 } : { rotateY: 0 }}
            transition={{ duration: 0.9, ease: [0.4, 0, 0.15, 1] }}
          >
            <div className={styles.spine} />
            <div className={styles.face}>
              <div className={styles.iconWrap}>
                {gate.image ? (
                  <img
                    src={strapiImageUrl(gate.image.url)}
                    alt={gate.image.alternativeText ?? gate.title}
                    className={styles.image}
                  />
                ) : (
                  <span
                    className={`material-symbols-outlined ${styles.iconFallback}`}
                  >
                    auto_stories
                  </span>
                )}
              </div>
              <h3 className={styles.title}>{gate.title}</h3>
              <p className={styles.description}>{gate.description}</p>
              <div className={styles.cta}>Open</div>
            </div>
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
      </div>

      {createPortal(
        <AnimatePresence>
          {phase === "exit" && (
            <motion.div
              className={styles.exitOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.55, ease: "easeIn" }}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
