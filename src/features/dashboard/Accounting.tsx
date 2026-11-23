"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AppButton,
  Dialog,
  Field,
  Panel,
  Search,
  Select,
  Status,
} from "./components";
import {
  Attachment,
  ConfirmDemo,
  DemoNotice,
  ModuleHeading,
  RecordsTable,
  SummaryCards,
  TextArea,
} from "./ModuleUI";
import {
  downloadDemoCsv,
  journalErrors,
  journalTotals,
  ledgerRows,
  reconcileTransactions,
  reconciliationTotals,
  type DemoAccount,
  type DemoJournal,
  type DemoReconciliation,
  type JournalLine,
} from "./demo";
import { money } from "./model";
import { useWorkspace } from "./WorkspaceProvider";
import styles from "./Dashboard.module.css";
import ui from "./Modules.module.css";

export function JournalDetails({
  journal,
  onClose,
}: {
  journal: DemoJournal;
  onClose: () => void;
}) {
  const { demo } = useWorkspace();
  const sums = journalTotals(journal.lines);
  const [attachment, setAttachment] = useState(false);
  return (
    <Dialog title="Journal Entry Details" drawer onClose={onClose}>
      <div className={ui.detailSection}>
        <small>Journal Title</small>
        <h3>{journal.title}</h3>
      </div>
      <div className={ui.detailSection}>
        <h3>Journal information</h3>
        <dl className={ui.detailList}>
          <div>
            <dt>Journal number</dt>
            <dd>{journal.number}</dd>
          </div>
          <div>
            <dt>Journal date</dt>
            <dd>{journal.date}</dd>
          </div>
          <div>
            <dt>Created by</dt>
            <dd>{journal.author}</dd>
          </div>
        </dl>
      </div>
      <h3>Journal lines</h3>
      <RecordsTable
        label="Demo journal lines"
        headers={["Account", "Description", "Debit (₦)", "Credit (₦)"]}
        rows={journal.lines.map((line, index) => ({
          id: String(index),
          cells: [
            demo.accounts.find((row) => row.id === line.accountId)?.name ||
              "Demo account",
            line.description,
            money(line.debit),
            money(line.credit),
          ],
        }))}
      />
      <dl className={styles.invoiceTotals}>
        <div>
          <dt>Total debits</dt>
          <dd>{money(sums.debit)}</dd>
        </div>
        <div>
          <dt>Total credits</dt>
          <dd>{money(sums.credit)}</dd>
        </div>
        <div>
          <dt>Difference</dt>
          <dd>{money(sums.difference)}</dd>
        </div>
      </dl>
      <p className={sums.balanced ? styles.inlineNotice : styles.error}>
        {sums.balanced ? "Journal is balanced" : "Journal is not balanced"} ·
        demo
      </p>
      <div className={ui.detailSection}>
        <h3>Supporting attachment</h3>
        <button
          className={styles.textButton}
          onClick={() => setAttachment(!attachment)}
        >
          View Document
        </button>
        {attachment && (
          <DemoNotice>
            {journal.attachment || "No supporting document was supplied."}{" "}
            Attachment contents are not uploaded in demo mode.
          </DemoNotice>
        )}
      </div>
      <div className={ui.detailSection}>
        <h3>Memo</h3>
        <p>{journal.memo}</p>
      </div>
    </Dialog>
  );
}
function JournalEditor({
  journal,
  onClose,
}: {
  journal?: DemoJournal;
  onClose: () => void;
}) {
  const { demo, setDemo } = useWorkspace();
  const [draft, setDraft] = useState<DemoJournal>(() =>
    journal
      ? structuredClone(journal)
      : {
          id: `journal-${crypto.randomUUID()}`,
          number: String(134 + demo.journals.length),
          title: "",
          date: "",
          description: "",
          memo: "",
          author: "Pomaline Moses",
          lines: [
            { accountId: "", description: "", debit: 0, credit: 0 },
            { accountId: "", description: "", debit: 0, credit: 0 },
          ],
        },
  );
  const [error, setError] = useState("");
  const sums = journalTotals(draft.lines);
  function line(index: number, key: keyof JournalLine, value: string) {
    setDraft((current) => ({
      ...current,
      lines: current.lines.map((row, i) =>
        i === index
          ? {
              ...row,
              [key]:
                key === "debit" || key === "credit"
                  ? Math.min(1e12, Math.max(0, Number(value) || 0))
                  : value,
            }
          : row,
      ),
    }));
    setError("");
  }
  return (
    <Dialog
      title={journal ? "Edit journal entry" : "New journal entry"}
      drawer
      onClose={onClose}
    >
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const invalid = journalErrors(draft);
          if (invalid) {
            setError(invalid);
            return;
          }
          setDemo((current) => ({
            ...current,
            journals: journal
              ? current.journals.map((row) =>
                  row.id === draft.id ? draft : row,
                )
              : [draft, ...current.journals],
          }));
          onClose();
        }}
      >
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <Field
          label="Journal Date"
          name="journalDate"
          type="date"
          value={draft.date}
          onChange={(e) => setDraft({ ...draft, date: e.target.value })}
        />
        <Field
          label="Journal No"
          value={draft.number}
          onChange={(e) => setDraft({ ...draft, number: e.target.value })}
        />
        <Field
          label="Journal Title"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          placeholder="Enter Journal Title"
          maxLength={200}
        />
        <TextArea
          label="Description"
          name="description"
          value={draft.description}
          onChange={(value) => setDraft({ ...draft, description: value })}
          placeholder="Describe why this journal entry is needed"
        />
        <h3 className={styles.formSubheading}>Journal lines</h3>
        {draft.lines.map((row, index) => (
          <fieldset className={ui.journalLine} key={index}>
            <legend>Line {index + 1}</legend>
            <Select
              label={`Account ${index + 1}`}
              value={row.accountId}
              onChange={(e) => line(index, "accountId", e.target.value)}
            >
              <option value="">Select Account</option>
              {demo.accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </Select>
            <Field
              label={`Description ${index + 1}`}
              value={row.description}
              onChange={(e) => line(index, "description", e.target.value)}
              placeholder="Enter Description"
            />
            <div className={styles.formColumns}>
              <Field
                label={`Debit (₦) ${index + 1}`}
                type="number"
                min="0"
                step="0.01"
                value={row.debit}
                onChange={(e) => line(index, "debit", e.target.value)}
              />
              <Field
                label={`Credit (₦) ${index + 1}`}
                type="number"
                min="0"
                step="0.01"
                value={row.credit}
                onChange={(e) => line(index, "credit", e.target.value)}
              />
            </div>
            <button
              type="button"
              className={styles.textButton}
              disabled={draft.lines.length <= 2}
              onClick={() =>
                setDraft({
                  ...draft,
                  lines: draft.lines.filter((_, i) => i !== index),
                })
              }
            >
              Remove line {index + 1}
            </button>
          </fieldset>
        ))}
        <button
          type="button"
          className={styles.textButton}
          onClick={() =>
            setDraft({
              ...draft,
              lines: [
                ...draft.lines,
                { accountId: "", description: "", debit: 0, credit: 0 },
              ],
            })
          }
        >
          + Add Journal Line
        </button>
        <dl className={styles.invoiceTotals}>
          <div>
            <dt>Total debits</dt>
            <dd>{money(sums.debit)}</dd>
          </div>
          <div>
            <dt>Total credits</dt>
            <dd>{money(sums.credit)}</dd>
          </div>
          <div>
            <dt>Difference</dt>
            <dd>{money(sums.difference)}</dd>
          </div>
        </dl>
        <Attachment
          name={draft.attachment}
          onSelect={(file) => setDraft({ ...draft, attachment: file.name })}
        />
        <TextArea
          label="Memo"
          name="memo"
          value={draft.memo}
          onChange={(value) => setDraft({ ...draft, memo: value })}
        />
        <div className={styles.dialogActions}>
          <AppButton variant="secondary" onClick={onClose}>
            Back
          </AppButton>
          <AppButton type="submit">Save demo journal</AppButton>
        </div>
      </form>
    </Dialog>
  );
}
export function Journals() {
  const { demo, setDemo } = useWorkspace();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");
  const [edit, setEdit] = useState<DemoJournal | "new">();
  const [view, setView] = useState<DemoJournal>();
  const [remove, setRemove] = useState<DemoJournal>();
  const rows = demo.journals.filter(
    (row) =>
      `${row.title} ${row.number}`.toLowerCase().includes(q.toLowerCase()) &&
      (!date || row.date === date) &&
      (!status ||
        (status === "balanced"
          ? journalTotals(row.lines).balanced
          : !journalTotals(row.lines).balanced)),
  );
  return (
    <>
      <ModuleHeading
        section="Accounting"
        title="Journal Entries"
        description="Create and manage manual accounting adjustments."
      >
        <AppButton onClick={() => setEdit("new")}>+ Journal Entry</AppButton>
      </ModuleHeading>
      <Panel className={styles.filters}>
        <Search
          label="Search journals"
          placeholder="Search bank, description"
          value={q}
          onChange={setQ}
        />
        <label>
          <span className="sr-only">Journal date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">Journal status</span>
          <select
            aria-label="Journal status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="balanced">Balanced</option>
            <option value="unbalanced">Not Balanced</option>
          </select>
        </label>
      </Panel>
      <RecordsTable
        key={q + date + status}
        label="Demo journals"
        headers={[
          "ID",
          "Journal",
          "Date",
          "Debit",
          "Credit",
          "Created by",
          "Status",
          "Action",
        ]}
        rows={rows.map((row) => {
          const sums = journalTotals(row.lines);
          return {
            id: row.id,
            cells: [
              <button
                key="id"
                className={styles.recordButton}
                onClick={() => setView(row)}
              >
                {row.number}
              </button>,
              row.title,
              row.date,
              money(sums.debit),
              money(sums.credit),
              row.author,
              <Status key="status">
                {sums.balanced ? "Balanced" : "Not Balanced"}
              </Status>,
            ],
            actions: [
              { label: "View", onClick: () => setView(row) },
              { label: "Edit", onClick: () => setEdit(row) },
              {
                label: "Delete Record",
                danger: true,
                onClick: () => setRemove(row),
              },
            ],
          };
        })}
      />
      {edit && (
        <JournalEditor
          journal={edit === "new" ? undefined : edit}
          onClose={() => setEdit(undefined)}
        />
      )}{" "}
      {view && (
        <JournalDetails journal={view} onClose={() => setView(undefined)} />
      )}{" "}
      {remove && (
        <ConfirmDemo
          title="Delete journal entry?"
          onClose={() => setRemove(undefined)}
          onConfirm={() => {
            setDemo((current) => ({
              ...current,
              journals: current.journals.filter((row) => row.id !== remove.id),
            }));
            setRemove(undefined);
          }}
        />
      )}
    </>
  );
}
export function GeneralLedger() {
  const { demo } = useWorkspace();
  const [q, setQ] = useState("");
  const [account, setAccount] = useState("");
  const [date, setDate] = useState("");
  const [view, setView] = useState<DemoJournal>();
  useEffect(() => {
    const name = new URLSearchParams(window.location.search).get("account");
    if (name && demo.accounts.some((row) => row.name === name))
      setAccount(name);
  }, []);
  const rows = ledgerRows(demo.journals, demo.accounts).filter(
    (row) =>
      `${row.account} ${row.description} ${row.reference}`
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (!account || row.account === account) &&
      (!date || row.date === date),
  );
  const exportRows = () =>
    downloadDemoCsv(
      "coreone-demo-ledger.csv",
      [
        "Date",
        "Reference",
        "Account",
        "Description",
        "Debit",
        "Credit",
        "Running balance",
      ],
      rows.map((row) => [
        row.date,
        row.reference,
        row.account,
        row.description,
        row.debit,
        row.credit,
        row.balance,
      ]),
    );
  return (
    <>
      <ModuleHeading
        section="Accounting"
        title="General Ledger"
        description="View posted transactions and account balances."
      >
        <AppButton variant="secondary" onClick={exportRows}>
          Export Report
        </AppButton>
      </ModuleHeading>
      <SummaryCards
        items={[
          {
            label: "Total Debits",
            value: money(rows.reduce((s, r) => s + r.debit, 0)),
          },
          {
            label: "Total Credits",
            value: money(rows.reduce((s, r) => s + r.credit, 0)),
          },
          {
            label: "Accounts with Activity",
            value: new Set(rows.map((row) => row.account)).size,
          },
          {
            label: "Posted Entries",
            value: new Set(rows.map((row) => row.journalId)).size,
          },
        ]}
      />
      <DemoNotice>
        The demo general ledger is derived from balanced demo journals.
        Unbalanced entries are excluded.
      </DemoNotice>
      <Panel className={styles.filters}>
        <Search
          label="Search general ledger"
          placeholder="Search account, description"
          value={q}
          onChange={setQ}
        />
        <label>
          <span className="sr-only">Ledger account</span>
          <select
            aria-label="Ledger account"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
          >
            <option value="">Account</option>
            {demo.accounts.map((row) => (
              <option key={row.id}>{row.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Ledger date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <AppButton variant="secondary" onClick={exportRows}>
          Export
        </AppButton>
      </Panel>
      <RecordsTable
        key={q + account + date}
        label="Demo general ledger"
        headers={[
          "Date",
          "Reference",
          "Description",
          "Account",
          "Debit",
          "Credit",
          "Running balance",
          "Action",
        ]}
        rows={rows.map((row) => ({
          id: row.id,
          cells: [
            row.date,
            row.reference,
            row.description,
            row.account,
            money(row.debit),
            money(row.credit),
            money(row.balance),
          ],
          actions: [
            {
              label: "View journal",
              onClick: () =>
                setView(demo.journals.find((j) => j.id === row.journalId)),
            },
          ],
        }))}
      />
      {view && (
        <JournalDetails journal={view} onClose={() => setView(undefined)} />
      )}
    </>
  );
}
function AccountEditor({
  account,
  parentId,
  onClose,
}: {
  account?: DemoAccount;
  parentId?: string;
  onClose: () => void;
}) {
  const { demo, setDemo } = useWorkspace();
  const [draft, setDraft] = useState<DemoAccount>(() =>
    account
      ? { ...account }
      : {
          id: `account-${crypto.randomUUID()}`,
          name: "",
          type: "",
          detail: "",
          balance: 0,
          bankBalance: 0,
          date: "",
          description: "",
          parentId,
        },
  );
  const [sub, setSub] = useState(!!draft.parentId);
  const [error, setError] = useState("");
  return (
    <Dialog
      title={account ? "Edit Account" : "New Account"}
      drawer
      onClose={onClose}
    >
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (
            !draft.name.trim() ||
            !draft.type ||
            !draft.detail ||
            !draft.date ||
            (sub && (!draft.parentId || draft.parentId === draft.id))
          ) {
            setError(
              "Enter an account name, type, detail type and date. Subaccounts need a parent account.",
            );
            return;
          }
          const record = {
            ...draft,
            parentId: sub ? draft.parentId : undefined,
          };
          setDemo((current) => ({
            ...current,
            accounts: account
              ? current.accounts.map((row) =>
                  row.id === record.id ? record : row,
                )
              : [record, ...current.accounts],
          }));
          onClose();
        }}
      >
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <Field
          label="Account Name"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Enter account name"
          maxLength={200}
        />
        <Select
          label="Account Type"
          value={draft.type}
          onChange={(e) => setDraft({ ...draft, type: e.target.value })}
        >
          <option value="">Select Account Type</option>
          {["Current Assets", "Liability", "Equity", "Income", "Expense"].map(
            (value) => (
              <option key={value}>{value}</option>
            ),
          )}
        </Select>
        <Select
          label="Detail Type"
          value={draft.detail}
          onChange={(e) => setDraft({ ...draft, detail: e.target.value })}
        >
          <option value="">Select Detail Type</option>
          {[
            "Current Assets",
            "Bank Charges",
            "Depreciation",
            "Sales Revenue",
            "Other",
          ].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </Select>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={sub}
            onChange={(e) => setSub(e.target.checked)}
          />
          Make this a subaccount
        </label>
        {sub && (
          <Select
            label="Parent Account"
            value={draft.parentId || ""}
            onChange={(e) => setDraft({ ...draft, parentId: e.target.value })}
          >
            <option value="">Select parent</option>
            {demo.accounts
              .filter((row) => row.id !== draft.id && !row.parentId)
              .map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name}
                </option>
              ))}
          </Select>
        )}
        <Field
          label="Opening Balance"
          type="number"
          step="0.01"
          value={draft.balance}
          onChange={(e) =>
            setDraft({ ...draft, balance: Number(e.target.value) || 0 })
          }
        />
        <Field
          label="As of (Date)"
          type="date"
          value={draft.date}
          onChange={(e) => setDraft({ ...draft, date: e.target.value })}
        />
        <TextArea
          label="Description"
          name="description"
          value={draft.description}
          onChange={(value) => setDraft({ ...draft, description: value })}
        />
        <div className={styles.dialogActions}>
          <AppButton variant="secondary" onClick={onClose}>
            Back
          </AppButton>
          <AppButton type="submit">Save demo account</AppButton>
        </div>
      </form>
    </Dialog>
  );
}
export function ChartOfAccounts() {
  const router = useRouter();
  const { demo, setDemo } = useWorkspace();
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [detail, setDetail] = useState("");
  const [edit, setEdit] = useState<DemoAccount | "new">();
  const [parent, setParent] = useState<string>();
  const [remove, setRemove] = useState<DemoAccount>();
  const [notice, setNotice] = useState("");
  const rows = demo.accounts.filter(
    (row) =>
      `${row.name} ${row.type} ${row.detail}`
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (!type || row.type === type) &&
      (!detail || row.detail === detail),
  );
  return (
    <>
      <ModuleHeading
        section="Accounting"
        title="Chart of Accounts"
        description="Manage the accounts that organize your financial records."
      >
        <AppButton
          onClick={() => {
            setParent(undefined);
            setEdit("new");
          }}
        >
          + New Account
        </AppButton>
      </ModuleHeading>
      {notice && (
        <p className={styles.inlineNotice} role="status">
          {notice}
        </p>
      )}
      <Panel className={styles.filters}>
        <Search
          label="Search accounts"
          placeholder="Search by name, account or detail type"
          value={q}
          onChange={setQ}
        />
        <label>
          <span className="sr-only">Filter account type</span>
          <select
            aria-label="Filter account type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Account</option>
            {Array.from(new Set(demo.accounts.map((row) => row.type))).map(
              (value) => (
                <option key={value}>{value}</option>
              ),
            )}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter detail type</span>
          <select
            aria-label="Filter detail type"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
          >
            <option value="">Detail</option>
            {Array.from(new Set(demo.accounts.map((row) => row.detail))).map(
              (value) => (
                <option key={value}>{value}</option>
              ),
            )}
          </select>
        </label>
        <AppButton
          variant="secondary"
          onClick={() =>
            downloadDemoCsv(
              "coreone-demo-accounts.csv",
              [
                "Name",
                "Account type",
                "Detail type",
                "Balance",
                "Bank balance",
              ],
              rows.map((row) => [
                row.name,
                row.type,
                row.detail,
                row.balance,
                row.bankBalance,
              ]),
            )
          }
        >
          Export
        </AppButton>
      </Panel>
      <RecordsTable
        key={q + type + detail}
        label="Demo chart of accounts"
        headers={[
          "Name",
          "Account type",
          "Detail type",
          "Balance",
          "Bank balance",
          "Action",
        ]}
        rows={rows.map((row) => ({
          id: row.id,
          cells: [
            row.parentId ? `↳ ${row.name}` : row.name,
            row.type,
            row.detail,
            money(row.balance),
            money(row.bankBalance),
          ],
          actions: [
            { label: "Edit", onClick: () => setEdit(row) },
            {
              label: "Run Report",
              onClick: () =>
                router.push(
                  `/dashboard/general-ledger?account=${encodeURIComponent(row.name)}`,
                ),
            },
            {
              label: "Reconcile",
              onClick: () =>
                router.push(
                  `/dashboard/reconciliation?account=${encodeURIComponent(row.name)}`,
                ),
            },
            {
              label: "Create Subaccount",
              onClick: () => {
                setParent(row.id);
                setEdit("new");
              },
            },
            {
              label: "Delete Record",
              danger: true,
              onClick: () => setRemove(row),
            },
          ],
        }))}
      />
      {edit && (
        <AccountEditor
          account={edit === "new" ? undefined : edit}
          parentId={parent}
          onClose={() => setEdit(undefined)}
        />
      )}{" "}
      {remove && (
        <ConfirmDemo
          title="Delete Account?"
          onClose={() => setRemove(undefined)}
          onConfirm={() => {
            if (
              demo.journals.some((j) =>
                j.lines.some((line) => line.accountId === remove.id),
              ) ||
              demo.accounts.some((row) => row.parentId === remove.id)
            ) {
              setNotice(
                "This demo account is referenced by journal lines or subaccounts. Remove those references before deleting it.",
              );
            } else
              setDemo((current) => ({
                ...current,
                accounts: current.accounts.filter(
                  (row) => row.id !== remove.id,
                ),
              }));
            setRemove(undefined);
          }}
        />
      )}
    </>
  );
}
export function Reconciliation() {
  const { demo, setDemo } = useWorkspace();
  const [q, setQ] = useState("");
  const [account, setAccount] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState(false);
  const [work, setWork] = useState<DemoReconciliation>();
  const [report, setReport] = useState<DemoReconciliation>();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [attach, setAttach] = useState<DemoReconciliation>();
  useEffect(() => {
    const name = new URLSearchParams(window.location.search).get("account");
    if (name && demo.accounts.some((row) => row.name === name)) {
      setWork({
        id: `reconciliation-${crypto.randomUUID()}`,
        account: name,
        date: "2026-09-24",
        beginning: 0,
        ending: 0,
        serviceCharge: 0,
        interest: 0,
        selectedIds: [],
        completed: "",
      });
      setStart(true);
    }
  }, []);
  const sums = work ? reconciliationTotals(work) : undefined;
  const rows = demo.reconciliations.filter(
    (row) =>
      row.account.toLowerCase().includes(q.toLowerCase()) &&
      (!account || row.account === account) &&
      (!date || row.date === date),
  );
  function exportReport(row: DemoReconciliation) {
    const total = reconciliationTotals(row);
    downloadDemoCsv(
      "coreone-demo-reconciliation.csv",
      ["Description", "NGN"],
      [
        ["Statement beginning balance", row.beginning],
        ["Service charge", row.serviceCharge],
        ["Interest earned", row.interest],
        ["Payments cleared", total.payments],
        ["Deposits cleared", total.deposits],
        ["Statement ending balance", row.ending],
        ["Cleared balance", total.cleared],
        ["Difference", total.difference],
      ],
    );
  }
  return (
    <>
      <ModuleHeading
        section="Accounting"
        title={
          report
            ? "Reconciliation Report"
            : work
              ? "New Reconciliation"
              : "Reconcile"
        }
        description="Compare your bank statements with your accounting records."
      >
        {work ? (
          <>
            <AppButton variant="secondary" onClick={() => setStart(true)}>
              Edit
            </AppButton>
            <AppButton
              onClick={() => {
                if (
                  !sums ||
                  sums.difference !== 0 ||
                  !work.selectedIds.length
                ) {
                  setError(
                    "Select cleared transactions and make the difference zero before saving this demo reconciliation.",
                  );
                  return;
                }
                const completed = { ...work, completed: "2026-11-23" };
                setWork(completed);
                setDemo((current) => ({
                  ...current,
                  reconciliations: [
                    completed,
                    ...current.reconciliations.filter(
                      (row) => row.id !== completed.id,
                    ),
                  ],
                }));
                setDone(true);
              }}
            >
              Save demo reconciliation
            </AppButton>
          </>
        ) : report ? (
          <AppButton onClick={() => exportReport(report)}>Export</AppButton>
        ) : (
          <AppButton
            onClick={() => {
              setWork(undefined);
              setStart(true);
            }}
          >
            + New Reconciliation
          </AppButton>
        )}
      </ModuleHeading>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {report ? (
        <Panel className={ui.report}>
          <button
            className={styles.textButton}
            onClick={() => {
              setReport(undefined);
              setWork(undefined);
            }}
          >
            Back to reconciliations
          </button>
          <h2>Swiftroletech Limited</h2>
          <p>
            {report.account}, Period Ending {report.date}
          </p>
          <h3>RECONCILIATION REPORT · DEMO</h3>
          <p>Reconciled on: {report.completed}</p>
          <p>Reconciled by: Pomaline Moses</p>
          <p>
            Any changes made to transactions after this date aren’t included in
            this report.
          </p>
          <h3>Summary</h3>
          <dl className={styles.invoiceTotals}>
            {Object.entries({
              "Statement beginning balance": report.beginning,
              "Service charge": report.serviceCharge,
              "Interest earned": report.interest,
              "Cheques and payments cleared":
                reconciliationTotals(report).payments,
              "Deposits and credits cleared":
                reconciliationTotals(report).deposits,
              "Statement ending balance": report.ending,
              "Cleared balance": reconciliationTotals(report).cleared,
              Difference: reconciliationTotals(report).difference,
            }).map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{money(value)}</dd>
              </div>
            ))}
          </dl>
          <h3>Additional Information</h3>
          <RecordsTable
            label="Uncleared demo transactions"
            headers={["Date", "Type", "Payee", "Amount (NGN)"]}
            rows={reconcileTransactions
              .filter((row) => !report.selectedIds.includes(row.id))
              .map((row) => ({
                id: row.id,
                cells: [row.date, row.type, row.payee, money(row.amount)],
              }))}
          />
        </Panel>
      ) : work && sums ? (
        <>
          <button
            className={styles.textButton}
            onClick={() => {
              setWork(undefined);
              setError("");
            }}
          >
            Back to history
          </button>
          <SummaryCards
            items={[
              { label: "Beginning balance", value: money(work.beginning) },
              { label: "Payments", value: money(sums.payments) },
              { label: "Deposits", value: money(sums.deposits) },
              { label: "Statement ending balance", value: money(work.ending) },
              { label: "Cleared balance", value: money(sums.cleared) },
              { label: "Difference", value: money(sums.difference) },
            ]}
          />
          <DemoNotice>
            Choose cleared demo transactions. No real bank account or accounting
            records will be reconciled.
          </DemoNotice>
          <RecordsTable
            label="Demo reconciliation transactions"
            headers={[
              "Clear",
              "Date",
              "Type",
              "Account",
              "Payee",
              "Payment (NGN)",
            ]}
            rows={reconcileTransactions.map((row) => ({
              id: row.id,
              cells: [
                <input
                  key="selected"
                  type="checkbox"
                  aria-label={`Clear ${row.type} ${row.id}`}
                  checked={work.selectedIds.includes(row.id)}
                  onChange={(e) =>
                    setWork({
                      ...work,
                      selectedIds: e.target.checked
                        ? [...work.selectedIds, row.id]
                        : work.selectedIds.filter((id) => id !== row.id),
                    })
                  }
                />,
                row.date,
                row.type,
                row.account,
                row.payee,
                `${row.direction === "payment" ? "−" : "+"} ${money(row.amount)}`,
              ],
            }))}
          />
        </>
      ) : (
        <>
          <Panel className={styles.filters}>
            <Search
              label="Search reconciliations"
              placeholder="Search by name, account or detail type"
              value={q}
              onChange={setQ}
            />
            <label>
              <span className="sr-only">Reconciliation account</span>
              <select
                aria-label="Reconciliation account"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
              >
                <option value="">Account</option>
                <option>Cash & Bank</option>
              </select>
            </label>
            <label>
              <span className="sr-only">Report period</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <AppButton
              variant="secondary"
              onClick={() =>
                downloadDemoCsv(
                  "coreone-demo-reconciliations.csv",
                  [
                    "Statement ending date",
                    "Reconciled on",
                    "Ending balance",
                    "Changes",
                  ],
                  rows.map((row) => [
                    row.date,
                    row.completed,
                    row.ending,
                    reconciliationTotals(row).difference,
                  ]),
                )
              }
            >
              Export
            </AppButton>
          </Panel>
          <RecordsTable
            key={q + account + date}
            label="Demo reconciliation history"
            headers={[
              "Statement ending date",
              "Reconciled on",
              "Ending balance",
              "Changes",
              "Auto adjustment",
              "Statements",
              "Action",
            ]}
            rows={rows.map((row) => ({
              id: row.id,
              cells: [
                row.date,
                row.completed,
                money(row.ending),
                money(reconciliationTotals(row).difference),
                money(row.serviceCharge - row.interest),
                <button
                  className={styles.textButton}
                  key="attach"
                  onClick={() => setAttach(row)}
                >
                  {row.attachment ? "View Attachment" : "Attach"}
                </button>,
              ],
              actions: [{ label: "View", onClick: () => setReport(row) }],
            }))}
          />
        </>
      )}
      {start && (
        <Dialog
          title="New Reconciliation"
          drawer
          onClose={() => setStart(false)}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const beginning = Number(data.get("beginning"));
              const ending = Number(data.get("ending"));
              const charge = Number(data.get("charge"));
              const interest = Number(data.get("interest"));
              if (
                !data.get("date") ||
                ![beginning, ending, charge, interest].every(Number.isFinite) ||
                charge < 0 ||
                interest < 0
              ) {
                setError("Choose a statement date and valid amounts.");
                return;
              }
              setWork({
                id: work?.id || `reconciliation-${crypto.randomUUID()}`,
                account: String(data.get("account")),
                date: String(data.get("date")),
                beginning,
                ending,
                serviceCharge: charge,
                interest,
                selectedIds: work?.selectedIds || [],
                completed: "",
              });
              setStart(false);
              setError("");
            }}
          >
            {error && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}
            <Select
              label="Account"
              name="account"
              defaultValue={work?.account || "Cash & Bank"}
            >
              {demo.accounts
                .filter((row) => row.type === "Current Assets")
                .map((row) => (
                  <option key={row.id}>{row.name}</option>
                ))}
            </Select>
            <Field
              label="Beginning Balance"
              name="beginning"
              type="number"
              step="0.01"
              defaultValue={work?.beginning ?? 2450000}
            />
            <Field
              label="Statement ending balance"
              name="ending"
              type="number"
              step="0.01"
              defaultValue={work?.ending ?? 2450000}
            />
            <Field
              label="Statement ending date"
              name="date"
              type="date"
              defaultValue={work?.date || "2026-09-24"}
            />
            <p>Enter the service charge or interest earned, if necessary.</p>
            <Field
              label="Service Charge"
              name="charge"
              type="number"
              step="0.01"
              min="0"
              defaultValue={work?.serviceCharge || 0}
            />
            <Select label="Expense Account">
              <option>Bank Charges</option>
            </Select>
            <Field
              label="Interest earned"
              name="interest"
              type="number"
              step="0.01"
              min="0"
              defaultValue={work?.interest || 0}
            />
            <Select label="Income Account">
              <option>Interest Income</option>
            </Select>
            <div className={styles.dialogActions}>
              <AppButton variant="secondary" onClick={() => setStart(false)}>
                Back
              </AppButton>
              <AppButton type="submit">Start Reconciling</AppButton>
            </div>
          </form>
        </Dialog>
      )}
      {done && work && (
        <Dialog
          title="Done"
          description="You’ve successfully reconciled this demo account. No real records were changed."
          onClose={() => setDone(false)}
        >
          <AppButton
            onClick={() => {
              setReport(work);
              setWork(undefined);
              setDone(false);
            }}
          >
            View Reconciled Report
          </AppButton>
        </Dialog>
      )}
      {attach && (
        <Dialog
          title="Statement attachment"
          onClose={() => setAttach(undefined)}
        >
          <Attachment
            name={attach.attachment}
            onSelect={(file) => {
              setDemo((current) => ({
                ...current,
                reconciliations: current.reconciliations.map((row) =>
                  row.id === attach.id
                    ? { ...row, attachment: file.name }
                    : row,
                ),
              }));
              setAttach({ ...attach, attachment: file.name });
            }}
          />
          <DemoNotice>
            Only the filename is retained in demo memory. File contents are not
            uploaded.
          </DemoNotice>
        </Dialog>
      )}
    </>
  );
}
