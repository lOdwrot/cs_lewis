import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PageTransition } from "@/components/animations/PageTransition";
import { FadeInView } from "@/components/animations/FadeInView";
import { useProgressStore } from "@/store/progressStore";
import type { Step, TextContent } from "@/types/strapi";
import styles from "./TextVideoStep.module.scss";

interface Props {
  step: Step;
}

function getYoutubeEmbedUrl(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^&?/]+)/,
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export function TextVideoStep({ step }: Props) {
  const navigate = useNavigate();
  const { markStepComplete, isStepComplete } = useProgressStore();
  const done = isStepComplete(step.documentId);

  const textContent = step.content.find(
    (c): c is TextContent => c.__component === "step.text-content",
  );

  const handleContinue = () => {
    markStepComplete(step.documentId);
    navigate(-1);
  };

  const embedUrl = textContent?.videoUrl
    ? getYoutubeEmbedUrl(textContent.videoUrl)
    : null;

  return (
    <PageTransition>
      <main className={styles.page}>
        <Link to={-1 as never} className={styles.backLink}>
          <span className="material-symbols-outlined">arrow_back</span>
          Powrót do Podróży
        </Link>

        <motion.header
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className={styles.headerMeta}>
            <div className={styles.typeLabel}>
              <span className="material-symbols-outlined">description</span>
              Lektura
            </div>
            {step.estimatedTime && (
              <div className={styles.estimatedTime}>
                <span className="material-symbols-outlined">schedule</span>
                {step.estimatedTime} min
              </div>
            )}
          </div>
          <h1 className={styles.title}>{step.title}</h1>
          {step.description && (
            <p className={styles.desc}>{step.description}</p>
          )}
        </motion.header>

        {embedUrl && (
          <FadeInView delay={0.1}>
            <div className={styles.videoWrap}>
              <iframe
                src={embedUrl}
                className={styles.video}
                title={step.title}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </FadeInView>
        )}

        {textContent?.markdown && (
          <FadeInView delay={0.15}>
            <div className={styles.markdownContent}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {textContent.markdown}
              </ReactMarkdown>
            </div>
          </FadeInView>
        )}

        <div className={styles.divider}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "0.75rem" }}
          >
            diamond
          </span>
        </div>

        <FadeInView delay={0.2}>
          <div className={styles.continueSection}>
            {done ? (
              <div className={styles.doneBadge}>
                <span className="material-symbols-outlined">check_circle</span>
                Ukończono — brawo!
              </div>
            ) : (
              <motion.button
                className={styles.continueBtn}
                onClick={handleContinue}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Kontynuuj
                <span className="material-symbols-outlined">arrow_forward</span>
              </motion.button>
            )}
          </div>
        </FadeInView>
      </main>
    </PageTransition>
  );
}
