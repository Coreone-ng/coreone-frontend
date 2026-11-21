"use client";
import { useState } from "react";
import { BankWorkflow } from "./BankWorkflow";
import { AppButton, BankTiles, Empty, Icon, Panel, Search } from "./components";
import { money, sampleTransactions } from "./model";
import { useWorkspace } from "./WorkspaceProvider";
import styles from "./Dashboard.module.css";

export function BankTransactions() {
  const { bankConnected, imported } = useWorkspace();
  const [workflow, setWorkflow] = useState<"permissions" | "manual">();
  const [query, setQuery] = useState("");
  const [bank, setBank] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const rows = sampleTransactions.filter(
    (row) =>
      `${row.bank} ${row.description}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (!bank || row.bank === bank) &&
      (!category || row.category === category) &&
      (!date || row.date === date),
  );
  return (
    <>
      <div className={styles.breadcrumb}>
        <Icon name="accounting" />
        Accounting
      </div>
      <div className={styles.pageHeading}>
        <div>
          <h1>Bank Transactions</h1>
          <p>Import and manage your business banking activity.</p>
        </div>
        <div className={styles.headingActions}>
          <AppButton
            variant="secondary"
            onClick={() => setWorkflow("permissions")}
          >
            <Icon name="connect" />
            Connect Bank
          </AppButton>
          <AppButton onClick={() => setWorkflow("manual")}>
            <Icon name="import" />
            Import Transactions
          </AppButton>
        </div>
      </div>
      {bankConnected || imported ? (
        <>
          <p className={styles.inlineNotice}>
            Showing supplied sample transactions. No bank was connected and no
            file contents were imported.
          </p>
          <Panel className={styles.filters}>
            <Search
              value={query}
              onChange={setQuery}
              label="Search transactions"
              placeholder="Search bank, description"
            />
            <label>
              <span className="sr-only">Transaction bank</span>
              <select value={bank} onChange={(e) => setBank(e.target.value)}>
                <option value="">All Banks</option>
                <option>Moniepoint Bank</option>
                <option>United Bank for Africa (UBA)</option>
              </select>
            </label>
            <label>
              <span className="sr-only">Transaction date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label>
              <span className="sr-only">Transaction category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option>Inward transfer</option>
                <option>Web payment</option>
              </select>
            </label>
          </Panel>
          <Panel className={styles.tablePanel}>
            <div
              className={styles.tableScroll}
              role="region"
              aria-label="Sample bank transactions"
              tabIndex={0}
            >
              <table>
                <thead>
                  <tr>
                    {["Date", "Description", "Category", "Amount", "Bank"].map(
                      (label) => (
                        <th scope="col" key={label}>
                          {label}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>Sep 24, 2026</td>
                      <td>{row.description}</td>
                      <td>{row.category}</td>
                      <td>{money(row.amount)}</td>
                      <td>{row.bank}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rows.length === 0 && <Empty>No matching transactions.</Empty>}
            <div className={styles.pagination}>
              <span>Page 1 of 1</span>
            </div>
          </Panel>
        </>
      ) : (
        <Panel className={styles.bankEmpty}>
          <BankTiles />
          <h2>Bring your bank transactions into CoreOne</h2>
          <p>
            Import a bank statement to review your income and expenses,
            categorize transactions, and keep your books accurate.
          </p>
          <div className={styles.dialogActions}>
            <AppButton
              variant="secondary"
              onClick={() => setWorkflow("manual")}
            >
              Upload Transactions
            </AppButton>
            <AppButton onClick={() => setWorkflow("permissions")}>
              Connect
            </AppButton>
          </div>
        </Panel>
      )}
      {workflow && (
        <BankWorkflow
          initial={workflow}
          onClose={() => setWorkflow(undefined)}
        />
      )}
    </>
  );
}
