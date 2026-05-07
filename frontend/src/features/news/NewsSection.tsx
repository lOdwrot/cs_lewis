import { forwardRef } from "react";
import { motion } from "framer-motion";
import type { News } from "@/types/strapi";
import { NewsCard } from "./NewsCard";
import styles from "./NewsSection.module.scss";
import homeStyles from "@/features/home/HomePage.module.scss";

interface Props {
  title: string | null | undefined;
  news: News[] | undefined;
}

export const NewsSection = forwardRef<HTMLElement, Props>(
  ({ title, news }, ref) => {
    return (
      <section ref={ref} className={styles.section}>
        <div className={styles.inner}>
          {title && (
            <motion.h2
              className={homeStyles.gatesSectionTitle}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55 }}
            >
              <span className={homeStyles.titleRule} aria-hidden="true" />
              <span className={homeStyles.titleFleur} aria-hidden="true">
                ❦
              </span>
              <span className={homeStyles.titleText}>{title}</span>
              <span className={homeStyles.titleFleur} aria-hidden="true">
                ❦
              </span>
              <span className={homeStyles.titleRule} aria-hidden="true" />
            </motion.h2>
          )}

          {news && news.length > 0 ? (
            <div className={styles.list}>
              {news.map((item) => (
                <NewsCard key={item.documentId} news={item} />
              ))}
            </div>
          ) : (
            <p className={styles.empty}>Brak nowości.</p>
          )}
        </div>
      </section>
    );
  },
);

NewsSection.displayName = "NewsSection";
