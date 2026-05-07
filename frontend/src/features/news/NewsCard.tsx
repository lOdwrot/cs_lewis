import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { strapiImageUrl } from "@/services/api";
import type { News } from "@/types/strapi";
import styles from "./NewsCard.module.scss";

interface Props {
  news: News;
}

export function NewsCard({ news }: Props) {
  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <h3 className={styles.title}>{news.title}</h3>
      <div className={styles.divider} aria-hidden="true" />
      <div className={styles.body}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({ href, children, ...rest }) => (
              <a
                href={href}
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                {...rest}
              >
                {children}
              </a>
            ),
            img: ({ src, alt, ...rest }) => (
              <img
                src={strapiImageUrl(typeof src === "string" ? src : "")}
                alt={alt ?? ""}
                className={styles.image}
                {...rest}
              />
            ),
          }}
        >
          {news.content}
        </ReactMarkdown>
      </div>
    </motion.article>
  );
}
