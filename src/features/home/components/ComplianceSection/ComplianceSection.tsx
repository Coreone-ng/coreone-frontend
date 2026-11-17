import { Container } from "@/components/ui/Container/Container";
import {
  Eyebrow,
  SectionHeading,
} from "@/components/ui/SectionHeading/SectionHeading";
import { Action } from "@/components/ui/Action/Action";
import { site } from "@/config/site";
import styles from "./ComplianceSection.module.css";

export function ComplianceSection() {
  return (
    <section
      id="compliance"
      className={styles.section}
      aria-labelledby="compliance-title"
    >
      <Container className={styles.columns}>
        <div>
          <Eyebrow>Built for businesses</Eyebrow>
          <div className={styles.title}>
            <SectionHeading id="compliance-title">
              Ready for every
              <br />
              market’s tax rules.
            </SectionHeading>
            <img
              src="/assets/home/26-891/cea2b.svg"
              width={531}
              height={16.2521}
              alt=""
              loading="lazy"
            />
          </div>
          <p className={styles.body}>
            Coreone is designed to adapt to the tax and invoicing requirements
            of the country where your business operates. Starting with Nigeria,
            Coreone supports tax-aware financial records, flexible tax settings
            and compliance-ready data, with the ability to support other markets
            as your business grows.
          </p>
        </div>
        <div className={styles.secondary}>
          <Eyebrow>Starting in Nigeria · Designed to adapt</Eyebrow>
          <h3>
            Local requirements.
            <br />
            Room to grow.
          </h3>
          <p>
            Explore tax and compliance features for businesses preparing to
            expand across markets.
          </p>
          <Action href={site.destinations.compliance} arrow>
            Learn More
          </Action>
        </div>
      </Container>
    </section>
  );
}
