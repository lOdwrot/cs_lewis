import { motion } from "framer-motion";
import type { Gate } from "@/types/strapi";
import { GateCard } from "./GateCard";
import { GatesLoadingSkeleton } from "./GatesLoadingSkeleton";
import styles from "./GatesPage.module.scss";

const gridVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.22,
      delayChildren: 0.65,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 90,
    rotateX: 28,
    scale: 0.88,
  },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 160,
      damping: 18,
      mass: 0.9,
    },
  },
};

interface Props {
  gates: Gate[] | undefined;
  loading?: boolean;
}

export function GatesGrid({ gates, loading = false }: Props) {
  if (loading) return <GatesLoadingSkeleton />;
  return (
    <motion.div
      className={styles.grid}
      style={{ perspective: 1200 }}
      variants={gridVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      {(gates ?? []).map((gate) => (
        <motion.div
          key={gate.id}
          variants={cardVariants}
          style={{ transformOrigin: "bottom center" }}
        >
          <GateCard gate={gate} />
        </motion.div>
      ))}
    </motion.div>
  );
}
