import type { ReactNode } from "react";
import styles from "./ProductHero.module.css";
export function ProductHero({
  badge,
  title,
  description,
  children,
  variant = "default",
}: {
  badge: string;
  title: string;
  description: string;
  children?: ReactNode;
  variant?: "default" | "features" | "faq";
}) {
  return (
    <section
      className={`${styles.hero} ${styles[variant]}`}
      aria-labelledby="page-title"
    >
      <div className={styles.container}>
        <span className={styles.badge}>{badge}</span>
        <h1 id="page-title">{title}</h1>
        <img
          className={styles.underline}
          src="/assets/website/30_14654.svg"
          width={709}
          height={16}
          alt=""
        />
        <p className={styles.description}>{description}</p>
        {children && <div className={styles.actions}>{children}</div>}
      </div>
    </section>
  );
}
