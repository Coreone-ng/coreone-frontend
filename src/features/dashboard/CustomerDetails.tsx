"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ContactForm, DeleteContact } from "./ContactForm";
import {
  AppButton,
  Empty,
  Icon,
  Panel,
  PendingDialog,
  Search,
  Status,
} from "./components";
import {
  contactName,
  initials,
  money,
  sampleInvoices,
  sampleNotes,
  samplePayments,
} from "./model";
import { TransactionDraft } from "./TransactionDraft";
import { useWorkspace } from "./WorkspaceProvider";
import styles from "./Dashboard.module.css";

const tabs = ["Overview", "Invoice", "Payment", "Note"] as const;
const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
export function CustomerDetails({ id }: { id: string }) {
  const { contacts } = useWorkspace();
  const router = useRouter();
  const params = useSearchParams();
  const tab =
    tabs.find((value) => value.toLowerCase() === params.get("tab")) ||
    "Overview";
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState<(typeof contacts)[number]>();
  const [draft, setDraft] = useState<"invoice" | "payment" | "note">();
  const [pending, setPending] = useState("");
  const contact = contacts.find((item) => item.id === id) || deleting;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [date, setDate] = useState("");
  if (!contact)
    return (
      <>
        <div className={styles.breadcrumb}>
          <Link href="/dashboard/customers">Customers</Link> › Customer Info
        </div>
        <Panel>
          <Empty>
            This sample contact is unavailable. Sample changes reset on refresh.
          </Empty>
          <Link className={styles.button} href="/dashboard/customers">
            Back to customers
          </Link>
        </Panel>
      </>
    );
  const name = contactName(contact);
  function switchTab(value: string) {
    router.push(`/dashboard/customers/${id}?tab=${value.toLowerCase()}`, {
      scroll: false,
    });
    setQuery("");
    setFilter("");
    setDate("");
  }
  const invoices = sampleInvoices.filter(
    (row) =>
      row.number.toLowerCase().includes(query.toLowerCase()) &&
      (!filter || row.status === filter) &&
      (!date || row.date === date),
  );
  const payments = samplePayments.filter(
    (row) =>
      `${row.number} ${row.invoice}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!filter || row.method === filter) &&
      (!date || row.date === date),
  );
  const notes = sampleNotes.filter(
    (row) =>
      row.text.toLowerCase().includes(query.toLowerCase()) &&
      (!filter || row.category === filter) &&
      (!date || row.date === date),
  );
  return (
    <>
      <div className={styles.breadcrumb}>
        <Link href="/dashboard/customers">
          <Icon name="customers" />
          Customer
        </Link>
        <span>›</span>
        <span>Customer Info</span>
      </div>
      <div className={styles.pageHeading}>
        <div>
          <h1>Customers</h1>
          <p>Manage your customer in one place</p>
        </div>
        <div className={styles.headingActions}>
          <AppButton variant="secondary" onClick={() => setEditing(true)}>
            <Icon name="edit" />
            Edit Customer Details
          </AppButton>
          <AppButton variant="danger" onClick={() => setDeleting(contact)}>
            <Icon name="delete" />
            Delete Customer
          </AppButton>
        </div>
      </div>
      <Panel className={styles.contactIdentity}>
        <div className={styles.contactIdentityHeading}>
          <h2>Customer Details</h2>
          <span>ID: {contact.id}</span>
        </div>
        <div className={styles.identityGrid}>
          <div>
            <span className={styles.initialAvatar}>{initials(name)}</span>
            <div>
              <strong>{name}</strong>
              <p>{contact.type}</p>
            </div>
          </div>
          <div>
            <small>Email</small>
            <strong>{contact.email}</strong>
          </div>
          <div>
            <small>Registered Country</small>
            <strong>
              <Icon name="ng" />
              {contact.state}, {contact.country}
            </strong>
          </div>
          <div>
            <small>Phone Number</small>
            <strong>{contact.phone}</strong>
          </div>
        </div>
      </Panel>
      <Panel className={styles.detailMetrics}>
        {[
          {
            label: "Outstanding balance",
            value: contact.balance,
            color: "green",
          },
          { label: "Total Invoiced", value: 2400000, color: "purple" },
          { label: "Total Payments Received", value: 2400000, color: "pink" },
          { label: "Overdue", value: 300000, color: "orange" },
        ].map((item, index) => (
          <div key={item.label}>
            <span className={`${styles.metricIcon} ${styles[item.color]}`}>
              <Icon name={`money-${index}`} />
            </span>
            <div>
              <p>{item.label}</p>
              <strong>{money(item.value)}</strong>
            </div>
          </div>
        ))}
      </Panel>
      <div
        className={styles.detailTabs}
        role="tablist"
        aria-label="Customer details"
      >
        {tabs.map((label, index) => (
          <button
            key={label}
            id={`tab-${label}`}
            type="button"
            role="tab"
            aria-controls="customer-panel"
            aria-selected={tab === label}
            tabIndex={tab === label ? 0 : -1}
            onClick={() => switchTab(label)}
            onKeyDown={(event) => {
              if (
                ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
              ) {
                event.preventDefault();
                const next =
                  event.key === "Home"
                    ? 0
                    : event.key === "End"
                      ? 3
                      : (index + (event.key === "ArrowLeft" ? 3 : 1)) % 4;
                switchTab(tabs[next]);
                document.getElementById(`tab-${tabs[next]}`)?.focus();
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <section
        id="customer-panel"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
      >
        <div className={styles.sectionHeading}>
          <h2>{tab}</h2>
          {tab !== "Overview" && (
            <AppButton
              onClick={() =>
                setDraft(
                  tab === "Invoice"
                    ? "invoice"
                    : tab === "Payment"
                      ? "payment"
                      : "note",
                )
              }
            >
              {tab === "Invoice"
                ? "Create Invoice"
                : tab === "Payment"
                  ? "Record Payment"
                  : "Add New Note"}
            </AppButton>
          )}
        </div>
        {tab === "Overview" ? (
          <Panel className={styles.profileOverview}>
            <h3>Overview</h3>
            <dl>
              {[
                { label: "Full Name", value: name },
                { label: "Email", value: contact.email },
                { label: "Phone Number", value: contact.phone },
                { label: "Nationality", value: contact.country },
                { label: "State", value: contact.state },
                { label: "Type", value: <Status>{contact.type}</Status> },
                {
                  label: "Registered Address",
                  value: `${contact.address}, ${contact.state}, ${contact.country}`,
                },
                {
                  label: "Tax identification number (TIN)",
                  value: contact.tin || "—",
                },
                { label: "Legacy TIN", value: contact.legacyTin || "—" },
              ].map((item, index) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        ) : (
          <>
            <Panel className={styles.filters}>
              <Search
                value={query}
                onChange={setQuery}
                label={`Search ${tab.toLowerCase()} records`}
                placeholder={
                  tab === "Invoice"
                    ? "Search invoice ID"
                    : tab === "Payment"
                      ? "Search payment ID or invoice"
                      : "Search notes"
                }
              />
              <label>
                <span className="sr-only">{tab} filter</span>
                <select
                  value={filter}
                  onChange={(event) => setFilter(event.target.value)}
                >
                  <option value="">
                    {tab === "Invoice"
                      ? "Status"
                      : tab === "Payment"
                        ? "Method"
                        : "Category"}
                  </option>
                  {(tab === "Invoice"
                    ? ["Ongoing", "Paid", "Partially Paid", "Overdue"]
                    : tab === "Payment"
                      ? ["Bank Transfer", "Cash"]
                      : ["General", "Payment", "Dispute"]
                  ).map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">Record date</span>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </label>
            </Panel>
            <Panel className={styles.tablePanel}>
              <div
                className={styles.tableScroll}
                role="region"
                aria-label={`${tab} records`}
                tabIndex={0}
              >
                <table>
                  <thead>
                    <tr>
                      {(tab === "Invoice"
                        ? ["No", "Amount", "Due", "Status", "Action"]
                        : tab === "Payment"
                          ? [
                              "Payment ID",
                              "Amount",
                              "Invoice",
                              "Method",
                              "Date",
                              "Action",
                            ]
                          : ["Note", "Category", "Added to", "Date", "Action"]
                      ).map((label) => (
                        <th scope="col" key={label}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tab === "Invoice"
                      ? invoices.map((row) => (
                          <tr key={row.id}>
                            <td>
                              <button
                                className={styles.recordButton}
                                onClick={() =>
                                  setPending("Invoice details are coming next")
                                }
                              >
                                {row.number}
                              </button>
                            </td>
                            <td>{money(row.amount)}</td>
                            <td>{formatDate(row.date)}</td>
                            <td>
                              <Status>{row.status}</Status>
                            </td>
                            <td>
                              <button
                                className={styles.iconButton}
                                aria-label={`Invoice actions ${row.id}`}
                                onClick={() =>
                                  setPending("Invoice actions are coming next")
                                }
                              >
                                <Icon name="more" />
                              </button>
                            </td>
                          </tr>
                        ))
                      : tab === "Payment"
                        ? payments.map((row) => (
                            <tr key={row.id}>
                              <td>{row.number}</td>
                              <td>{money(row.amount)}</td>
                              <td>{row.invoice}</td>
                              <td>{row.method}</td>
                              <td>{formatDate(row.date)}</td>
                              <td>
                                <button
                                  className={styles.iconButton}
                                  aria-label={`Payment actions ${row.id}`}
                                  onClick={() =>
                                    setPending(
                                      "Payment receipt and actions are coming next",
                                    )
                                  }
                                >
                                  <Icon name="more" />
                                </button>
                              </td>
                            </tr>
                          ))
                        : notes.map((row) => (
                            <tr key={row.id}>
                              <td className={styles.noteCell}>{row.text}</td>
                              <td>{row.category}</td>
                              <td>{row.addedTo}</td>
                              <td>{formatDate(row.date)}</td>
                              <td>
                                <button
                                  className={styles.iconButton}
                                  aria-label={`Note actions ${row.id}`}
                                  onClick={() =>
                                    setPending(
                                      "Note editing and deletion are coming next",
                                    )
                                  }
                                >
                                  <Icon name="more" />
                                </button>
                              </td>
                            </tr>
                          ))}
                  </tbody>
                </table>
              </div>
              {(tab === "Invoice"
                ? invoices
                : tab === "Payment"
                  ? payments
                  : notes
              ).length === 0 && <Empty>No matching records.</Empty>}
              <div className={styles.pagination}>
                <span>Page 1 of 1</span>
              </div>
            </Panel>
          </>
        )}
      </section>
      {editing && (
        <ContactForm contact={contact} onClose={() => setEditing(false)} />
      )}{" "}
      {deleting && (
        <DeleteContact
          contact={contact}
          onClose={() => setDeleting(undefined)}
          onDeleted={() => router.replace("/dashboard/customers")}
        />
      )}{" "}
      {draft && (
        <TransactionDraft
          kind={draft}
          contact={contact}
          onClose={() => setDraft(undefined)}
        />
      )}{" "}
      {pending && (
        <PendingDialog title={pending} onClose={() => setPending("")} />
      )}
    </>
  );
}
