import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import styles from "./BreathingBackground.module.scss";

export function BreathingBackground() {
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);
  const x = useSpring(rawX, { stiffness: 18, damping: 40, mass: 1.5 });
  const y = useSpring(rawY, { stiffness: 18, damping: 40, mass: 1.5 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX / window.innerWidth);
      rawY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [rawX, rawY]);

  const background = useTransform([x, y], ([cx, cy]: number[]) =>
    `radial-gradient(ellipse at ${10 + cx * 25}% ${10 + cy * 25}%, rgba(212, 175, 55, 0.06) 0%, transparent 55%),
     radial-gradient(ellipse at ${90 - cx * 25}% ${90 - cy * 25}%, rgba(212, 175, 55, 0.035) 0%, transparent 55%),
     radial-gradient(ellipse at ${50 + cx * 20}% ${5 + cy * 15}%, rgba(212, 175, 55, 0.03) 0%, transparent 45%),
     #050a0d`
  );

  return <motion.div className={styles.root} style={{ background }} aria-hidden />;
}
