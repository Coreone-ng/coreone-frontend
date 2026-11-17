import {
  Eyebrow,
  SectionHeading,
} from "@/components/ui/SectionHeading/SectionHeading";
import { Action } from "@/components/ui/Action/Action";
import styles from "./TestimonialsSection.module.css";

export function TestimonialsSection() {
  return (
    <section className={styles.section} aria-labelledby="testimonials-title">
      <div className={styles.container}>
        <div className={styles.heading}>
          <Eyebrow>Testimonials</Eyebrow>
          <SectionHeading id="testimonials-title">
            Discover what people are saying after using coreone
          </SectionHeading>
        </div>
        <div className={styles.stories} aria-label="Customer stories">
          <div className={styles.outerLeft} aria-hidden="true" />
          <div className={styles.innerLeft} aria-hidden="true" />
          <div className={styles.outerRight} aria-hidden="true" />
          <div className={styles.innerRight} aria-hidden="true" />
          <div className={styles.center}>
            <Action
              variant="text"
              className={styles.play}
              label="Customer story video — currently unavailable"
            >
              <img
                src="/assets/home/41-7484/81407.svg"
                width={80}
                height={80}
                alt=""
              />
            </Action>
          </div>
        </div>
      </div>
    </section>
  );
}
