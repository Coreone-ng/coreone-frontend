"use client";
import Link from "next/link";
import { useState } from "react";
import { ContactForm, DeleteContact } from "./ContactForm";
import { AppButton, Empty, Icon, Panel, Search, Status } from "./components";
import { contactName, filterContacts, money, type Contact } from "./model";
import { useWorkspace } from "./WorkspaceProvider";
import styles from "./Dashboard.module.css";

export function Customers() {
  const { contacts } = useWorkspace();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [balance, setBalance] = useState("");
  const [country, setCountry] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<Contact | "new" | null>(null);
  const [deleting, setDeleting] = useState<Contact>();
  const [menu, setMenu] = useState("");
  const filtered = filterContacts(
    contacts,
    query,
    type,
    status,
    balance,
    country,
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 8));
  const currentPage = Math.min(page, pages);
  const shown = filtered.slice((currentPage - 1) * 8, currentPage * 8);
  function change(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
    setMenu("");
  }
  const totals = [
    {
      label: "Total Customers",
      value: contacts.filter((contact) => contact.type === "Customer").length,
      icon: "customer-total",
      color: "purple",
    },
    {
      label: "Total Receivables",
      value: money(
        contacts
          .filter((contact) => contact.type === "Customer")
          .reduce((sum, contact) => sum + contact.balance, 0),
      ),
      icon: "receivable",
      color: "orange",
    },
    {
      label: "Total Payables",
      value: money(
        contacts
          .filter((contact) => contact.type === "Vendor")
          .reduce((sum, contact) => sum + contact.balance, 0),
      ),
      icon: "payable",
      color: "pink",
    },
  ];
  return (
    <>
      <div className={styles.breadcrumb}>
        <Icon name="customers" />
        Customers
      </div>
      <div className={styles.pageHeading}>
        <div>
          <h1>Customers</h1>
          <p>Manage your customer in one place</p>
        </div>
        <AppButton onClick={() => setForm("new")}>
          <Icon name="add" />
          Add New Customer
        </AppButton>
      </div>
      <Panel className={styles.contactStats}>
        {totals.map((item) => (
          <div key={item.label}>
            <p>
              <span className={styles[item.color]}>
                <Icon name={item.icon} />
              </span>
              {item.label}
            </p>
            <strong>{item.value}</strong>
            <p className={styles.trend}>
              <Icon name="info" />
              <span>
                <Icon name="trend" />
                100%
              </span>{" "}
              vs last month
            </p>
          </div>
        ))}
      </Panel>
      <Panel className={styles.filters}>
        <Search
          value={query}
          onChange={(value) => change(setQuery, value)}
          label="Search customers"
          placeholder="Search name, email or phone"
        />
        <label>
          <span className="sr-only">Contact type</span>
          <select
            value={type}
            onChange={(e) => change(setType, e.target.value)}
          >
            <option value="">Type</option>
            <option>Customer</option>
            <option>Vendor</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Contact status</span>
          <select
            value={status}
            onChange={(e) => change(setStatus, e.target.value)}
          >
            <option value="">All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Contact balance</span>
          <select
            value={balance}
            onChange={(e) => change(setBalance, e.target.value)}
          >
            <option value="">All Balance</option>
            <option value="outstanding">Outstanding</option>
            <option value="zero">No balance</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Contact country</span>
          <select
            value={country}
            onChange={(e) => change(setCountry, e.target.value)}
          >
            <option value="">All Country</option>
            <option>Nigeria</option>
          </select>
        </label>
      </Panel>
      <Panel className={styles.tablePanel}>
        <div
          className={styles.tableScroll}
          role="region"
          aria-label="Customer records"
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                {[
                  "Name",
                  "Type",
                  "Email",
                  "Phone",
                  "Receivables / Payables",
                  "Status",
                  "Action",
                ].map((label) => (
                  <th scope="col" key={label}>
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((contact) => (
                <tr key={contact.id}>
                  <td>
                    <Link
                      className={styles.recordLink}
                      href={`/dashboard/customers/${contact.id}`}
                    >
                      {contactName(contact)}
                    </Link>
                    <small>
                      {contact.state}, {contact.country}
                    </small>
                  </td>
                  <td>
                    <Status>{contact.type}</Status>
                  </td>
                  <td>{contact.email}</td>
                  <td>{contact.phone}</td>
                  <td>{money(contact.balance)}</td>
                  <td>
                    <Status>{contact.status}</Status>
                  </td>
                  <td className={styles.rowActions}>
                    <button
                      aria-label={`Actions for ${contactName(contact)} ${contact.id}`}
                      aria-expanded={menu === contact.id}
                      onClick={() =>
                        setMenu(menu === contact.id ? "" : contact.id)
                      }
                    >
                      <Icon name="more" />
                    </button>
                    {menu === contact.id && (
                      <div className={styles.rowMenu}>
                        <Link
                          href={`/dashboard/customers/${contact.id}`}
                          onClick={() => setMenu("")}
                        >
                          <Icon name="eye" />
                          View details
                        </Link>
                        <button
                          onClick={() => {
                            setForm(contact);
                            setMenu("");
                          }}
                        >
                          <Icon name="edit" />
                          Edit customer
                        </button>
                        <button
                          className={styles.deleteText}
                          onClick={() => {
                            setDeleting(contact);
                            setMenu("");
                          }}
                        >
                          <Icon name="delete" />
                          Delete Record
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {shown.length === 0 && (
          <Empty>
            {contacts.length
              ? "No matching customers. Try changing your filters."
              : "No data to show yet!"}
          </Empty>
        )}
        <div className={styles.pagination}>
          <span>
            Page {currentPage} of {pages}
          </span>
          <div>
            <AppButton
              variant="secondary"
              disabled={currentPage === 1}
              onClick={() => {
                setPage(currentPage - 1);
                setMenu("");
              }}
            >
              Previous
            </AppButton>
            <AppButton
              variant="secondary"
              disabled={currentPage === pages}
              onClick={() => {
                setPage(currentPage + 1);
                setMenu("");
              }}
            >
              Next
            </AppButton>
          </div>
        </div>
      </Panel>
      {form && (
        <ContactForm
          contact={form === "new" ? undefined : form}
          onClose={() => setForm(null)}
        />
      )}{" "}
      {deleting && (
        <DeleteContact
          contact={deleting}
          onClose={() => setDeleting(undefined)}
        />
      )}
    </>
  );
}
