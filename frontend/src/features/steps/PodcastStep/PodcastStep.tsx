import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PageTransition } from "@/components/animations/PageTransition";
import { FadeInView } from "@/components/animations/FadeInView";
import { AudioPlayer } from "./AudioPlayer";
import { useProgressStore } from "@/store/progressStore";
import { strapiImageUrl } from "@/services/api";
import type { Step, PodcastContent } from "@/types/strapi";
import styles from "./PodcastStep.module.scss";

interface Props {
  step: Step;
}

export function PodcastStep({ step }: Props) {
  const navigate = useNavigate();
  const { markStepComplete, isStepComplete } = useProgressStore();
  const done = isStepComplete(step.documentId);

  const podcastContent = step.content.find(
    (c): c is PodcastContent => c.__component === "step.podcast-content",
  );

  const handleComplete = () => {
    markStepComplete(step.documentId);
  };

  const handleContinue = () => {
    markStepComplete(step.documentId);
    navigate(-1);
  };

  return (
    <PageTransition>
      <div className={styles.page}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <Link to={-1 as never} className={styles.backLink}>
            <span className="material-symbols-outlined">arrow_back</span>
            Podróż
          </Link>
          <div className={styles.sidebarLabel}>
            <div className={styles.bar} />
            <h3>Teraz Odtwarzane</h3>
          </div>
          <p
            style={{
              fontFamily: "'Newsreader', serif",
              fontSize: "1.125rem",
              color: "#1c1c1a",
            }}
          >
            {step.title}
          </p>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                color: "#16a34a",
                fontSize: "0.8125rem",
                marginTop: "1rem",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "1rem" }}
              >
                check_circle
              </span>
              Ukończono
            </motion.div>
          )}
        </aside>

        {/* Main */}
        <main className={styles.main}>
          {/* Podcast Header */}
          <motion.div
            className={styles.podcastHeader}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className={styles.coverWrap}>
              <div className={styles.coverBorder} />
              <div className={styles.coverBadge}>
                <span className="material-symbols-outlined">podcasts</span>
                Podcast
              </div>
              {step.image ? (
                <img
                  src={strapiImageUrl(step.image.url)}
                  alt={step.image.alternativeText ?? step.title}
                  className={styles.cover}
                />
              ) : (
                <div className={styles.coverPlaceholder}>
                  <span className="material-symbols-outlined">podcasts</span>
                </div>
              )}
            </div>

            <div className={styles.podcastInfo}>
              <span className={styles.podcastLabel}>Podcast</span>
              <h1 className={styles.podcastTitle}>{step.title}</h1>
              {step.description && (
                <p className={styles.podcastDesc}>{step.description}</p>
              )}

              {podcastContent ? (
                <AudioPlayer
                  src={podcastContent.audioUrl}
                  stepId={step.documentId}
                  onComplete={handleComplete}
                />
              ) : (
                <p style={{ color: "#7f7663" }}>Brak dostępnego dźwięku.</p>
              )}
            </div>
          </motion.div>

          {/* Transcript */}
          {podcastContent?.transcript && (
            <FadeInView delay={0.15}>
              <div className={styles.transcriptSection}>
                <div className={styles.transcriptHeader}>
                  <h2>Transkrypt</h2>
                </div>
                <div className={styles.transcriptContent}>
                  <div className={styles.transcriptBlock}>
                    <div className={styles.transcriptText}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {podcastContent.transcript}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInView>
          )}

          <FadeInView delay={0.25}>
            <div className={styles.continueRow}>
              <motion.button
                className={styles.continueBtn}
                onClick={handleContinue}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {done ? (
                  <>
                    <span className="material-symbols-outlined">check_circle</span>
                    Kontynuuj
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">task_alt</span>
                    Oznacz jako ukończone i kontynuuj
                  </>
                )}
              </motion.button>
            </div>
          </FadeInView>
        </main>
      </div>
    </PageTransition>
  );
}
