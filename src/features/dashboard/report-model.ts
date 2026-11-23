import {
  invoiceAmount,
  invoiceBalance,
  journalErrors,
  journalTotals,
  ledgerRows,
  roundMoney,
  type DemoState,
} from "./demo.ts";
import { contactName, type Contact } from "./model.ts";

export const reportDefinitions = [
  {
    id: "profit-loss",
    title: "Profit & Loss",
    category: "Financial Statements",
    description:
      "Shows income, cost of sales where applicable, operating expenses, and profit or loss.",
  },
  {
    id: "balance-sheet",
    title: "Balance Sheet",
    category: "Financial Statements",
    description: "Shows the business assets, liabilities and equity.",
  },
  {
    id: "trial-balance",
    title: "Trial Balance",
    category: "Financial Statements",
    description: "Shows debit and credit balances for each account.",
  },
  {
    id: "general-ledger",
    title: "General Ledger",
    category: "Financial Statements",
    description: "Shows transaction-level activity for individual accounts.",
  },
  {
    id: "receivables",
    title: "Account Receivables",
    category: "Sales & Receivables",
    description: "Shows outstanding customer invoices and their ageing.",
  },
  {
    id: "payables",
    title: "Account Payable (AP)",
    category: "Payables",
    description: "Shows outstanding vendor bills and their ageing.",
  },
  {
    id: "expenses-summary",
    title: "Expenses Summary",
    category: "Expenses",
    description:
      "Breaks down expenses by account or category and reporting periods.",
  },
  {
    id: "bank-activity",
    title: "Cash / Bank Activity",
    category: "Banking",
    description:
      "Provides visibility into cash and bank-related financial activity.",
  },
  {
    id: "cash-flow",
    title: "Cash Flow",
    category: "Banking",
    description:
      "Shows cash inflows and outflows across operating, investing and financing activities.",
  },
  {
    id: "sales-summary",
    title: "Sales Summary",
    category: "Sales & Receivables",
    description:
      "Shows total sales, invoices issued, payments received and outstanding sales amounts.",
  },
  {
    id: "customer-sales",
    title: "Customer Sales Report",
    category: "Sales & Receivables",
    description:
      "Shows sales by customer, total purchases and outstanding balances.",
  },
  {
    id: "journal-entries",
    title: "Journal Entries Report",
    category: "Financial Statements",
    description:
      "Provides a record of posted journal entries, including references, dates, accounts, debit and credit amounts.",
  },
  {
    id: "financial-ratios",
    title: "Financial Ratios Report",
    category: "Financial Statements",
    description:
      "Shows liquidity, profitability, efficiency and leverage ratios to help assess business performance.",
  },
] as const;
export type ReportId = Exclude<
  (typeof reportDefinitions)[number]["id"],
  "bank-activity"
>;
export const reportCategories = [
  "All Reports",
  "Financial Statements",
  "Sales & Receivables",
  "Payables",
  "Expenses",
  "Banking",
] as const;
export const reportHref = (id: (typeof reportDefinitions)[number]["id"]) =>
  id === "bank-activity"
    ? "/dashboard/bank-transactions"
    : `/dashboard/reporting/${id}`;
export type ValueFormat =
  "money" | "number" | "percent" | "ratio" | "days" | "text";
export type ReportMetric = {
  label: string;
  value: number;
  format: ValueFormat;
  hint?: string;
};
export type ReportColumn = { label: string; format: ValueFormat };
export type ReportSource = { kind: "invoice" | "journal" | "bill"; id: string };
export type ReportRow = {
  id: string;
  label: string;
  values: (string | number)[];
  children?: ReportRow[];
  highlight?: boolean;
  source?: ReportSource;
  date?: string;
  partyId?: string;
  status?: string;
  category?: string;
  account?: string;
};
export type ReportChart = {
  title: string;
  kind: "bars" | "line" | "donut";
  labels: string[];
  series: { label: string; values: number[]; color: string }[];
  format: ValueFormat;
};
export type ReportModel = {
  id: ReportId;
  title: string;
  description: string;
  metrics: ReportMetric[];
  columns: ReportColumn[];
  rows: ReportRow[];
  section: string;
  insights?: { title: string; body: string }[];
  charts?: ReportChart[];
  notice?: string;
};
export type ReportFilters = {
  query?: string;
  date?: string;
  party?: string;
  status?: string;
  account?: string;
  category?: string;
  transaction?: string;
  balance?: string;
};
export const reportAsOf = "2026-11-23";
export const percentageChange = (current: number, previous: number) =>
  previous === 0
    ? null
    : roundMoney(((current - previous) / Math.abs(previous)) * 100);
export function daysBetween(from: string, to: string) {
  const start = Date.parse(`${from}T12:00:00Z`),
    end = Date.parse(`${to}T12:00:00Z`);
  return Number.isFinite(start) && Number.isFinite(end)
    ? Math.max(0, Math.floor((end - start) / 86400000))
    : 0;
}
export function flattenReportRows(rows: ReportRow[]): ReportRow[] {
  return rows.flatMap((row) => [row, ...flattenReportRows(row.children || [])]);
}
export function filterReportRows(rows: ReportRow[], filters: ReportFilters) {
  return rows.filter(
    (row) =>
      (!filters.query ||
        `${row.label} ${row.values.join(" ")}`
          .toLowerCase()
          .includes(filters.query.toLowerCase())) &&
      (!filters.date || row.date === filters.date) &&
      (!filters.party || row.partyId === filters.party) &&
      (!filters.status || row.status === filters.status) &&
      (!filters.account || row.account === filters.account) &&
      (!filters.category || row.category === filters.category) &&
      (!filters.transaction || row.source?.kind === filters.transaction) &&
      (!filters.balance ||
        (filters.balance === "outstanding"
          ? Number(row.values.at(-1)) > 0
          : Number(row.values.at(-1)) === 0)),
  );
}
const monetary = (label: string): ReportColumn => ({ label, format: "money" });
const metric = (
  label: string,
  value: number,
  format: ValueFormat = "money",
  hint?: string,
): ReportMetric => ({ label, value, format, hint });
const row = (
  id: string,
  label: string,
  current: number,
  previous: number,
  children?: ReportRow[],
): ReportRow => ({
  id,
  label,
  values: [current, previous, percentageChange(current, previous) ?? "New"],
  children,
});
const sum = (values: number[]) =>
  roundMoney(values.reduce((total, value) => total + value, 0));
export const financialSnapshot = {
  income: [1250000, 1120000],
  cost: [320000, 280000],
  expenses: [
    { label: "Office supplies", current: 220000, previous: 250000 },
    { label: "Rent & Lease", current: 180000, previous: 180000 },
    { label: "Utilities", current: 95000, previous: 110000 },
    { label: "Marketing", current: 75000, previous: 90000 },
    { label: "Travels & Transport", current: 60000, previous: 70000 },
    { label: "Miscellaneous", current: 50000, previous: 40000 },
  ],
  assets: [
    { label: "Cash and Bank", current: 1560000, previous: 1320000 },
    { label: "Accounts Receivable", current: 980000, previous: 850000 },
    { label: "Inventory", current: 240000, previous: 250000 },
    {
      label: "Property, Plant & Equipment",
      current: 2700000,
      previous: 2470000,
    },
  ],
  liabilities: [
    { label: "Accounts Payable", current: 980000, previous: 850000 },
    { label: "Other Current Liabilities", current: 440000, previous: 430000 },
    { label: "Long Term Loan", current: 740000, previous: 720000 },
  ],
  equity: [3320000, 2890000],
};
export const expenseSnapshot = [
  { label: "Marketing", current: 396800, previous: 356800 },
  { label: "Operations", current: 248000, previous: 230000 },
  { label: "Personal", current: 186000, previous: 178800 },
  { label: "Rent & Utilities", current: 124000, previous: 120800 },
  { label: "Technology", current: 93000, previous: 90000 },
  { label: "Professional Services", current: 62000, previous: 58000 },
  { label: "Travel & Transport", current: 62000, previous: 52000 },
  { label: "Others", current: 68200, previous: 48000 },
];
export const reportBills = [
  ["Selene Cruz", "PixelForge", 350000, 350000, "2026-09-24"],
  ["Kian Mercer", "EchoGrid", 710000, 710000, "2026-10-22"],
  ["Jaxon Tate", "CodeSphere", 85000, 40000, "2026-10-15"],
  ["Elara Voss", "QuantumLeap", 900000, 900000, "2026-10-29"],
  ["Darian Holt", "NovaNexus", 630000, 630000, "2026-12-08"],
  ["Nia Varela", "DataPulse", 520000, 520000, "2026-12-05"],
  ["Pomaline Moses", "Swiftroletech", 300000, 300000, "2026-12-01"],
  ["Mira Lang", "BrightWave", 1000000, 0, "2026-11-12"],
].map(([name, business, amount, balance, due], index) => ({
  id: `demo-bill-${index}`,
  number: `BILL-${String(41 + index).padStart(4, "0")}`,
  name: String(name),
  business: String(business),
  amount: Number(amount),
  balance: Number(balance),
  due: String(due),
  date: "2026-09-24",
  status:
    Number(balance) === 0
      ? "Paid"
      : Number(balance) < Number(amount)
        ? "Partially Paid"
        : String(due) < reportAsOf
          ? "Overdue"
          : "Pending",
}));
const colors = [
  "#18b4aa",
  "#2563ff",
  "#9a83f9",
  "#f79009",
  "#ee64a7",
  "#38bdf8",
  "#64748b",
  "#c4ccd8",
];
export function buildReport(
  id: ReportId,
  demo: DemoState,
  contacts: Contact[],
  filters: ReportFilters = {},
  period: "current" | "previous" = "current",
): ReportModel {
  const def = reportDefinitions.find((item) => item.id === id)!;
  const model: ReportModel = {
    id,
    title: def.title,
    description: def.description,
    metrics: [],
    columns: [],
    rows: [],
    section: def.title,
  };
  const f = financialSnapshot;
  const index = period === "current" ? 0 : 1;
  const current = (item: { current: number; previous: number }) =>
    period === "current" ? item.current : item.previous;
  const expense = sum(f.expenses.map(current)),
    income = f.income[index],
    cost = f.cost[index],
    profit = income - cost - expense;
  const compareColumns = [
    monetary("Oct 2026"),
    monetary("Sep 2026"),
    { label: "Change", format: "percent" as const },
  ];
  const snapshotNotice =
    "Illustrative financial snapshot, separate from editable demo invoices and journals. Comparison periods: October and September 2026.";
  if (
    id === "profit-loss" ||
    id === "balance-sheet" ||
    id === "cash-flow" ||
    id === "financial-ratios"
  ) {
    model.notice = snapshotNotice;
    model.insights = [];
    if (id === "profit-loss") {
      model.metrics = [
        metric("Total Income", income),
        metric("Total Expenses", cost + expense),
        metric("Net Profit / (Loss)", profit),
        metric("Profit Margin", (profit / income) * 100, "percent"),
      ];
      model.columns = compareColumns;
      model.section = "Profit & Loss Statement";
      model.rows = [
        row("income", "Income", ...(f.income as [number, number]), [
          row("sales", "Sales Revenue", ...(f.income as [number, number])),
        ]),
        row("cost", "Cost of Sales", ...(f.cost as [number, number]), [
          row("goods", "Cost of Goods Sold", ...(f.cost as [number, number])),
        ]),
        row(
          "operating",
          "Operating Expenses",
          sum(f.expenses.map((item) => item.current)),
          sum(f.expenses.map((item) => item.previous)),
          f.expenses.map((item, i) =>
            row(`expense-${i}`, item.label, item.current, item.previous),
          ),
        ),
        {
          ...row("profit", "Net Profit / (Loss)", 250000, 100000),
          highlight: true,
        },
      ];
      model.insights = [
        {
          title: "Net profit increased by 150%",
          body: "Demo net profit grew from ₦100,000 to ₦250,000 after cost of sales and operating expenses.",
        },
        {
          title: "Operating expenses are down",
          body: "Operating expenses decreased by 8.1%, from ₦740,000 to ₦680,000.",
        },
        {
          title: "Top expense category",
          body: "Office supplies account for ₦220,000, or 32.4% of operating expenses.",
        },
      ];
      model.charts = [
        {
          title: "Income vs Expenses",
          kind: "bars",
          labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
          series: [
            {
              label: "Income",
              values: [920000, 1120000, 1250000, 1100000, 1120000, 1250000],
              color: colors[0],
            },
            {
              label: "Expenses",
              values: [860000, 950000, 1090000, 1020000, 1020000, 1000000],
              color: colors[1],
            },
          ],
          format: "money",
        },
      ];
    } else if (id === "balance-sheet") {
      const assets = sum(f.assets.map(current)),
        liabilities = sum(f.liabilities.map(current)),
        equity = f.equity[index];
      model.metrics = [
        metric("Total Assets", assets),
        metric("Total Liabilities", liabilities),
        metric("Total Equity", equity),
        metric("Liabilities + Equity", liabilities + equity),
      ];
      model.columns = compareColumns;
      model.rows = [
        row("assets", "Assets", 5480000, 4890000, [
          row(
            "current-assets",
            "Current Assets",
            2780000,
            2420000,
            f.assets
              .slice(0, 3)
              .map((item, i) =>
                row(`asset-${i}`, item.label, item.current, item.previous),
              ),
          ),
          row("fixed-assets", "Non-Current Assets", 2700000, 2470000, [
            row("ppe", "Property, Plant & Equipment", 2700000, 2470000),
          ]),
        ]),
        row("liabilities", "Liabilities", 2160000, 2000000, [
          row(
            "current-liabilities",
            "Current Liabilities",
            1420000,
            1280000,
            f.liabilities
              .slice(0, 2)
              .map((item, i) =>
                row(`liability-${i}`, item.label, item.current, item.previous),
              ),
          ),
          row("long-term", "Non-Current Liabilities", 740000, 720000, [
            row("loan", "Long Term Loan", 740000, 720000),
          ]),
        ]),
        row("equity", "Equity", 3320000, 2890000, [
          row("owner", "Owner’s Equity", 3320000, 2890000),
        ]),
        {
          ...row("total", "Total Liabilities & Equity", 5480000, 4890000),
          highlight: true,
        },
      ];
      model.insights = [
        {
          title: "Total assets increased by 12.1%",
          body: "Assets grew from ₦4,890,000 to ₦5,480,000 in this demo snapshot.",
        },
        {
          title: "Equity ratio is 60.6%",
          body: "Equity of ₦3,320,000 represents 60.6% of assets.",
        },
        {
          title: "Liabilities increased by 8%",
          body: "Liabilities grew from ₦2,000,000 to ₦2,160,000.",
        },
      ];
      model.charts = [
        {
          title: "Financial Position",
          kind: "bars",
          labels: ["Sep", "Oct"],
          series: [
            { label: "Assets", values: [4890000, 5480000], color: colors[0] },
            {
              label: "Liabilities",
              values: [2000000, 2160000],
              color: colors[1],
            },
          ],
          format: "money",
        },
      ];
    } else if (id === "cash-flow") {
      model.metrics = [
        metric("Opening Cash Balance", 1320000),
        metric("Total Cash Inflows", 680000),
        metric("Total Cash Outflows", 440000),
        metric("Closing Cash Balance", 1560000),
      ];
      model.columns = [monetary("Oct 2026")];
      model.section = "Cash Flow Statement";
      const cashRow = (
        id: string,
        label: string,
        value: number,
      ): ReportRow => ({ id, label, values: [value] });
      model.rows = [
        {
          ...cashRow(
            "operating",
            "Cash flows from operating activities",
            350000,
          ),
          children: [
            cashRow("profit", "Net profit before tax", 250000),
            cashRow("depreciation", "Adjustments for depreciation", 80000),
            cashRow("receivable", "Increase in accounts receivable", -130000),
            cashRow("inventory", "Decrease in inventory", 10000),
            cashRow("payable", "Increase in accounts payable", 130000),
            cashRow("other", "Increase in other current liabilities", 10000),
          ],
        },
        {
          ...cashRow(
            "investing",
            "Cash flows from investing activities",
            -310000,
          ),
          children: [cashRow("equipment", "Purchase of equipment", -310000)],
        },
        {
          ...cashRow(
            "financing",
            "Cash flows from financing activities",
            200000,
          ),
          children: [
            cashRow("loan", "Loan proceeds", 20000),
            cashRow("capital", "Owner contribution", 180000),
          ],
        },
        cashRow("net", "Net increase in cash and cash equivalents", 240000),
        cashRow("opening", "Cash balance at beginning of period", 1320000),
        {
          ...cashRow("closing", "Cash balance at end of period", 1560000),
          highlight: true,
        },
      ];
      model.insights = [
        {
          title: "Positive operating cash flow",
          body: "Demo operating activities generated ₦350,000.",
        },
        {
          title: "Investment in equipment",
          body: "₦310,000 was spent on equipment in this example.",
        },
        {
          title: "Cash increased by ₦240,000",
          body: "Opening cash of ₦1,320,000 plus net cash flow equals ₦1,560,000.",
        },
      ];
      model.charts = [
        {
          title: "Cash Flow Overview",
          kind: "bars",
          labels: ["Operating", "Investing", "Financing"],
          series: [
            {
              label: "Cash Inflows",
              values: [480000, 0, 200000],
              color: colors[0],
            },
            {
              label: "Cash Outflows",
              values: [130000, 310000, 0],
              color: colors[1],
            },
          ],
          format: "money",
        },
      ];
    } else {
      const ratioValues = [
        ["Current Ratio", 2780000 / 1420000, 2420000 / 1280000, "ratio"],
        ["Quick Ratio", 2540000 / 1420000, 2170000 / 1280000, "ratio"],
        ["Cash Ratio", 1560000 / 1420000, 1320000 / 1280000, "ratio"],
        [
          "Gross Profit Margin",
          (930000 / 1250000) * 100,
          (840000 / 1120000) * 100,
          "percent",
        ],
        [
          "Net Profit Margin",
          (250000 / 1250000) * 100,
          (100000 / 1120000) * 100,
          "percent",
        ],
        [
          "Return on Assets",
          (250000 / 5480000) * 100,
          (100000 / 4890000) * 100,
          "percent",
        ],
      ] as const;
      model.metrics = [
        metric("Current Ratio", ratioValues[0][1], "ratio"),
        metric("Gross Profit Margin", ratioValues[3][1], "percent"),
        metric("Net Profit Margin", ratioValues[4][1], "percent"),
        metric("Return on Assets", ratioValues[5][1], "percent"),
      ];
      model.columns = [
        { label: "Current period", format: "text" },
        { label: "Previous period", format: "text" },
        { label: "Change", format: "percent" },
      ];
      model.section = "Ratios Summary";
      model.rows = ratioValues.map(([label, a, b, format], i) => ({
        id: `ratio-${i}`,
        label,
        values: [
          format === "percent" ? `${a.toFixed(1)}%` : a.toFixed(2),
          format === "percent" ? `${b.toFixed(1)}%` : b.toFixed(2),
          percentageChange(a, b) ?? "New",
        ],
      }));
      model.insights = [
        {
          title: "Improved liquidity",
          body: "The demo current ratio rose from 1.89 to 1.96.",
        },
        {
          title: "Improved net margin",
          body: "Net profit represents 20% of October sales, compared with 8.9% in September.",
        },
        {
          title: "Period return on assets",
          body: "October’s net profit is 4.6% of closing assets. This is a period ratio, not an annualized return.",
        },
      ];
      model.charts = [
        {
          title: "Liquidity Ratios",
          kind: "bars",
          labels: ["Current Ratio", "Quick Ratio", "Cash Ratio"],
          series: [
            {
              label: "Current Period",
              values: ratioValues.slice(0, 3).map((item) => item[1]),
              color: colors[0],
            },
            {
              label: "Previous Period",
              values: ratioValues.slice(0, 3).map((item) => item[2]),
              color: colors[1],
            },
          ],
          format: "ratio",
        },
      ];
    }
  } else if (id === "trial-balance") {
    const leaves = [
      ...f.assets.map((item) => ({
        label: item.label,
        debit: item.current,
        credit: 0,
        type: item.label.includes("Equipment")
          ? "Non-Current Assets"
          : "Current Assets",
      })),
      ...f.liabilities.map((item) => ({
        label: item.label,
        debit: 0,
        credit: item.current,
        type:
          item.label === "Long Term Loan"
            ? "Non-Current Liabilities"
            : "Current Liabilities",
      })),
      {
        label: "Owner’s Equity",
        debit: 0,
        credit: f.equity[0],
        type: "Equity",
      },
    ];
    const debits = sum(leaves.map((item) => item.debit)),
      credits = sum(leaves.map((item) => item.credit));
    model.notice = snapshotNotice;
    model.metrics = [
      metric("Total Debit", debits),
      metric("Total Credit", credits),
      metric("Total Accounts", leaves.length, "number"),
      metric(
        "Difference",
        debits - credits,
        "money",
        debits === credits ? "Balanced" : "Not balanced",
      ),
    ];
    model.columns = [
      { label: "Type", format: "text" },
      monetary("Debit (₦)"),
      monetary("Credit (₦)"),
      monetary("Balance (₦)"),
    ];
    model.rows = leaves.map((item, i) => ({
      id: `trial-${i}`,
      label: item.label,
      values: [item.type, item.debit, item.credit, item.debit - item.credit],
    }));
    model.rows.push({
      id: "total",
      label: "Total",
      values: ["", debits, credits, debits - credits],
      highlight: true,
    });
  } else if (id === "general-ledger" || id === "journal-entries") {
    if (id === "general-ledger") {
      model.columns = [
        { label: "Reference", format: "text" },
        { label: "Description", format: "text" },
        { label: "Account", format: "text" },
        { label: "Type", format: "text" },
        monetary("Debit"),
        monetary("Credit"),
        monetary("Balance"),
      ];
      model.section = "Date";
      model.rows = ledgerRows(demo.journals, demo.accounts).map((item) => ({
        id: item.id,
        label: item.date,
        date: item.date,
        values: [
          item.reference,
          item.description,
          item.account,
          "Journal",
          item.debit,
          item.credit,
          item.balance,
        ],
        source: { kind: "journal", id: item.journalId },
        account: item.account,
        category: demo.accounts.find((account) => account.name === item.account)
          ?.type,
      }));
      model.rows = filterReportRows(model.rows, filters);
      model.metrics = [
        metric("Total Transactions", model.rows.length, "number"),
        metric(
          "Total Debits",
          sum(model.rows.map((item) => Number(item.values[4]))),
        ),
        metric(
          "Total Credits",
          sum(model.rows.map((item) => Number(item.values[5]))),
        ),
        metric(
          "Accounts Affected",
          new Set(model.rows.map((item) => item.account)).size,
          "number",
        ),
      ];
      model.notice =
        "Derived from valid, balanced demo journals only. Running balances are debit minus credit per account, before date/search filters.";
    } else {
      const valid = demo.journals.filter((journal) => !journalErrors(journal));
      model.section = "ID";
      model.columns = [
        { label: "Journal", format: "text" },
        { label: "Date", format: "text" },
        monetary("Debit"),
        monetary("Credit"),
        { label: "Created by", format: "text" },
        { label: "Status", format: "text" },
      ];
      model.rows = valid.map((journal) => ({
        id: journal.id,
        label: journal.number,
        date: journal.date,
        status: "Balanced",
        values: [
          journal.title,
          journal.date,
          journalTotals(journal.lines).debit,
          journalTotals(journal.lines).credit,
          journal.author,
          "Balanced",
        ],
        source: { kind: "journal", id: journal.id },
      }));
      model.rows = filterReportRows(model.rows, filters);
      model.metrics = [
        metric("Total Journal Entries", model.rows.length, "number"),
        metric(
          "Total Debit",
          sum(model.rows.map((item) => Number(item.values[2]))),
        ),
        metric(
          "Total Credit",
          sum(model.rows.map((item) => Number(item.values[3]))),
        ),
        metric("Balanced Entries", model.rows.length ? 100 : 0, "percent"),
      ];
      model.notice =
        "Posted-entry preview: only valid balanced demo journals appear here. Unbalanced drafts remain available in Accounting › Journal Entries.";
    }
  } else if (id === "receivables") {
    model.section = "Invoice";
    model.columns = [
      { label: "Customer", format: "text" },
      { label: "Issue date", format: "text" },
      { label: "Due date", format: "text" },
      monetary("Total"),
      monetary("Balance due"),
      { label: "Status", format: "text" },
      { label: "Days overdue", format: "number" },
    ];
    model.rows = demo.invoices
      .filter((invoice) => invoice.status !== "Draft")
      .map((invoice) => ({
        id: invoice.id,
        label: invoice.number,
        date: invoice.date,
        partyId: invoice.customerId,
        status: invoice.status,
        values: [
          contactName(
            contacts.find((contact) => contact.id === invoice.customerId) ||
              ({ firstName: "Demo", lastName: "customer" } as Contact),
          ),
          invoice.date,
          invoice.dueDate,
          invoiceAmount(invoice),
          invoiceBalance(invoice),
          invoice.status,
          invoiceBalance(invoice) > 0
            ? daysBetween(invoice.dueDate, reportAsOf)
            : 0,
        ],
        source: { kind: "invoice", id: invoice.id },
      }));
    model.rows = filterReportRows(model.rows, filters);
    const unpaid = model.rows.filter((item) => Number(item.values[4]) > 0);
    model.metrics = [
      metric(
        "Total Outstanding",
        sum(unpaid.map((item) => Number(item.values[4]))),
      ),
      metric(
        "Overdue Amount",
        sum(
          unpaid
            .filter((item) => Number(item.values[6]) > 0)
            .map((item) => Number(item.values[4])),
        ),
      ),
      metric(
        "Total Customers",
        new Set(model.rows.map((item) => item.partyId)).size,
        "number",
      ),
      metric(
        "Average Days Outstanding",
        unpaid.length
          ? Math.round(
              sum(unpaid.map((item) => daysBetween(item.date!, reportAsOf))) /
                unpaid.length,
            )
          : 0,
        "days",
      ),
    ];
    model.notice = `Based on editable, issued demo invoices. Drafts are excluded. Ageing is calculated as of ${reportAsOf}.`;
  } else if (id === "payables") {
    model.section = "Vendor";
    model.columns = [
      { label: "Bill no.", format: "text" },
      { label: "Issue date", format: "text" },
      { label: "Due date", format: "text" },
      monetary("Bill amount"),
      monetary("Balance due"),
      { label: "Status", format: "text" },
      { label: "Days overdue", format: "number" },
    ];
    model.rows = reportBills.map((bill) => ({
      id: bill.id,
      label: `${bill.name} · ${bill.business}`,
      date: bill.date,
      partyId: bill.id,
      status: bill.status,
      values: [
        bill.number,
        bill.date,
        bill.due,
        bill.amount,
        bill.balance,
        bill.status,
        bill.balance > 0 ? daysBetween(bill.due, reportAsOf) : 0,
      ],
      source: { kind: "bill", id: bill.id },
    }));
    model.rows = filterReportRows(model.rows, filters);
    const unpaid = model.rows.filter((item) => Number(item.values[4]) > 0);
    model.metrics = [
      metric(
        "Total Outstanding",
        sum(unpaid.map((item) => Number(item.values[4]))),
      ),
      metric(
        "Overdue Amount",
        sum(
          unpaid
            .filter((item) => Number(item.values[6]) > 0)
            .map((item) => Number(item.values[4])),
        ),
      ),
      metric("Total Vendors", model.rows.length, "number"),
      metric(
        "Average Days Outstanding",
        unpaid.length
          ? Math.round(
              sum(unpaid.map((item) => daysBetween(item.date!, reportAsOf))) /
                unpaid.length,
            )
          : 0,
        "days",
      ),
    ];
    model.notice = `Illustrative vendor bills, as of ${reportAsOf}. Bill editing, source documents and payment history await the Expenses & Bills implementation.`;
  } else if (id === "expenses-summary") {
    const total = sum(expenseSnapshot.map((item) => item.current));
    model.metrics = [
      metric("Total Expenses", total),
      metric(
        "Average Monthly Spend",
        (1200000 + 800000 + 1100000 + 1500000 + 1900000 + total) / 6,
      ),
      metric("Total Categories", expenseSnapshot.length, "number"),
      {
        label: "Largest Expense Category",
        value: expenseSnapshot[0].current,
        format: "money",
        hint: "Marketing",
      },
    ];
    model.section = "Expense Breakdown";
    model.columns = [
      monetary("Total amount"),
      { label: "% of Total", format: "percent" },
      monetary("Previous period"),
      { label: "Change", format: "percent" },
    ];
    model.rows = expenseSnapshot.map((item, i) => ({
      id: `category-${i}`,
      label: item.label,
      values: [
        item.current,
        (item.current / total) * 100,
        item.previous,
        percentageChange(item.current, item.previous) ?? "New",
      ],
    }));
    model.notice =
      "Illustrative category snapshot. Percentage shares and changes are calculated from the displayed amounts; expense transactions are not connected.";
    model.charts = [
      {
        title: "Expenses by Category",
        kind: "donut",
        labels: expenseSnapshot.map((item) => item.label),
        series: [
          {
            label: "Expenses",
            values: expenseSnapshot.map((item) => item.current),
            color: colors[0],
          },
        ],
        format: "money",
      },
      {
        title: "Monthly Expense Trend",
        kind: "line",
        labels: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
        series: [
          {
            label: "Expenses",
            values: [1200000, 800000, 1100000, 1500000, 1900000, total],
            color: colors[0],
          },
        ],
        format: "money",
      },
    ];
  } else {
    const invoices = demo.invoices.filter(
      (invoice) =>
        invoice.status !== "Draft" &&
        (!filters.date || invoice.date === filters.date),
    );
    model.section = "Customer";
    model.columns = [
      { label: "Total invoices", format: "number" },
      monetary("Total sales"),
      monetary("Payment received"),
      monetary("Outstanding"),
    ];
    model.rows = Array.from(
      new Set(invoices.map((invoice) => invoice.customerId)),
    )
      .map((customerId) => {
        const contact = contacts.find((item) => item.id === customerId);
        const own = invoices.filter(
          (invoice) => invoice.customerId === customerId,
        );
        return {
          id: customerId,
          label: contact ? contactName(contact) : "Unavailable demo customer",
          partyId: customerId,
          date: own[0]?.date,
          values: [
            own.length,
            sum(own.map(invoiceAmount)),
            sum(own.map((invoice) => invoice.paid)),
            sum(own.map(invoiceBalance)),
          ],
        };
      })
      .filter((item) => Number(item.values[0]) > 0);
    model.rows = filterReportRows(model.rows, { ...filters, date: undefined });
    const total = sum(model.rows.map((item) => Number(item.values[1]))),
      paid = sum(model.rows.map((item) => Number(item.values[2]))),
      outstanding = sum(model.rows.map((item) => Number(item.values[3]))),
      count = sum(model.rows.map((item) => Number(item.values[0])));
    model.metrics =
      id === "sales-summary"
        ? [
            metric("Total Sales", total),
            metric("Invoices Issued", count, "number"),
            metric("Payment Received", paid),
            metric("Outstanding Sales", outstanding),
          ]
        : [
            metric("Total Sales", total),
            metric("Total Customers", model.rows.length, "number"),
            metric("Invoices Issued", count, "number"),
            metric("Outstanding Sales", outstanding),
          ];
    model.notice =
      "Calculated from editable demo invoices, excluding drafts. Sales here include illustrative invoice VAT; no revenue recognition or bank reconciliation is performed.";
    const dates = Array.from(
      new Set(invoices.map((invoice) => invoice.date)),
    ).sort();
    model.charts = [
      {
        title: "Sales Trend",
        kind: "line",
        labels: dates,
        series: [
          {
            label: "Sales",
            values: dates.map((date) =>
              sum(
                invoices
                  .filter(
                    (invoice) =>
                      invoice.date === date &&
                      model.rows.some(
                        (item) => item.partyId === invoice.customerId,
                      ),
                  )
                  .map(invoiceAmount),
              ),
            ),
            color: colors[0],
          },
        ],
        format: "money",
      },
      {
        title: "Sales by Customer",
        kind: "donut",
        labels: model.rows.map((item) => item.label),
        series: [
          {
            label: "Sales",
            values: model.rows.map((item) => Number(item.values[1])),
            color: colors[0],
          },
        ],
        format: "money",
      },
    ];
  }
  if (
    period === "previous" &&
    (id === "profit-loss" || id === "balance-sheet")
  ) {
    model.rows = mapPrevious(model.rows);
    model.columns = [monetary("Sep 2026")];
    model.insights = undefined;
  }
  return model;
}
function mapPrevious(rows: ReportRow[]): ReportRow[] {
  return rows.map((item) => ({
    ...item,
    values: [item.values[1]],
    children: item.children ? mapPrevious(item.children) : undefined,
  }));
}
export function reportCsvRows(model: ReportModel) {
  return flattenReportRows(model.rows).map((item) => [
    item.label,
    ...item.values,
  ]);
}
export const chartColors = colors;
