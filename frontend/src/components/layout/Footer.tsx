import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useFooterQuery } from "@/hooks/queries";
import { getImageVariant } from "@/services/api";
import styles from "./Footer.module.scss";

export function Footer() {
  const { data: footer } = useFooterQuery();

  const logoEl = footer?.image ? (
    <img
      src={getImageVariant(footer.image, "small")}
      alt={footer.image.alternativeText ?? ""}
      className={styles.logo}
    />
  ) : null;

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {logoEl && (
          <div className={styles.logoSide}>
            {footer?.imageLink ? (
              <a
                href={footer.imageLink}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.logoLink}
              >
                {logoEl}
              </a>
            ) : (
              logoEl
            )}
          </div>
        )}

        <div className={styles.rightSide}>
          {footer?.socialLinks && footer.socialLinks.length > 0 && (
            <div className={styles.socialLinks}>
              {footer.socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label={link.image?.alternativeText ?? link.redirectUrl}
                >
                  {link.image ? (
                    <img
                      src={getImageVariant(link.image, "thumbnail")}
                      alt={link.image.alternativeText ?? ""}
                      className={styles.socialIcon}
                    />
                  ) : (
                    <span className={styles.socialFallback}>↗</span>
                  )}
                </a>
              ))}
            </div>
          )}

          {footer?.description && (
            <div className={styles.description}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {footer.description}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
