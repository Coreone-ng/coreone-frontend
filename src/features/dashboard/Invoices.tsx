"use client";
import { useEffect, useState, type FormEvent } from "react";
import {
  AppButton,
  Dialog,
  Field,
  Icon,
  Panel,
  Search,
  Select,
  Status,
} from "./components";
import {
  ConfirmDemo,
  DemoNotice,
  ModuleHeading,
  RecordsTable,
  SummaryCards,
  TextArea,
} from "./ModuleUI";
import { ContactForm } from "./ContactForm";
import { contactName, invoiceTotals, money } from "./model";
import {
  invoiceAmount,
  invoiceBalance,
  invoiceSummary,
  type DemoInvoice,
} from "./demo";
import { useWorkspace } from "./WorkspaceProvider";
import { TransactionDraft } from "./TransactionDraft";
import styles from "./Dashboard.module.css";
import ui from "./Modules.module.css";

export function InvoicePaper({ invoice }: { invoice: DemoInvoice }) {
  const { contacts, demo } = useWorkspace();
  const contact = contacts.find((row) => row.id === invoice.customerId);
  const totals = invoiceTotals(invoice.items, invoice.discount);
  return (
    <article className={ui.printPaper} aria-label="Demo invoice document">
      <div className={ui.paperTop}>
        <div>
          <h2>{demo.settings.businessName}</h2>
          <p>{demo.settings.street}</p>
          <p>
            {demo.settings.city}, {demo.settings.country}
          </p>
          <p>{demo.settings.businessEmail}</p>
        </div>
        <strong className={ui.demoWatermark}>DEMO · NOT FOR PAYMENT</strong>
      </div>
      <h1>INVOICE</h1>
      <div className={ui.paperColumns}>
        <div>
          <small>FROM</small>
          <h3>{demo.settings.businessName}</h3>
          <p>{demo.settings.businessEmail}</p>
        </div>
        <div>
          <small>TO</small>
          <h3>{contact ? contactName(contact) : "Demo customer"}</h3>
          <p>{contact?.address}</p>
          <p>{contact?.email}</p>
        </div>
        <div>
          <p>
            Invoice: <strong>{invoice.number}</strong>
          </p>
          <p>Date issued: {invoice.date}</p>
          <p>Due date: {invoice.dueDate}</p>
        </div>
      </div>
      <h3>{invoice.title}</h3>
      <div className={styles.tableScroll}>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{money(item.rate)}</td>
                <td>{money(item.rate * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className={styles.invoiceTotals}>
        <div>
          <dt>Sub-Total</dt>
          <dd>{money(totals.subtotal)}</dd>
        </div>
        <div>
          <dt>VAT (7.5%) · illustrative</dt>
          <dd>{money(totals.vat)}</dd>
        </div>
        <div>
          <dt>Discount</dt>
          <dd>{money(totals.discount)}</dd>
        </div>
        <div>
          <dt>TOTAL CHARGE · NGN</dt>
          <dd>{money(totals.total)}</dd>
        </div>
      </dl>
      <div className={ui.paperColumns}>
        <div>
          <h3>PAYMENT INFO</h3>
          <p>Demo account — no payment destination configured.</p>
          <p>
            This document is illustrative and cannot be used to request a real
            payment.
          </p>
        </div>
        <div>
          <h3>Customer Notes</h3>
          <p>{invoice.notes}</p>
          <h3>Terms & Conditions</h3>
          <p>{invoice.terms}</p>
        </div>
      </div>
    </article>
  );
}
export function InvoiceEditor({
  invoice,
  contactId,
  onClose,
}: {
  invoice?: DemoInvoice;
  contactId?: string;
  onClose: () => void;
}) {
  const { contacts, demo, setDemo } = useWorkspace();
  const [draft, setDraft] = useState<DemoInvoice>(() =>
    invoice
      ? structuredClone(invoice)
      : {
          id: `invoice-${crypto.randomUUID()}`,
          number: `INV-${String(7811 + demo.invoices.length)}`,
          customerId: contactId || "",
          title: "",
          date: "",
          dueDate: "",
          items: [{ description: "", quantity: 0, rate: 0 }],
          discount: 0,
          notes: "Thank you for your business",
          terms: "",
          paid: 0,
          status: "Draft",
        },
  );
  const [stage, setStage] = useState<
    "edit" | "preview" | "leave" | "send" | "done"
  >("edit");
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [adding, setAdding] = useState(false);
  const [doneText, setDoneText] = useState("");
  const totals = invoiceTotals(draft.items, draft.discount);
  const update = (key: keyof DemoInvoice, value: unknown) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setDirty(true);
    setError("");
  };
  function validate() {
    if (
      !draft.number.trim() ||
      demo.invoices.some(
        (row) => row.id !== draft.id && row.number === draft.number.trim(),
      ) ||
      !draft.customerId ||
      !contacts.some((row) => row.id === draft.customerId) ||
      !draft.title.trim() ||
      !draft.date ||
      !draft.dueDate ||
      draft.dueDate < draft.date ||
      !draft.items.length ||
      draft.items.some(
        (row) => !row.description.trim() || row.quantity <= 0 || row.rate < 0,
      ) ||
      totals.total < draft.paid ||
      totals.total <= 0
    ) {
      setError(
        "Choose a customer, enter a title and valid dates, and add at least one positive invoice item. Use a unique invoice ID. The due date cannot precede the issue date, and the total cannot be less than existing payments.",
      );
      return false;
    }
    return true;
  }
  function save(send = false) {
    const record = {
      ...draft,
      number: draft.number.trim(),
      status:
        !send && (!invoice || invoice.status === "Draft")
          ? "Draft"
          : draft.paid >= totals.total
            ? "Paid"
            : draft.paid > 0
              ? "Partially Paid"
              : invoice?.status === "Overdue"
                ? "Overdue"
                : "Issued",
    } as DemoInvoice;
    setDemo((current) => ({
      ...current,
      invoices: current.invoices.some((row) => row.id === record.id)
        ? current.invoices.map((row) => (row.id === record.id ? record : row))
        : [record, ...current.invoices],
    }));
    setDirty(false);
    return record;
  }
  function leave() {
    if (stage === "leave") {
      setStage("edit");
      return;
    }
    if (dirty) setStage("leave");
    else onClose();
  }
  const selected = contacts.find((row) => row.id === draft.customerId);
  return (
    <>
      <Dialog
        title={
          stage === "edit"
            ? invoice
              ? "Edit Invoice"
              : "New Invoice"
            : stage === "leave"
              ? "You haven’t saved this invoice yet"
              : stage === "send"
                ? "Send Invoice"
                : stage === "done"
                  ? "Demo invoice saved"
                  : "Invoice Preview"
        }
        description={
          stage === "leave"
            ? "Saving this demo invoice won’t send it to your customer. It will only be added to this tab’s demo records."
            : undefined
        }
        drawer={stage === "edit" || stage === "send"}
        className={stage === "preview" ? ui.documentDialog : ""}
        onClose={leave}
      >
        {stage === "edit" ? (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (validate()) setStage("preview");
            }}
          >
            {error && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}
            <Select
              label="Customer name"
              name="customerId"
              value={draft.customerId}
              onChange={(event) => update("customerId", event.target.value)}
            >
              <option value="">Select customer</option>
              {contacts.map((row) => (
                <option key={row.id} value={row.id}>
                  {contactName(row)} · {row.id}
                </option>
              ))}
            </Select>
            <button
              type="button"
              className={styles.textButton}
              onClick={() => setAdding(true)}
            >
              + Add New Customer
            </button>
            <Field
              label="Invoice ID"
              value={draft.number}
              onChange={(event) => update("number", event.target.value)}
              maxLength={100}
            />
            <Field
              label="Title"
              value={draft.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="Enter invoice title"
              maxLength={200}
            />
            <div className={styles.formColumns}>
              <Field
                label="Invoice Date"
                name="invoiceDate"
                type="date"
                value={draft.date}
                onChange={(event) => update("date", event.target.value)}
              />
              <Field
                label="Due Date"
                name="dueDate"
                type="date"
                value={draft.dueDate}
                onChange={(event) => update("dueDate", event.target.value)}
              />
            </div>
            <h3 className={styles.formSubheading}>Product/Service</h3>
            <div className={styles.lineItems}>
              <div className={styles.lineItemHeader}>
                <span>Item Details</span>
                <span>Unit</span>
                <span>Rate</span>
                <span>Amount</span>
                <span />
              </div>
              {draft.items.map((item, index) => (
                <div className={styles.lineItem} key={index}>
                  {(["description", "quantity", "rate"] as const).map((key) => (
                    <label key={key}>
                      <span className="sr-only">
                        Item {index + 1} {key}
                      </span>
                      <input
                        type={key === "description" ? "text" : "number"}
                        min="0"
                        step="any"
                        value={item[key]}
                        onChange={(event) =>
                          update(
                            "items",
                            draft.items.map((row, i) =>
                              i === index
                                ? {
                                    ...row,
                                    [key]:
                                      key === "description"
                                        ? event.target.value
                                        : Math.min(
                                            1e9,
                                            Math.max(
                                              0,
                                              Number(event.target.value) || 0,
                                            ),
                                          ),
                                  }
                                : row,
                            ),
                          )
                        }
                      />
                    </label>
                  ))}
                  <output>{money(item.quantity * item.rate)}</output>
                  <button
                    type="button"
                    aria-label={`Remove item ${index + 1}`}
                    disabled={draft.items.length === 1}
                    onClick={() =>
                      update(
                        "items",
                        draft.items.filter((_, i) => i !== index),
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className={styles.textButton}
              onClick={() =>
                update("items", [
                  ...draft.items,
                  { description: "", quantity: 0, rate: 0 },
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
                      value={draft.discount}
                      onChange={(event) =>
                        update(
                          "discount",
                          Math.min(
                            100,
                            Math.max(0, Number(event.target.value) || 0),
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
            <TextArea
              label="Customer Notes"
              name="notes"
              value={draft.notes}
              onChange={(value) => update("notes", value)}
            />
            <TextArea
              label="Terms & Conditions"
              name="terms"
              value={draft.terms}
              onChange={(value) => update("terms", value)}
              placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
            />
            <div className={styles.dialogActions}>
              <AppButton variant="secondary" onClick={leave}>
                Back
              </AppButton>
              <AppButton type="submit">Preview</AppButton>
            </div>
          </form>
        ) : stage === "preview" ? (
          <>
            <InvoicePaper invoice={draft} />
            <div className={styles.dialogActions}>
              <AppButton variant="secondary" onClick={() => setStage("edit")}>
                Back to edit
              </AppButton>
              <AppButton
                variant="secondary"
                onClick={() => {
                  save();
                  setDoneText(
                    "Your demo invoice is saved in this tab. Nothing was sent.",
                  );
                  setStage("done");
                }}
              >
                Save demo invoice
              </AppButton>
              <AppButton onClick={() => setStage("send")}>Send</AppButton>
            </div>
          </>
        ) : stage === "leave" ? (
          <>
            <div className={styles.dialogActions}>
              <AppButton variant="secondary" onClick={onClose}>
                Leave without Saving
              </AppButton>
              <AppButton
                onClick={() => {
                  if (validate()) {
                    save();
                    onClose();
                  } else setStage("edit");
                }}
              >
                Save and Leave
              </AppButton>
            </div>
            <button
              className={styles.textButton}
              onClick={() => setStage("edit")}
            >
              Keep editing
            </button>
          </>
        ) : stage === "send" ? (
          <form
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.get("to")))) {
                setError("Enter a valid demo recipient email.");
                return;
              }
              save(true);
              setDoneText(
                "Demo delivery complete. No email or message was sent to any recipient.",
              );
              setStage("done");
            }}
          >
            <DemoNotice>
              No email will be sent. This action only demonstrates the send
              flow.
            </DemoNotice>
            {error && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}
            <Field
              label="From"
              defaultValue={demo.settings.businessEmail}
              type="email"
            />
            <Field
              label="To"
              name="to"
              defaultValue={selected?.email}
              type="email"
            />
            <Field
              label="Email Subject"
              defaultValue={`Invoice ${draft.number}`}
            />
            <TextArea
              label="Message"
              name="message"
              defaultValue={`Dear ${selected ? contactName(selected) : "customer"}, we appreciate your business. Please find your invoice details here.`}
            />
            <div className={styles.dialogActions}>
              <AppButton
                variant="secondary"
                onClick={() => setStage("preview")}
              >
                Cancel
              </AppButton>
              <AppButton type="submit">Simulate send</AppButton>
            </div>
          </form>
        ) : (
          <>
            <div className={styles.successMark}>✓</div>
            <p className={styles.inlineNotice} role="status">
              {doneText}
            </p>
            <AppButton onClick={onClose}>Done</AppButton>
          </>
        )}
      </Dialog>
      {adding && (
        <ContactForm
          onSaved={(record) => update("customerId", record.id)}
          onClose={() => setAdding(false)}
        />
      )}
    </>
  );
}
export function Invoices() {
  const { demo, setDemo, contacts } = useWorkspace();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [balance, setBalance] = useState("");
  const [issue, setIssue] = useState("");
  const [due, setDue] = useState("");
  const [edit, setEdit] = useState<DemoInvoice | "new">();
  const [view, setView] = useState<DemoInvoice>();
  const [remove, setRemove] = useState<DemoInvoice>();
  const [message, setMessage] = useState<{
    invoice: DemoInvoice;
    kind: "send" | "reminder" | "share";
  }>();
  const [notice, setNotice] = useState("");
  const [payment, setPayment] = useState<DemoInvoice>();
  const sums = invoiceSummary(demo.invoices);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("invoice");
    if (id) {
      const record = demo.invoices.find((row) => row.id === id);
      if (record) setView(record);
      else
        setNotice(
          "This demo invoice is unavailable. Demo records reset when the page is refreshed.",
        );
    }
  }, []);
  const rows = demo.invoices.filter(
    (row) =>
      `${row.number} ${row.title} ${contacts.find((c) => c.id === row.customerId)?.firstName}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!status || row.status === status) &&
      (!issue || row.date === issue) &&
      (!due || row.dueDate === due) &&
      (!balance ||
        (balance === "unpaid"
          ? invoiceBalance(row) > 0
          : invoiceBalance(row) === 0)),
  );
  return (
    <>
      <ModuleHeading
        section="Invoicing"
        title="Invoices"
        description="Create, manage, and track your customer invoices."
      >
        <AppButton onClick={() => setEdit("new")}>
          <Icon name="add" />
          New Invoice
        </AppButton>
      </ModuleHeading>
      <SummaryCards
        items={[
          {
            label: "Outstanding",
            value: money(sums.outstanding),
            hint: "Unpaid invoice balances",
            icon: "receivable",
          },
          {
            label: "Overdue",
            value: money(sums.overdue),
            hint: "Past due date",
            icon: "payable",
          },
          {
            label: "Paid",
            value: money(sums.paid),
            hint: "Payments allocated",
            icon: "income",
          },
          {
            label: "Drafts",
            value: sums.drafts,
            hint: "Not yet issued",
            icon: "document",
          },
        ]}
      />
      {notice && (
        <p role="status" className={styles.inlineNotice}>
          {notice}
        </p>
      )}
      <Panel className={styles.filters}>
        <Search
          label="Search invoices"
          placeholder="Search Invoice"
          value={query}
          onChange={setQuery}
        />
        <label>
          <span className="sr-only">Issue date</span>
          <input
            type="date"
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">Due date</span>
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">Invoice balance</span>
          <select
            aria-label="Invoice balance"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
          >
            <option value="">All Balance</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid in full</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Invoice status</span>
          <select
            aria-label="Invoice status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            {["Issued", "Paid", "Partially Paid", "Overdue", "Draft"].map(
              (value) => (
                <option key={value}>{value}</option>
              ),
            )}
          </select>
        </label>
      </Panel>
      <RecordsTable
        key={query + status + issue + due + balance}
        label="Demo invoices"
        headers={[
          "Invoice",
          "Customer",
          "Issue date",
          "Due date",
          "Total",
          "Balance due",
          "Status",
          "Action",
        ]}
        rows={rows.map((row) => {
          const customer = contacts.find((c) => c.id === row.customerId);
          return {
            id: row.id,
            cells: [
              <button
                className={styles.recordButton}
                key="id"
                onClick={() => setView(row)}
              >
                {row.number}
              </button>,
              <div key="customer">
                <strong>
                  {customer ? contactName(customer) : "Demo customer"}
                </strong>
                <small>
                  {customer?.state}, {customer?.country}
                </small>
              </div>,
              row.date,
              row.dueDate,
              money(invoiceAmount(row)),
              money(invoiceBalance(row)),
              <Status key="status">{row.status}</Status>,
            ],
            actions: [
              { label: "View", onClick: () => setView(row) },
              { label: "Edit", onClick: () => setEdit(row) },
              {
                label: "Send",
                onClick: () => setMessage({ invoice: row, kind: "send" }),
              },
              { label: "Receive Payment", onClick: () => setPayment(row) },
              {
                label: "Send reminder",
                onClick: () => setMessage({ invoice: row, kind: "reminder" }),
              },
              {
                label: "Copy invoice link",
                onClick: () => setMessage({ invoice: row, kind: "share" }),
              },
              { label: "Delete", danger: true, onClick: () => setRemove(row) },
            ],
          };
        })}
      />
      {edit && (
        <InvoiceEditor
          invoice={edit === "new" ? undefined : edit}
          onClose={() => setEdit(undefined)}
        />
      )}{" "}
      {view && (
        <Dialog
          className={ui.documentDialog}
          title={`Invoice ${view.number}`}
          onClose={() => setView(undefined)}
        >
          <InvoicePaper invoice={view} />
          <div className={styles.dialogActions}>
            <AppButton
              variant="secondary"
              onClick={() => {
                setEdit(view);
                setView(undefined);
              }}
            >
              Edit
            </AppButton>
            <AppButton onClick={() => window.print()}>
              Print / Save PDF
            </AppButton>
          </div>
        </Dialog>
      )}
      {remove && (
        <ConfirmDemo
          title="Delete Invoice?"
          onClose={() => setRemove(undefined)}
          onConfirm={() => {
            setDemo((current) => ({
              ...current,
              invoices: current.invoices.filter((row) => row.id !== remove.id),
            }));
            setRemove(undefined);
            setNotice(
              "Demo invoice deleted. No business records were changed.",
            );
          }}
        />
      )}
      {message && (
        <Dialog
          title={
            message.kind === "share"
              ? "Share invoice link"
              : message.kind === "reminder"
                ? "Send payment reminder"
                : "Send Invoice"
          }
          drawer={message.kind !== "share"}
          onClose={() => setMessage(undefined)}
        >
          {message.kind === "share" ? (
            <>
              <DemoNotice>
                This local preview link opens demo data only. It is not a
                customer-facing invoice URL.
              </DemoNotice>
              <Field
                label="Demo invoice link"
                readOnly
                value={
                  typeof window !== "undefined"
                    ? `${window.location.origin}/dashboard/invoicing?invoice=${encodeURIComponent(message.invoice.id)}`
                    : ""
                }
              />
              <AppButton
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      `${window.location.origin}/dashboard/invoicing?invoice=${encodeURIComponent(message.invoice.id)}`,
                    );
                    setNotice("Demo invoice link copied.");
                    setMessage(undefined);
                  } catch {
                    setNotice(
                      "Clipboard unavailable. Select and copy the visible demo link.",
                    );
                  }
                }}
              >
                Copy
              </AppButton>
            </>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setNotice(
                  message.kind === "reminder"
                    ? "Demo reminder preview complete. No message was sent."
                    : "Demo invoice delivery preview complete. No email was sent.",
                );
                if (message.kind === "send")
                  setDemo((current) => ({
                    ...current,
                    invoices: current.invoices.map((row) =>
                      row.id === message.invoice.id && row.status === "Draft"
                        ? { ...row, status: "Issued" }
                        : row,
                    ),
                  }));
                setMessage(undefined);
              }}
            >
              <DemoNotice>
                No email or reminder will be sent. This is a local
                demonstration.
              </DemoNotice>
              <Field
                label="Send to"
                type="email"
                defaultValue={
                  contacts.find((row) => row.id === message.invoice.customerId)
                    ?.email
                }
                required
              />
              <Field
                label="Email Subject"
                defaultValue={`${message.kind === "reminder" ? "Payment reminder: " : ""}Invoice ${message.invoice.number}`}
              />
              <TextArea
                label="Message"
                name="message"
                defaultValue={`Dear customer, this is ${message.kind === "reminder" ? "a friendly reminder about" : "a preview of"} invoice ${message.invoice.number}. Outstanding balance: ${money(invoiceBalance(message.invoice))}.`}
              />
              <div className={styles.dialogActions}>
                <AppButton
                  variant="secondary"
                  onClick={() => setMessage(undefined)}
                >
                  Cancel
                </AppButton>
                <AppButton type="submit">
                  {message.kind === "reminder"
                    ? "Simulate reminder"
                    : "Simulate send"}
                </AppButton>
              </div>
            </form>
          )}
        </Dialog>
      )}
      {payment && contacts.find((row) => row.id === payment.customerId) && (
        <TransactionDraft
          kind="payment"
          contact={contacts.find((row) => row.id === payment.customerId)!}
          onClose={() => setPayment(undefined)}
        />
      )}
    </>
  );
}
