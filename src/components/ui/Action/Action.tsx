"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { site } from "@/config/site";
import styles from "./Action.module.css";

type ActionProps = {
  children: ReactNode;
  href?: string | null;
  variant?: "primary" | "secondary" | "text";
  arrow?: boolean;
  className?: string;
  label?: string;
  onActivate?: () => void;
};

/** Real links stay native; missing destinations explain their unavailable state. */
export function Action({
  children,
  href,
  variant = "primary",
  arrow = false,
  className = "",
  label,
  onActivate,
}: ActionProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      dialog.current?.querySelector<HTMLButtonElement>("button")?.focus();
    }
  }, [open]);
  const classes = `${styles.action} ${styles[variant]} ${className}`;
  const content = (
    <>
      {children}
      {arrow && (
        <img
          className={styles.arrow}
          src="/assets/home/5-10/b2930.svg"
          width={14}
          height={14}
          alt=""
        />
      )}
    </>
  );
  if (href)
    return (
      <a
        className={classes}
        href={href}
        aria-label={label}
        onClick={onActivate}
      >
        {content}
      </a>
    );
  return (
    <>
      <button
        className={classes}
        type="button"
        aria-label={label}
        aria-haspopup="dialog"
        onClick={() => {
          onActivate?.();
          setOpen(true);
        }}
      >
        {content}
      </button>
      {open &&
        createPortal(
          <dialog
            ref={dialog}
            className={styles.dialog}
            aria-labelledby={titleId}
            onClose={() => setOpen(false)}
            onClick={(event) => {
              if (event.target === event.currentTarget) dialog.current?.close();
            }}
          >
            <h2 id={titleId}>Currently unavailable</h2>
            <p>
              This link is not available yet. You can reach us at{" "}
              <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
            <form method="dialog">
              <button
                className={`${styles.action} ${styles.primary}`}
                autoFocus
              >
                Close
              </button>
            </form>
          </dialog>,
          document.body,
        )}
    </>
  );
}
