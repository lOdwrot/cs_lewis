import { PageTransition } from "@/components/animations/PageTransition";
import styles from "./PageError.module.scss";

interface Props {
  title?: string;
  message?: string;
  buttonLabel?: string;
  onRefresh?: () => void;
}

export function PageError({
  title = "Przepraszamy",
  message = "Nie udało się załadować treści. Sprawdź połączenie z internetem i spróbuj ponownie.",
  buttonLabel = "Odśwież stronę",
  onRefresh,
}: Props) {
  const handleClick = () => {
    if (onRefresh) onRefresh();
    else window.location.reload();
  };

  return (
    <PageTransition>
      <main className={styles.wrapper}>
        <div className={styles.card}>
          <span className={`material-symbols-outlined ${styles.icon}`}>
            error_outline
          </span>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.message}>{message}</p>
          <button
            type="button"
            className={styles.button}
            onClick={handleClick}
          >
            <span className="material-symbols-outlined">refresh</span>
            {buttonLabel}
          </button>
        </div>
      </main>
    </PageTransition>
  );
}
