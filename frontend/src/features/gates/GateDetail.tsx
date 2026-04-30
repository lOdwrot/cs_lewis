import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageTransition } from '@/components/animations/PageTransition'
import { StaggerList, StaggerItem } from '@/components/animations/StaggerList'
import { JourneyCard } from '@/features/journeys/JourneyCard'
import { useFetch } from '@/hooks/useFetch'
import { getGate } from '@/services/gates.service'
import styles from './GateDetail.module.scss'

export function GateDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: gate, loading } = useFetch(() => getGate(slug!), [slug])

  return (
    <PageTransition>
      <main className={styles.page}>
        <Link to="/" className={styles.backLink}>
          <span className="material-symbols-outlined">arrow_back</span>
          The Great Portal
        </Link>

        {loading || !gate ? (
          <div style={{ textAlign: 'center', paddingTop: '4rem', color: '#7f7663' }}>
            Loading…
          </div>
        ) : (
          <>
            <section className={styles.hero}>
              <motion.span
                className={styles.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                Gate
              </motion.span>
              <motion.h1
                className={styles.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
              >
                {gate.title}
              </motion.h1>
              {gate.description && (
                <motion.p
                  className={styles.description}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.15 }}
                >
                  {gate.description}
                </motion.p>
              )}
              <div className={styles.divider} />
            </section>

            <StaggerList className={styles.grid}>
              {(gate.journeys ?? []).map((journey) => (
                <StaggerItem key={journey.id}>
                  <JourneyCard journey={journey} />
                </StaggerItem>
              ))}
            </StaggerList>
          </>
        )}
      </main>
    </PageTransition>
  )
}
