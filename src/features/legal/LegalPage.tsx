import { MarketingPage } from "@/components/layout/MarketingPage/MarketingPage";
import { LegalContents } from "./LegalContents";
import styles from "./LegalPage.module.css";

type LegalDocument = {
  title: string;
  description: string;
  updated: string;
  sections: {
    id: string;
    label: string;
    title: string;
    paragraphs: string[];
  }[];
};
export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <MarketingPage>
      <header className={styles.intro}>
        <div className={styles.container}>
          <span className={styles.badge}>Legal</span>
          <h1>{document.title}</h1>
          <p className={styles.description}>{document.description}</p>
          <p className={styles.updated}>
            <span>Last Updated</span>{" "}
            <time dateTime="2026-10-12">{document.updated}</time>
          </p>
        </div>
      </header>
      <div className={styles.body}>
        <div className={styles.grid}>
          <LegalContents
            sections={document.sections.map(({ id, title }) => ({ id, title }))}
          />
          <article className={styles.document} aria-label={document.title}>
            {document.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className={styles.section}
                tabIndex={-1}
              >
                <p className={styles.label}>{section.label}</p>
                <h2>{section.title}</h2>
                {section.paragraphs.map((text, i) => (
                  <p className={styles.text} key={i}>
                    {text}
                  </p>
                ))}
              </section>
            ))}
          </article>
        </div>
      </div>
    </MarketingPage>
  );
}
