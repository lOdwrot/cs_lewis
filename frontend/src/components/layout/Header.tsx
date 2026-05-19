import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTopMenuQuery } from "@/hooks/queries";
import { strapiImageUrl } from "@/services/api";
import type { TopMenuRedirect } from "@/types/strapi";
import styles from "./Header.module.scss";

// Map CMS redirect enum → actual URL paths
const REDIRECT_PATHS: Record<TopMenuRedirect, string> = {
  home: "/",
  portal: "/portal",
  journeys: "/journeys",
  library: "/library",
  biography: "/biography",
  encyclopedia: "/encyclopedia",
  books: "/books",
  news: "/news",
  publikacje: "/publikacje",
};

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
    transition: {
      delay: 0.08 + i * 0.07,
      duration: 0.3,
      ease: "easeOut" as const,
    },
  }),
};

// ── Fancy tooltip ──────────────────────────────────────────────────────────
interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

function NavTooltip({ text, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={styles.tooltipAnchor}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            className={styles.tooltip}
            initial={{
              opacity: 0,
              y: 14,
              scale: 0.82,
              x: "-50%",
              filter: "blur(6px)",
              rotateX: -18,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              x: "-50%",
              filter: "blur(0px)",
              rotateX: 0,
            }}
            exit={{
              opacity: 0,
              y: 8,
              scale: 0.9,
              x: "-50%",
              filter: "blur(4px)",
              rotateX: -10,
            }}
            transition={{
              type: "spring",
              stiffness: 320,
              damping: 18,
              mass: 0.7,
              opacity: { duration: 0.22, ease: "easeOut" },
              filter: { duration: 0.28, ease: "easeOut" },
              rotateX: { type: "spring", stiffness: 280, damping: 20 },
            }}
            style={{ transformPerspective: 600 }}
          >
            <span className={styles.tooltipArrow} />
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Skeleton pieces ────────────────────────────────────────────────────────
function LogoSkeleton() {
  return <div className={`${styles.skeleton} ${styles.skeletonLogo}`} />;
}

function NavSkeleton() {
  return (
    <>
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className={`${styles.skeleton} ${styles.skeletonNavItem}`}
          style={{ width: `${52 + (i % 3) * 18}px` }}
        />
      ))}
    </>
  );
}

// ── Main Header ────────────────────────────────────────────────────────────
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: topMenu, isLoading } = useTopMenuQuery();

  const close = () => setMenuOpen(false);

  const navItems = topMenu?.navItems ?? [];

  const logoContent = (() => {
    if (isLoading) return <LogoSkeleton />;
    if (topMenu?.homeImage?.url) {
      return (
        <img
          src={strapiImageUrl(topMenu.homeImage.url)}
          alt={topMenu.homeImage.alternativeText ?? "Logo"}
          className={styles.logoImage}
        />
      );
    }
    return topMenu?.homeText ?? "C.S. Lewis";
  })();

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
              {logoContent}
            </NavLink>
          </motion.div>

          {/* Desktop nav */}
          <motion.nav
            className={styles.nav}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          >
            {isLoading ? (
              <NavSkeleton />
            ) : (
              navItems.map(({ id, label, hoverText, redirect }) => {
                const to = REDIRECT_PATHS[redirect] ?? "/";
                const link = (
                  <NavLink
                    key={id}
                    to={to}
                    className={({ isActive }) =>
                      `${styles.navLink} ${isActive ? styles.active : ""}`
                    }
                  >
                    {label}
                  </NavLink>
                );
                return hoverText ? (
                  <NavTooltip key={id} text={hoverText}>
                    {link}
                  </NavTooltip>
                ) : (
                  link
                );
              })
            )}
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
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`${styles.skeleton} ${styles.skeletonMobileNavItem}`}
                  />
                ))
              : navItems.map(({ id, label, redirect }, i) => (
                  <motion.div key={id} custom={i} variants={itemVariants}>
                    <NavLink
                      to={REDIRECT_PATHS[redirect] ?? "/"}
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
