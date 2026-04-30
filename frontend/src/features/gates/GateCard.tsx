import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Gate } from '@/types/strapi'
import { strapiImageUrl } from '@/services/api'
import styles from './GateCard.module.scss'

interface Props {
  gate: Gate
}

export function GateCard({ gate }: Props) {
  return (
    <motion.div
      whileHover={{ scale: 1.025, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      <Link to={`/gate/${gate.slug}`} className={styles.card}>
        <div className={styles.iconWrap}>
          {gate.image ? (
            <img
              src={strapiImageUrl(gate.image.url)}
              alt={gate.image.alternativeText ?? gate.title}
              className={styles.image}
            />
          ) : (
            <span className={`material-symbols-outlined ${styles.iconFallback}`}>
              meeting_room
            </span>
          )}
        </div>
        <h3 className={styles.title}>{gate.title}</h3>
        <p className={styles.description}>{gate.description}</p>
        <div className={styles.cta}>Enter</div>
      </Link>
    </motion.div>
  )
}
