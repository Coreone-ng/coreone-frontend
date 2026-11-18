import { MarketingPage } from "@/components/layout/MarketingPage/MarketingPage";
import { ProductHero } from "@/components/layout/ProductHero/ProductHero";
import { Action } from "@/components/ui/Action/Action";
import { site } from "@/config/site";
import catalog from "./data/catalog.json";
import { CatalogNavigation } from "./CatalogNavigation";
import styles from "./FeatureCatalogPage.module.css";

export function FeatureCatalogPage() {
  return (
    <MarketingPage tone="cyan">
      <ProductHero
        badge="A foundation for the whole picture"
        title="Features that help you run your business."
        description="From your first invoice to your year-end reports, Coreone keeps every number connected to a single, reliable ledger."
        variant="features"
      >
        <Action href={site.destinations.signup} arrow>
          See It For Yourself
        </Action>
        <Action
          href={site.destinations.demoVideo ?? "#feature-catalog"}
          variant="secondary"
        >
          <img
            src="/assets/home/5-10/71096.svg"
            width={24}
            height={24}
            alt=""
          />
          See How It Works
        </Action>
      </ProductHero>
      <div id="feature-catalog" className={styles.catalog}>
        <div className={styles.grid}>
          <CatalogNavigation sections={catalog} />
          <div>
            {catalog.map((section) => (
              <section
                className={styles.section}
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-title`}
                tabIndex={-1}
              >
                <span className={styles.number}>{section.number}</span>
                <div className={styles.sectionContent}>
                  <header className={styles.heading}>
                    <div>
                      <p>{section.eyebrow}</p>
                      <h2 id={`${section.id}-title`}>{section.title}</h2>
                    </div>
                    {section.icon && (
                      <img
                        src={section.icon}
                        width={44}
                        height={44}
                        alt=""
                        loading="lazy"
                      />
                    )}
                    {section.comingSoon && (
                      <span className={styles.comingSoon}>Coming Soon</span>
                    )}
                  </header>
                  {section.description && (
                    <p className={styles.description}>{section.description}</p>
                  )}
                  {!!section.items.length && (
                    <dl className={styles.items}>
                      {section.items.map((item) => (
                        <div key={item.title}>
                          <dt>{item.title}</dt>
                          <dd>{item.description}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </MarketingPage>
  );
}
