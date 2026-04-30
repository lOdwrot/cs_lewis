import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Journey } from '@/types/strapi'
import { strapiImageUrl } from '@/services/api'
import styles from './JourneyCard.module.scss'

interface Props {
  journey: Journey
}

export function JourneyCard({ journey }: Props) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
    >
      <Link to={`/journey/${journey.slug}`} className={styles.card}>
        <div className={styles.imageWrap}>
          {journey.image ? (
            <img
              src={strapiImageUrl(journey.image.url)}
              alt={journey.image.alternativeText ?? journey.title}
              className={styles.image}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span className="material-symbols-outlined">auto_stories</span>
            </div>
          )}
        </div>
        <div className={styles.body}>
          <h3 className={styles.title}>{journey.title}</h3>
          <p className={styles.description}>{journey.description}</p>
          <div className={styles.cta}>
            <span>Go to Journey</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
