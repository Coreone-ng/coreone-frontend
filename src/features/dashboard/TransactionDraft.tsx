"use client";
import { useRef, useState, type FormEvent } from "react";
import { AppButton, Dialog, Field, Select } from "./components";
import {
  contactName,
  invoiceTotals,
  money,
  type Contact,
  type InvoiceItem,
} from "./model";
import styles from "./Dashboard.module.css";

export function TransactionDraft({
  kind,
  contact,
  onClose,
}: {
  kind: "invoice" | "payment" | "note";
  contact: Contact;
  onClose: () => void;
}) {
  const [items, setItems] = useState<(InvoiceItem & { id: number })[]>([
    { id: 1, description: "", quantity: 0, rate: 0 },
  ]);
  const nextId = useRef(2);
  const [discount, setDiscount] = useState(0);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);
  const totals = invoiceTotals(items, discount);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setNotice("");
    setError("");
    const invalidInvoice =
      kind === "invoice" &&
      (!data.get("invoiceDate") ||
        !data.get("dueDate") ||
        String(data.get("dueDate")) < String(data.get("invoiceDate")) ||
        items.some(
          (item) =>
            !item.description.trim() || item.quantity <= 0 || item.rate < 0,
        ));
    const invalidPayment =
      kind === "payment" &&
      (!(Number(data.get("amount")) > 0) ||
        !data.get("paymentDate") ||
        !data.get("method"));
    if (
      invalidInvoice ||
      invalidPayment ||
      (kind === "note" && !String(data.get("notes") || "").trim())
    ) {
      setError(
        kind === "invoice"
          ? "Add an item with a positive quantity and valid invoice/due dates. Due date must be on or after invoice date."
          : kind === "payment"
            ? "Enter a positive amount, payment date, and method."
            : "Enter a note before continuing.",
      );
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    setNotice(
      `${kind === "invoice" ? "Invoice" : kind === "payment" ? "Payment" : "Note"} preview and final submission are pending the next handoff. This draft has not been saved.`,
    );
  }
  const title =
    kind === "invoice"
      ? "New Invoice"
      : kind === "payment"
        ? "Record Payment"
        : "Add Note";
  function updateItem(id: number, key: keyof InvoiceItem, value: string) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              [key]:
                key === "description"
                  ? value
                  : Math.min(
                      key === "quantity" ? 1000000 : 1000000000,
                      Math.max(
                        0,
                        Number.isFinite(Number(value)) ? Number(value) : 0,
                      ),
                    ),
            }
          : item,
      ),
    );
  }
  return (
    <Dialog title={title} drawer onClose={onClose}>
      <form onSubmit={submit} noValidate>
        {error && (
          <p ref={errorRef} tabIndex={-1} role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <Select label="Customer name" value={contact.id} disabled>
          <option value={contact.id}>
            {contactName(contact).toUpperCase()}
          </option>
        </Select>
        {kind === "invoice" ? (
          <>
            <Field
              label="Invoice ID"
              name="invoiceId"
              defaultValue="INV-7811"
              maxLength={100}
            />
            <div className={styles.formColumns}>
              <Field
                label="Invoice Date"
                name="invoiceDate"
                type="date"
                required
              />
              <Field label="Due Date" name="dueDate" type="date" required />
            </div>
            <h3 className={styles.formSubheading}>Product/Service</h3>
            <div className={styles.lineItems}>
              <div className={styles.lineItemHeader}>
                <span>Item details</span>
                <span>Unit</span>
                <span>Rate</span>
                <span>Amount</span>
                <span />
              </div>
              {items.map((item, index) => (
                <div className={styles.lineItem} key={item.id}>
                  <label>
                    <span className="sr-only">
                      Item {index + 1} description
                    </span>
                    <input
                      value={item.description}
                      onChange={(e) =>
                        updateItem(item.id, "description", e.target.value)
                      }
                      placeholder="Type item description"
                      maxLength={500}
                      required
                    />
                  </label>
                  <label>
                    <span className="sr-only">Item {index + 1} quantity</span>
                    <input
                      type="number"
                      min="0"
                      max="1000000"
                      step="any"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, "quantity", e.target.value)
                      }
                      required
                    />
                  </label>
                  <label>
                    <span className="sr-only">Item {index + 1} rate</span>
                    <input
                      type="number"
                      min="0"
                      max="1000000000"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(item.id, "rate", e.target.value)
                      }
                      required
                    />
                  </label>
                  <output aria-label={`Item ${index + 1} amount`}>
                    {money(item.quantity * item.rate)}
                  </output>
                  <button
                    type="button"
                    aria-label={`Remove item ${index + 1}`}
                    disabled={items.length === 1}
                    onClick={() =>
                      setItems((current) =>
                        current.filter((row) => row.id !== item.id),
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              className={styles.textButton}
              type="button"
              onClick={() =>
                setItems((current) => [
                  ...current,
                  {
                    id: nextId.current++,
                    description: "",
                    quantity: 0,
                    rate: 0,
                  },
                ])
              }
            >
              + Add New Row
            </button>
            <dl className={styles.invoiceTotals}>
              <div>
                <dt>Sub-Total</dt>
                <dd>{money(totals.subtotal)}</dd>
              </div>
              <div>
                <dt>VAT (7.5%)</dt>
                <dd>{money(totals.vat)}</dd>
              </div>
              <div>
                <dt>
                  <label>
                    Discount{" "}
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={discount}
                      onChange={(e) =>
                        setDiscount(
                          Math.min(
                            100,
                            Math.max(0, Number(e.target.value) || 0),
                          ),
                        )
                      }
                    />
                    %
                  </label>
                </dt>
                <dd>{money(totals.discount)}</dd>
              </div>
              <div>
                <dt>Grand total (NGN)</dt>
                <dd>{money(totals.total)}</dd>
              </div>
            </dl>
            <div className={styles.field}>
              <label htmlFor="customerNotes">Customer Notes</label>
              <textarea
                id="customerNotes"
                name="customerNotes"
                placeholder="Thank you for your business"
                maxLength={5000}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="terms">Terms & Conditions</label>
              <textarea
                id="terms"
                name="terms"
                placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
                maxLength={5000}
              />
            </div>
          </>
        ) : kind === "payment" ? (
          <>
            <Field
              label="Payment ID"
              name="paymentId"
              defaultValue="PMT-0018"
              maxLength={100}
            />
            <Field
              label="Amount Received"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
            />
            <Select label="Select Invoice" name="invoice">
              <option>INV-028</option>
            </Select>
            <div className={styles.formColumns}>
              <Field
                label="Payment Date"
                name="paymentDate"
                type="date"
                required
              />
              <Select
                label="Payment Method"
                name="method"
                defaultValue=""
                required
              >
                <option value="">Select</option>
                <option>Bank Transfer</option>
                <option>Cash</option>
              </Select>
            </div>
            <div className={styles.field}>
              <label htmlFor="paymentNotes">Payment Notes</label>
              <textarea
                id="paymentNotes"
                name="paymentNotes"
                placeholder="Thank you for your business"
                maxLength={5000}
              />
            </div>
          </>
        ) : (
          <>
            <Select label="Select Category" name="category">
              <option>General</option>
              <option>Payment</option>
              <option>Dispute</option>
            </Select>
            <div className={styles.field}>
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                placeholder="Enter details about this customer, conversation or follow up"
                maxLength={5000}
                required
              />
            </div>
          </>
        )}
        {notice && (
          <p className={styles.inlineNotice} role="status">
            {notice}
          </p>
        )}
        <p className={styles.small}>
          Sample draft only. No invoice, payment, or note is submitted.
        </p>
        <div className={styles.dialogActions}>
          <AppButton variant="secondary" onClick={onClose}>
            {kind === "invoice" ? "Cancel" : "Back"}
          </AppButton>
          <AppButton type="submit">Preview</AppButton>
        </div>
      </form>
    </Dialog>
  );
}
