import type { ButtonHTMLAttributes } from "react";
import styles from "../Action/Action.module.css";
export function Button({
  className = "",
  type = "button",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      type={type}
      className={`${styles.action} ${styles.primary} ${className}`}
    >
      {children}
    </button>
  );
}
