import test from "node:test";
import assert from "node:assert/strict";
import {
  createDemoState,
  invoiceSummary,
  invoiceBalance,
  journalErrors,
  journalTotals,
  ledgerRows,
  reconciliationTotals,
  csvContent,
} from "../src/features/dashboard/demo.ts";

test("invoice summary excludes drafts from receivables and counts allocated payments", () => {
  const state = createDemoState();
  const sums = invoiceSummary(state.invoices);
  assert.equal(sums.drafts, 1);
  assert.equal(sums.overdue, 650000);
  assert.equal(sums.outstanding, 1650000);
  assert.equal(sums.paid, 2900000);
  assert.equal(invoiceBalance({ ...state.invoices[0], paid: 900000 }), 0);
});
test("unbalanced and invalid journal lines are rejected, and only balanced journals reach the ledger", () => {
  const state = createDemoState();
  const journal = structuredClone(state.journals[0]);
  assert.equal(journalErrors(journal), "");
  assert.equal(journalTotals(state.journals[1].lines).difference, 30000);
  assert.match(journalErrors(state.journals[1]), /must match/);
  journal.lines[0].credit = 1;
  assert.match(journalErrors(journal), /either debit or credit/);
  const rows = ledgerRows(state.journals, state.accounts);
  assert.equal(rows.length, 12);
  assert.equal(
    rows.reduce((sum, row) => sum + row.debit - row.credit, 0),
    0,
  );
  assert.ok(!rows.some((row) => row.journalId === state.journals[1].id));
});
test("reconciliation computes real differences and counts each cleared transaction once", () => {
  const record = createDemoState().reconciliations[0];
  assert.equal(reconciliationTotals(record).difference, 0);
  const sums = reconciliationTotals({
    ...record,
    selectedIds: ["clear-0", "clear-0", "unknown"],
    serviceCharge: 100,
    interest: 50,
  });
  assert.equal(sums.payments, 650000);
  assert.equal(sums.cleared, 1799950);
  assert.equal(sums.difference, 650050);
});
test("demo state resets independently and CSV exports quote data and neutralize formulas", () => {
  const first = createDemoState();
  first.settings.linkedBanks.pop();
  first.invoices[0].title = "changed";
  const second = createDemoState();
  assert.equal(second.settings.linkedBanks.length, 2);
  assert.notEqual(second.invoices[0].title, "changed");
  const csv = csvContent(
    ["Name", "Amount"],
    [
      ['=HYPERLINK("bad")', -25],
      ["a,b", 1],
    ],
  );
  assert.ok(csv.includes('"\'=HYPERLINK(""bad"")"'));
  assert.ok(csv.includes('"-25"'));
  assert.ok(csv.includes('"a,b"'));
});
