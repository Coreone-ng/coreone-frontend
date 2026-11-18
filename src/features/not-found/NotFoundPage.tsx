import { MarketingPage } from "@/components/layout/MarketingPage/MarketingPage";
import styles from "./NotFoundPage.module.css";
export function NotFoundPage() {
  return (
    <MarketingPage>
      <section className={styles.section} aria-labelledby="not-found-title">
        <div className={styles.grid}>
          <div>
            <p className={styles.label}>404 error</p>
            <h1 id="not-found-title">
              Under
              <br />
              maintenance
            </h1>
            <p className={styles.description}>
              Sorry, the page you are looking for doesn&apos;t exist or has been
              moved. Try searching our site:
            </p>
          </div>
          <img
            src="/assets/website/59_15784.svg"
            width={514}
            height={164}
            alt="404"
          />
        </div>
      </section>
    </MarketingPage>
  );
}
