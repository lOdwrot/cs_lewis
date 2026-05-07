import { PageTransition } from "@/components/animations/PageTransition";
import { Spinner } from "./Spinner";
import styles from "./PageLoading.module.scss";

export function PageLoading() {
  return (
    <PageTransition>
      <main className={styles.wrapper}>
        <Spinner />
      </main>
    </PageTransition>
  );
}
