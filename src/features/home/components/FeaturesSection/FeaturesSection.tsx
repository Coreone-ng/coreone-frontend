import { Container } from "@/components/ui/Container/Container";
import { Action } from "@/components/ui/Action/Action";
import {
  Eyebrow,
  SectionHeading,
} from "@/components/ui/SectionHeading/SectionHeading";
import { site } from "@/config/site";
import { FeatureTabs } from "./FeatureTabs";
import styles from "./FeaturesSection.module.css";

export function FeaturesSection() {
  return (
    <section
      id="features"
      className={styles.section}
      aria-labelledby="features-title"
    >
      <Container>
        <div className={styles.intro}>
          <div>
            <Eyebrow>One connected view</Eyebrow>
            <SectionHeading id="features-title">
              Manage everything
              <br />
              in one place.
            </SectionHeading>
          </div>
          <div className={styles.summary}>
            <p>
              Less time chasing numbers. More confidence in the decisions right
              in front of you.
            </p>
            <Action href={site.destinations.signup}>Get Started</Action>
          </div>
        </div>
        <FeatureTabs />
      </Container>
    </section>
  );
}
