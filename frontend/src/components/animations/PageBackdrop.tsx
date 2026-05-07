import { motion, useScroll, useTransform } from "framer-motion";
import styles from "./PageBackdrop.module.scss";

interface Props {
  src: string | null | undefined;
  alt?: string;
}

const PARALLAX_FACTOR = 0.3;

export function PageBackdrop({ src, alt = "" }: Props) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, (value) => -value * PARALLAX_FACTOR);

  if (!src) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <motion.img
        src={src}
        alt={alt}
        aria-hidden={alt ? undefined : true}
        className={styles.backdrop}
        style={{ y, x: "-50%" }}
      />
    </motion.div>
  );
}
