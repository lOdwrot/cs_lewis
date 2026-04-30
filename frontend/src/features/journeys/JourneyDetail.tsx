import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/animations/PageTransition'
import { FadeInView } from '@/components/animations/FadeInView'
import { useFetch } from '@/hooks/useFetch'
import { getJourney } from '@/services/journeys.service'
import { useProgressStore } from '@/store/progressStore'
import { strapiImageUrl } from '@/services/api'
import type { StepType } from '@/types/strapi'
import styles from './JourneyDetail.module.scss'

const TYPE_ICON: Record<StepType, string> = {
  text: 'description',
  podcast: 'headphones',
  quiz: 'fact_check',
}

const TYPE_LABEL: Record<StepType, string> = {
  text: 'Reading',
  podcast: 'Audio Essay',
  quiz: 'Knowledge Quiz',
}

export function JourneyDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: journey, loading } = useFetch(() => getJourney(slug!), [slug])
  const isStepComplete = useProgressStore((s) => s.isStepComplete)

  return (
    <PageTransition>
      <main className={styles.page}>
        <Link to="/" className={styles.backLink}>
          <span className="material-symbols-outlined">arrow_back</span>
          The Great Portal
        </Link>

        {loading || !journey ? (
          <div style={{ textAlign: 'center', paddingTop: '4rem', color: '#7f7663' }}>Loading…</div>
        ) : (
          <>
            <motion.header
              className={styles.header}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <span className={styles.headerLabel}>The Journey</span>
              <h1 className={styles.headerTitle}>{journey.title}</h1>
              {journey.description && (
                <p className={styles.headerDesc}>{journey.description}</p>
              )}
            </motion.header>

            <div className={styles.timeline}>
              <motion.div
                className={styles.timelineLine}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeInOut' }}
              />

              <div className={styles.steps}>
                {(journey.steps ?? []).map((step, i) => {
                  const done = isStepComplete(step.documentId)
                  return (
                    <FadeInView key={step.id} delay={i * 0.07} direction="left">
                      <div className={styles.stepCard}>
                        <div className={`${styles.dot} ${done ? styles.completed : ''}`} />
                        <Link to={`/step/${step.documentId}`} className={styles.card}>
                          <div className={styles.cardInner}>
                            <div className={styles.cardBody}>
                              <div className={styles.stopBadge}>
                                <span className={styles.stopNumber}>
                                  STOP {String(i + 1).padStart(2, '0')}
                                </span>
                                {done && (
                                  <span className={styles.completedCheck}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>check_circle</span>
                                    Done
                                  </span>
                                )}
                              </div>
                              <h3 className={styles.cardTitle}>{step.title}</h3>
                              <p className={styles.cardDesc}>{step.description}</p>
                              <div className={styles.tags}>
                                <span className={styles.tag}>
                                  <span className={`material-symbols-outlined ${styles.tagIcon}`}>
                                    {TYPE_ICON[step.type]}
                                  </span>
                                  {TYPE_LABEL[step.type]}
                                </span>
                                {step.tags?.map((tag) => (
                                  <span key={tag} className={styles.tag}>{tag}</span>
                                ))}
                              </div>
                            </div>
                            {step.image ? (
                              <img
                                src={strapiImageUrl(step.image.url)}
                                alt={step.image.alternativeText ?? step.title}
                                className={styles.cardThumb}
                              />
                            ) : (
                              <div className={styles.cardThumbPlaceholder}>
                                <span className="material-symbols-outlined">{TYPE_ICON[step.type]}</span>
                              </div>
                            )}
                          </div>
                        </Link>
                      </div>
                    </FadeInView>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </PageTransition>
  )
}
