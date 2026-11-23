import { invoiceTotals, type InvoiceItem } from "./model.ts";

export type DemoInvoice = {
  id: string;
  number: string;
  customerId: string;
  title: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  discount: number;
  notes: string;
  terms: string;
  paid: number;
  status: "Draft" | "Issued" | "Paid" | "Partially Paid" | "Overdue";
};
export type DemoAccount = {
  id: string;
  name: string;
  type: string;
  detail: string;
  balance: number;
  bankBalance: number;
  date: string;
  description: string;
  parentId?: string;
};
export type JournalLine = {
  accountId: string;
  description: string;
  debit: number;
  credit: number;
};
export type DemoJournal = {
  id: string;
  number: string;
  title: string;
  date: string;
  description: string;
  memo: string;
  author: string;
  attachment?: string;
  lines: JournalLine[];
};
export type ReconcileTransaction = {
  id: string;
  date: string;
  type: string;
  account: string;
  payee: string;
  amount: number;
  direction: "payment" | "deposit";
};
export type DemoReconciliation = {
  id: string;
  account: string;
  date: string;
  beginning: number;
  ending: number;
  serviceCharge: number;
  interest: number;
  selectedIds: string[];
  completed: string;
  attachment?: string;
};
export type DemoSettings = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  businessName: string;
  businessEmail: string;
  tin: string;
  industry: string;
  structure: string;
  employees: string;
  street: string;
  city: string;
  country: string;
  appearance: "Light" | "Dark" | "System";
  emailNotices: boolean;
  inAppNotices: boolean;
  twoFactor: boolean;
  paymentMethod: "Card Payment" | "Bank Transfer";
  defaultBank: string;
  linkedBanks: { id: string; name: string; ending: string; sync: string }[];
};
export type DemoState = {
  invoices: DemoInvoice[];
  accounts: DemoAccount[];
  journals: DemoJournal[];
  reconciliations: DemoReconciliation[];
  settings: DemoSettings;
};
export const roundMoney = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;
export function journalTotals(lines: JournalLine[]) {
  const debit = roundMoney(
    lines.reduce(
      (sum, line) => sum + (Number.isFinite(line.debit) ? line.debit : 0),
      0,
    ),
  );
  const credit = roundMoney(
    lines.reduce(
      (sum, line) => sum + (Number.isFinite(line.credit) ? line.credit : 0),
      0,
    ),
  );
  return {
    debit,
    credit,
    difference: roundMoney(debit - credit),
    balanced: debit > 0 && roundMoney(debit - credit) === 0,
  };
}
export function journalErrors(journal: DemoJournal) {
  if (!journal.title.trim() || !journal.date || journal.lines.length < 2)
    return "Add a title, date, and at least two journal lines.";
  if (
    journal.lines.some(
      (line) =>
        !line.accountId ||
        !Number.isFinite(line.debit) ||
        !Number.isFinite(line.credit) ||
        line.debit < 0 ||
        line.credit < 0 ||
        (line.debit > 0 && line.credit > 0) ||
        (!line.debit && !line.credit),
    )
  )
    return "Each line needs an account and a positive amount in either debit or credit.";
  return journalTotals(journal.lines).balanced
    ? ""
    : "Total debits and credits must match before saving this demo journal.";
}
export const invoiceAmount = (invoice: DemoInvoice) =>
  invoiceTotals(invoice.items, invoice.discount).total;
export const invoiceBalance = (invoice: DemoInvoice) =>
  roundMoney(Math.max(0, invoiceAmount(invoice) - invoice.paid));
export function invoiceSummary(invoices: DemoInvoice[]) {
  return {
    outstanding: roundMoney(
      invoices
        .filter((row) => row.status !== "Draft")
        .reduce((sum, row) => sum + invoiceBalance(row), 0),
    ),
    overdue: roundMoney(
      invoices
        .filter((row) => row.status === "Overdue")
        .reduce((sum, row) => sum + invoiceBalance(row), 0),
    ),
    paid: roundMoney(invoices.reduce((sum, row) => sum + row.paid, 0)),
    drafts: invoices.filter((row) => row.status === "Draft").length,
  };
}
export const reconcileTransactions: ReconcileTransaction[] = Array.from(
  { length: 8 },
  (_, index) => ({
    id: `clear-${index}`,
    date: "2026-09-24",
    type: ["Cheque", "Deposit", "Expense", "Bill Payment"][index % 4],
    account: [
      "Bank Charges",
      "Interest Income",
      "Services",
      "Account Payables (A/P)",
    ][index % 4],
    payee: "Pomaline Moses",
    amount: 650000,
    direction: index % 2 ? "deposit" : "payment",
  }),
);
export function reconciliationTotals(
  input: Pick<
    DemoReconciliation,
    "beginning" | "ending" | "serviceCharge" | "interest" | "selectedIds"
  >,
) {
  const selected = new Set(input.selectedIds);
  let payments = 0,
    deposits = 0;
  for (const row of reconcileTransactions)
    if (selected.has(row.id)) {
      if (row.direction === "payment") payments += row.amount;
      else deposits += row.amount;
    }
  const cleared = roundMoney(
    input.beginning +
      deposits -
      payments -
      input.serviceCharge +
      input.interest,
  );
  return {
    payments,
    deposits,
    cleared,
    difference: roundMoney(input.ending - cleared),
  };
}
export function ledgerRows(journals: DemoJournal[], accounts: DemoAccount[]) {
  const balances = new Map<string, number>();
  return journals
    .filter((row) => !journalErrors(row))
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) || a.number.localeCompare(b.number),
    )
    .flatMap((journal) =>
      journal.lines.map((line, index) => {
        const balance = roundMoney(
          (balances.get(line.accountId) || 0) + line.debit - line.credit,
        );
        balances.set(line.accountId, balance);
        return {
          id: `${journal.id}-${index}`,
          date: journal.date,
          reference: journal.number,
          description: line.description || journal.title,
          account:
            accounts.find((row) => row.id === line.accountId)?.name ||
            "Unknown demo account",
          debit: line.debit,
          credit: line.credit,
          balance,
          journalId: journal.id,
        };
      }),
    );
}
export function createDemoState(): DemoState {
  const accounts: DemoAccount[] = [
    "Accounts Receivable",
    "Inventory",
    "Prepaid Expenses",
    "Inventory Asset",
    "Undeposited Funds",
    "Depreciation expense",
    "Accumulated depreciation",
    "Cash & Bank",
    "Sales Revenue",
  ].map((name, index) => ({
    id: `account-${index}`,
    name,
    type: index === 5 ? "Expense" : index === 8 ? "Income" : "Current Assets",
    detail: index === 5 ? "Depreciation" : "Current Assets",
    balance: 650000,
    bankBalance: 650000,
    date: "2026-09-24",
    description: "Supplied demo account",
  }));
  return {
    accounts,
    invoices: Array.from({ length: 8 }, (_, index) => {
      const status: DemoInvoice["status"] = [
        "Issued",
        "Paid",
        "Paid",
        "Partially Paid",
        "Overdue",
        "Draft",
        "Paid",
        "Paid",
      ][index] as DemoInvoice["status"];
      return {
        id: `demo-invoice-${index}`,
        number: `INV-${String(28 + index).padStart(3, "0")}`,
        customerId: `sample-${index + 1}`,
        title: "Professional services",
        date: "2026-09-24",
        dueDate: "2026-10-24",
        items: [
          { description: "Consulting services", quantity: 1, rate: 604651.16 },
        ],
        discount: 0,
        paid:
          status === "Paid" ? 650000 : status === "Partially Paid" ? 300000 : 0,
        status,
        notes: "Thank you for your business",
        terms: "Demo invoice only — not a request for payment.",
      };
    }),
    journals: Array.from({ length: 8 }, (_, index) => ({
      id: `journal-${index}`,
      number: `JD-${2113 + index}`,
      title: [
        "Monthly depreciation",
        "Office equipment adjustment",
        "Opening balance adjustment",
      ][index % 3],
      date: "2026-09-24",
      description: "Manual accounting adjustment",
      memo: "Settlement batch was successfully processed and funds distributed to merchant wallets.",
      author: "Pomaline Moses",
      lines: [
        {
          accountId: "account-5",
          description: "Depreciation expense",
          debit: 650000,
          credit: 0,
        },
        {
          accountId: "account-6",
          description: "Accumulated depreciation",
          debit: 0,
          credit: index === 1 || index === 3 ? 620000 : 650000,
        },
      ],
    })),
    reconciliations: Array.from({ length: 3 }, (_, index) => ({
      id: `reconciliation-${index}`,
      account: "Cash & Bank",
      date: "2026-09-24",
      beginning: 2450000,
      ending: 2450000,
      serviceCharge: 0,
      interest: 0,
      selectedIds: ["clear-0", "clear-1"],
      completed: "2026-10-23",
    })),
    settings: {
      firstName: "Pomaline",
      lastName: "Moses",
      email: "malinepo@gmail.com",
      phone: "08123456789",
      role: "Super Admin",
      businessName: "Sunrise Technologies Ltd.",
      businessEmail: "info@sunrise.ng",
      tin: "339147228391",
      industry: "Energy",
      structure: "Limited Liability Company",
      employees: "1–10",
      street: "12 Moltty Street harren way",
      city: "Ikoyi/Lagos",
      country: "Nigeria",
      appearance: "Light",
      emailNotices: true,
      inAppNotices: true,
      twoFactor: false,
      paymentMethod: "Card Payment",
      defaultBank: "moniepoint",
      linkedBanks: [
        {
          id: "moniepoint",
          name: "Moniepoint Bank",
          ending: "673",
          sync: "Today 10:34 AM",
        },
        {
          id: "uba",
          name: "United Bank for Africa (UBA)",
          ending: "109",
          sync: "Today 10:21 AM",
        },
      ],
    },
  };
}
export function csvContent(headers: string[], rows: (string | number)[][]) {
  const cell = (value: string | number) => {
    let text = String(value);
    if (typeof value === "string" && /^[=+@\-\t\r]/.test(text))
      text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  return (
    "\uFEFF" +
    [headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n")
  );
}
export function downloadDemoCsv(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const url = URL.createObjectURL(
    new Blob([csvContent(headers, rows)], { type: "text/csv;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
