import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Header.module.scss";

const navLinks = [
  { to: "/", label: "Wielki Portal", end: true },
  { to: "/journeys", label: "Wszystkie Przygody" },
  { to: "/books", label: "Książki" },
];

const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const menuVariants = {
  closed: {
    opacity: 0,
    clipPath: "inset(0 0 100% 0 round 0 0 16px 16px)",
    transition: { duration: 0.35, ease: EASE },
  },
  open: {
    opacity: 1,
    clipPath: "inset(0 0 0% 0 round 0 0 16px 16px)",
    transition: { duration: 0.4, ease: EASE },
  },
};

const itemVariants = {
  closed: { opacity: 0, y: -10 },
  open: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 + i * 0.07, duration: 0.3, ease: "easeOut" as const },
  }),
};

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <NavLink to="/" className={styles.logo} onClick={close}>
              C.S. Lewis
            </NavLink>
          </motion.div>

          {/* Desktop nav */}
          <motion.nav
            className={styles.nav}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            {navLinks.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
          </motion.nav>

          {/* Hamburger button — mobile only */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
            aria-expanded={menuOpen}
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            key="mobile-nav"
            className={styles.mobileNav}
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {navLinks.map(({ to, label, end }, i) => (
              <motion.div key={to} custom={i} variants={itemVariants}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `${styles.mobileNavLink} ${isActive ? styles.active : ""}`
                  }
                  onClick={close}
                >
                  {label}
                </NavLink>
              </motion.div>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  const pathProps = {
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    fill: "none",
  };
  const t = { duration: 0.35, ease: "easeInOut" as const };

  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      {/* top line → top-left to bottom-right diagonal */}
      <motion.path
        {...pathProps}
        initial={{ d: "M 5 9 L 23 9" }}
        animate={{ d: open ? "M 7 7 L 21 21" : "M 5 9 L 23 9" }}
        transition={t}
      />
      {/* middle line → fades out */}
      <motion.path
        {...pathProps}
        initial={{ d: "M 5 14 L 23 14", opacity: 1 }}
        animate={{ d: "M 5 14 L 23 14", opacity: open ? 0 : 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      />
      {/* bottom line → bottom-left to top-right diagonal */}
      <motion.path
        {...pathProps}
        initial={{ d: "M 5 19 L 23 19" }}
        animate={{ d: open ? "M 7 21 L 21 7" : "M 5 19 L 23 19" }}
        transition={t}
      />
    </svg>
  );
}
