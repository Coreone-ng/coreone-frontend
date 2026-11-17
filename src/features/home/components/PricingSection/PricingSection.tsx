import { Container } from "@/components/ui/Container/Container";
import { Action } from "@/components/ui/Action/Action";
import { site } from "@/config/site";
import { pricingPlans } from "../../data/pricing";
import styles from "./PricingSection.module.css";

export function PricingSection() {
  return (
    <section
      id="pricing"
      className={styles.section}
      aria-labelledby="pricing-title"
    >
      <Container>
        <h2 className="sr-only" id="pricing-title">
          Plans and pricing
        </h2>
        <div
          className={styles.billing}
          role="group"
          aria-label="Billing period"
        >
          <button type="button" aria-pressed="true">
            Monthly billing
          </button>
          <button
            type="button"
            disabled
            title="Annual pricing is not available yet"
            aria-describedby="annual-note"
          >
            Annual billing
          </button>
        </div>
        <p id="annual-note" className="sr-only">
          Annual billing is currently unavailable. Prices shown are billed
          monthly.
        </p>
        <div className={styles.cards}>
          {pricingPlans.map((plan) => (
            <article
              key={plan.name}
              className={`${styles.tier} ${styles[plan.name.toLowerCase()]} ${plan.popular ? styles.popular : ""}`}
              aria-labelledby={`plan-${plan.name}`}
            >
              {plan.popular && (
                <div className={styles.banner}>Most popular plan</div>
              )}
              <div className={styles.card}>
                <div className={styles.cardHeading}>
                  <p>{plan.eyebrow}</p>
                  <h3 id={`plan-${plan.name}`}>{plan.name}</h3>
                  <p className={styles.price}>
                    ₦{plan.monthly.toLocaleString("en-NG")}
                    <span>/mth</span>
                  </p>
                </div>
                <ul>
                  {plan.features.map((item) => (
                    <li key={item}>
                      <img
                        src="/assets/home/1121-229172/539cb.svg"
                        width={24}
                        height={24}
                        alt=""
                        loading="lazy"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className={styles.actions}>
                  <Action href={site.destinations.signup} arrow>
                    Get Started
                  </Action>
                  <Action href={site.destinations.signup} variant="secondary">
                    Start Free Trial
                  </Action>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
