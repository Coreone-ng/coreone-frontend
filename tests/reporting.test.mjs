import test from "node:test";
import assert from "node:assert/strict";
import {
  buildReport,
  daysBetween,
  flattenReportRows,
  percentageChange,
  reportCsvRows,
  reportDefinitions,
  reportHref,
} from "../src/features/dashboard/report-model.ts";
import { createDemoState } from "../src/features/dashboard/demo.ts";
import { sampleContacts } from "../src/features/dashboard/model.ts";
const report = (id, filters = {}, period = "current") =>
  buildReport(id, createDemoState(), sampleContacts, filters, period);
test("financial statements and trial balance calculate coherent totals without counting parent rows twice", () => {
  const profit = report("profit-loss");
  assert.equal(profit.metrics[2].value, 250000);
  assert.equal(profit.metrics[3].value, 20);
  assert.equal(profit.rows.at(-1).values[0], 250000);
  const balance = report("balance-sheet");
  assert.equal(
    balance.metrics[0].value,
    balance.metrics[1].value + balance.metrics[2].value,
  );
  const trial = report("trial-balance");
  assert.equal(trial.metrics[0].value, 5480000);
  assert.equal(trial.metrics[0].value, trial.metrics[1].value);
  assert.equal(trial.metrics[3].value, 0);
  assert.equal(trial.rows.at(-1).values.at(-1), 0);
  assert.equal(report("profit-loss", {}, "previous").metrics[2].value, 100000);
  assert.deepEqual(
    report("profit-loss", {}, "previous").rows.at(-1).values,
    [100000],
  );
});
test("receivables exclude drafts, follow payment allocations and filter metrics along with rows", () => {
  const model = report("receivables");
  assert.equal(model.rows.length, 7);
  assert.equal(model.metrics[0].value, 1650000);
  const paid = report("receivables", { status: "Paid" });
  assert.equal(paid.rows.length, 4);
  assert.equal(paid.metrics[0].value, 0);
  assert(paid.rows.every((row) => row.values[6] === 0));
  const none = report("receivables", { date: "2020-01-01" });
  assert.equal(none.rows.length, 0);
  assert(none.metrics.every((item) => item.value === 0));
  const state = createDemoState();
  state.invoices[0].paid = 100000;
  assert.equal(
    buildReport("receivables", state, sampleContacts).metrics[0].value,
    1550000,
  );
});
test("sales reports group actual demo invoices and retain amounts when filtered by customer", () => {
  const all = report("sales-summary");
  assert.equal(all.metrics[0].value, 4550000);
  assert.equal(all.metrics[1].value, 7);
  assert.equal(all.metrics[2].value, 2900000);
  assert.equal(all.metrics[3].value, 1650000);
  const one = report("customer-sales", { party: "sample-1" });
  assert.equal(one.rows.length, 1);
  assert.equal(one.metrics[0].value, 650000);
  const removedContact = buildReport(
    "sales-summary",
    createDemoState(),
    sampleContacts.filter((contact) => contact.id !== "sample-1"),
  );
  assert.equal(removedContact.metrics[0].value, 4550000);
  assert(
    removedContact.rows.some(
      (row) => row.label === "Unavailable demo customer",
    ),
  );
  const empty = report("sales-summary", { date: "2020-01-01" });
  assert.equal(empty.rows.length, 0);
  assert.equal(empty.charts[0].labels.length, 0);
});
test("reporting ledger and posted journals exclude unbalanced drafts and support compound filtering", () => {
  const journals = report("journal-entries");
  assert.equal(journals.rows.length, 6);
  assert.equal(journals.metrics[3].value, 100);
  const ledger = report("general-ledger", {
    account: "Depreciation expense",
    category: "Expense",
    date: "2026-09-24",
    transaction: "journal",
  });
  assert.equal(ledger.rows.length, 6);
  assert.equal(ledger.metrics[1].value, 3900000);
  assert.equal(ledger.metrics[2].value, 0);
  const none = report("journal-entries", { query: "unknown" });
  assert(none.metrics.every((item) => item.value === 0));
});
test("cash flow, category shares and ratios are calculated from demo inputs", () => {
  const cash = report("cash-flow");
  assert.equal(
    cash.metrics[0].value + cash.metrics[1].value - cash.metrics[2].value,
    cash.metrics[3].value,
  );
  const groups = cash.rows.slice(0, 3);
  for (const row of groups)
    assert.equal(
      row.children.reduce((sum, item) => sum + item.values[0], 0),
      row.values[0],
    );
  assert.equal(
    groups.reduce((sum, item) => sum + item.values[0], 0),
    cash.rows[3].values[0],
  );
  const expenses = report("expenses-summary");
  assert.equal(
    Math.round(expenses.rows.reduce((sum, item) => sum + item.values[1], 0)),
    100,
  );
  assert.equal(expenses.metrics[1].value, 1290000);
  const ratios = report("financial-ratios");
  assert.equal(ratios.metrics[2].value, 20);
  assert.equal(percentageChange(1, 0), null);
  assert.equal(percentageChange(250000, 100000), 150);
  assert.equal(daysBetween("2026-10-24", "2026-11-23"), 30);
  assert.equal(daysBetween("invalid", "2026-11-23"), 0);
});
test("exports preserve all statement descendants and report definitions resolve to supported pages", () => {
  const model = report("balance-sheet");
  assert.equal(
    reportCsvRows(model).length,
    flattenReportRows(model.rows).length,
  );
  assert(reportCsvRows(model).some((row) => row[0] === "Cash and Bank"));
  assert.equal(reportDefinitions.length, 13);
  assert.equal(reportHref("bank-activity"), "/dashboard/bank-transactions");
  assert.equal(reportHref("profit-loss"), "/dashboard/reporting/profit-loss");
});
