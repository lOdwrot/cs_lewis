import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { PageTransition } from "@/components/animations/PageTransition";
import { SEO } from "@/components/SEO";
import styles from "./HomePage.module.scss";

export function HomePage() {
  return (
    <PageTransition>
      <SEO
        title="C.S. Lewis: Trzy Drogi do Prawdy"
        description="Eseje, analizy i komentarze ukazujące myśl C.S. Lewisa jako spójną całość, w której wyobraźnia, rozum i wiara wzajemnie się przenikają."
        path="/"
      />
      <main className={styles.page}>
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          C.S. Lewis: Trzy Drogi do Prawdy
        </motion.h1>
        <motion.div
          className={styles.divider}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        <motion.p
          className={styles.body}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
        >
          Lewis nie oddzielał opowieści od argumentu ani argumentu od wiary.
          Uważał, że wyobraźnia przygotowuje grunt dla rozumu, rozum domaga
          się prawdy, a wiara nie niszczy żadnego z nich. Ta strona proponuje
          lekturę Lewisa właśnie w tym duchu — poprzez teksty, które prowadzą
          różnymi drogami ku tym samym pytaniom.
        </motion.p>

        <motion.div
          className={styles.cta}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.35 }}
        >
          <Link to="/portal" className={styles.ctaLink}>
            Wejdź do Wielkiego Portalu
          </Link>
        </motion.div>
      </main>
    </PageTransition>
  );
}
