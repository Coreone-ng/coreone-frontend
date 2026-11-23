"use client";
import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
} from "react";
import { Button } from "@/components/ui/Button/Button";
import styles from "./Dashboard.module.css";
export function Icon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <img
      src={`/assets/dashboard/${name}.svg`}
      alt=""
      aria-hidden="true"
      className={`${styles.icon} ${className}`}
    />
  );
}
export function AppButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <Button
      {...props}
      className={`${styles.button} ${styles[variant]} ${className}`}
    >
      {children}
    </Button>
  );
}
export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${styles.panel} ${className}`}>{children}</section>
  );
}
export function Dialog({
  title,
  description,
  children,
  onClose,
  drawer = false,
  leading,
  className = "",
  sample = true,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  drawer?: boolean;
  leading?: ReactNode;
  className?: string;
  sample?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    const focus = document.activeElement;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = previous;
      if (focus instanceof HTMLElement && focus.isConnected) focus.focus();
    };
  }, []);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog?.open) {
      dialog.scrollTop = 0;
      dialog.querySelector("h2")?.focus({ preventScroll: true });
    }
  }, [title]);
  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${drawer ? styles.drawer : ""} ${className}`}
      aria-labelledby={id}
      aria-describedby={description ? `${id}-description` : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const r = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < r.left ||
            event.clientX > r.right ||
            event.clientY < r.top ||
            event.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className={styles.dialogInner}>
        <button
          className={styles.close}
          type="button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          ×
        </button>
        {sample && <span className={styles.samplePill}>Sample workspace</span>}
        {leading}
        <h2 id={id} tabIndex={-1}>
          {title}
        </h2>
        {description && (
          <p id={`${id}-description`} className={styles.muted}>
            {description}
          </p>
        )}
        {children}
      </div>
    </dialog>
  );
}
export function PendingDialog({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <Dialog
      title={title}
      description="This flow is pending a future handoff. No business records have been changed."
      onClose={onClose}
    >
      <AppButton onClick={onClose}>Got it</AppButton>
    </Dialog>
  );
}
export function Field({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <input
        {...props}
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <span id={`${id}-error`} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
}
export function Select({
  label,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <select {...props} id={id}>
        {children}
      </select>
    </div>
  );
}
export function Search({
  value,
  onChange,
  label = "Search",
  placeholder = label,
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
}) {
  return (
    <label className={styles.search}>
      <span className="sr-only">{label}</span>
      <Icon name="search" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
export function Status({ children }: { children: ReactNode }) {
  return (
    <span
      className={`${styles.status} ${children === "Inactive" || children === "Draft" || children === "Demo 2FA Disabled" ? styles.inactive : children === "Overdue" || children === "Not Balanced" ? styles.warning : children === "Customer" || children === "Ongoing" || children === "Issued" ? styles.purple : children === "Vendor" || children === "Partially Paid" ? styles.pink : ""}`}
    >
      • {children}
    </span>
  );
}
export function Empty({
  children = "No data to show yet!",
}: {
  children?: ReactNode;
}) {
  return (
    <div className={styles.empty}>
      <Icon name="document" />
      <p>{children}</p>
    </div>
  );
}
export function BankTiles() {
  return (
    <div className={styles.bankTiles}>
      <img src="/assets/dashboard/bank-tile.svg" alt="Bank" />
      <Icon name="arrow-right" />
      <img src="/assets/dashboard/coreone-tile.svg" alt="CoreOne" />
    </div>
  );
}
