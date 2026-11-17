import type { ReactNode } from "react";
import styles from "./SectionHeading.module.css";

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className={styles.eyebrow}>{children}</p>;
}
export function SectionHeading({
  children,
  id,
  className = "",
}: {
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <h2 id={id} className={`${styles.heading} ${className}`}>
      {children}
    </h2>
  );
}
