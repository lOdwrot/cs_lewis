import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import styles from './Header.module.scss'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <NavLink to="/" className={styles.logo}>
            The Library
          </NavLink>
        </motion.div>

        <motion.nav
          className={styles.nav}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
        >
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
            end
          >
            The Great Portal
          </NavLink>
          <NavLink
            to="/books"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            Books
          </NavLink>
        </motion.nav>
      </div>
    </header>
  )
}
