"use client";
import { useId, useRef, useState, type ReactNode } from "react";
import { AppButton, Dialog, Empty, Icon, Panel } from "./components";
import styles from "./Dashboard.module.css";
import ui from "./Modules.module.css";
export function ModuleHeading({
  section,
  title,
  description,
  children,
}: {
  section: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <>
      <div className={styles.breadcrumb}>{section}</div>
      <div className={styles.pageHeading}>
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className={styles.headingActions}>{children}</div>
      </div>
    </>
  );
}
export function SummaryCards({
  items,
}: {
  items: { label: string; value: ReactNode; hint?: string; icon?: string }[];
}) {
  return (
    <Panel className={ui.summaryCards}>
      {items.map((item) => (
        <div key={item.label}>
          <p>
            {item.icon && <Icon name={item.icon} />} {item.label}
          </p>
          <strong>{item.value}</strong>
          {item.hint && <small>{item.hint}</small>}
        </div>
      ))}
    </Panel>
  );
}
export type RowAction = {
  label: string;
  onClick: () => void;
  danger?: boolean;
};
function Actions({ actions, label }: { actions: RowAction[]; label: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  return (
    <details ref={ref} className={ui.actions}>
      <summary aria-label={`Actions for ${label}`}>
        <Icon name="more" />
      </summary>
      <div>
        {actions.map((action) => (
          <button
            key={action.label}
            className={action.danger ? styles.deleteText : ""}
            onClick={() => {
              if (ref.current) ref.current.open = false;
              action.onClick();
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
    </details>
  );
}
export function RecordsTable({
  headers,
  rows,
  label,
  empty = "No data to show yet!",
}: {
  headers: string[];
  rows: { id: string; cells: ReactNode[]; actions?: RowAction[] }[];
  label: string;
  empty?: string;
}) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(rows.length / 8));
  const current = Math.min(page, pages);
  return (
    <Panel className={styles.tablePanel}>
      <div
        className={styles.tableScroll}
        role="region"
        aria-label={label}
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header} scope="col">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice((current - 1) * 8, current * 8).map((row) => (
              <tr key={row.id}>
                {row.cells.map((cell, index) => (
                  <td key={index}>{cell}</td>
                ))}
                {row.actions && (
                  <td className={ui.actionCell}>
                    <Actions label={row.id} actions={row.actions} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <Empty>{empty}</Empty>}
      <div className={styles.pagination}>
        <span>
          Page {current} of {pages}
        </span>
        <div>
          <AppButton
            variant="secondary"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            Previous
          </AppButton>
          <AppButton
            variant="secondary"
            disabled={current === pages}
            onClick={() => setPage(current + 1)}
          >
            Next
          </AppButton>
        </div>
      </div>
    </Panel>
  );
}
export function ConfirmDemo({
  title,
  description,
  onConfirm,
  onClose,
  confirmLabel = "Delete demo record",
}: {
  title: string;
  description?: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmLabel?: string;
}) {
  return (
    <Dialog
      title={title}
      description={
        description ||
        "This changes only the demo records in this tab. Your real account is unchanged."
      }
      onClose={onClose}
    >
      <div className={styles.dialogActions}>
        <AppButton variant="secondary" onClick={onClose}>
          Cancel
        </AppButton>
        <AppButton variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </AppButton>
      </div>
    </Dialog>
  );
}
export function TextArea({
  label,
  name,
  defaultValue,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        name={name}
        defaultValue={defaultValue}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        maxLength={5000}
      />
    </div>
  );
}
export function Attachment({
  name,
  onSelect,
}: {
  name?: string;
  onSelect: (file: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className={styles.field}>
      <label>Supporting attachment (optional)</label>
      <input
        ref={ref}
        hidden
        type="file"
        aria-label="Choose demo attachment"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSelect(file);
        }}
      />
      <button
        type="button"
        className={styles.uploadZone}
        onClick={() => ref.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file) onSelect(file);
        }}
      >
        <Icon name="import" />
        <strong>{name || "Click to upload or drag and drop"}</strong>
        <span>Local selection only. Nothing is uploaded.</span>
      </button>
    </div>
  );
}
export function DemoNotice({ children }: { children?: ReactNode }) {
  return (
    <p className={styles.inlineNotice}>
      {children ||
        "Demo only. Changes reset on refresh and are not sent to your real account."}
    </p>
  );
}
