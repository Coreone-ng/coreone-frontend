import test from "node:test";
import assert from "node:assert/strict";
import {
  filterContacts,
  invoiceTotals,
  sampleContacts,
  initials,
} from "../src/features/dashboard/model.ts";

test("customer search combines identity, status, balance and country without mutating samples", () => {
  const before = structuredClone(sampleContacts);
  assert.equal(
    filterContacts(
      sampleContacts,
      "MALINEPO@GMAIL.COM",
      "Customer",
      "Active",
      "outstanding",
      "Nigeria",
    ).length,
    6,
  );
  assert.equal(
    filterContacts(sampleContacts, "08056199263", "Customer", "Inactive")
      .length,
    2,
  );
  assert.equal(filterContacts(sampleContacts, "missing").length, 0);
  assert.equal(filterContacts(sampleContacts, "", "Vendor").length, 0);
  assert.equal(filterContacts(sampleContacts, "", "", "", "zero").length, 0);
  assert.deepEqual(sampleContacts, before);
});

test("sample draft calculations round currency and keep discount separate from VAT", () => {
  assert.deepEqual(
    invoiceTotals([{ description: "Consulting", quantity: 2, rate: 500 }], 10),
    { subtotal: 1000, vat: 75, discount: 100, total: 975 },
  );
  assert.deepEqual(
    invoiceTotals([{ description: "Fractional", quantity: 3, rate: 0.1 }], 0),
    { subtotal: 0.3, vat: 0.02, discount: 0, total: 0.32 },
  );
});

test("invalid or negative draft values do not produce negative subtotals or unlimited discounts", () => {
  assert.deepEqual(
    invoiceTotals(
      [
        { description: "Invalid", quantity: NaN, rate: 10 },
        { description: "Negative", quantity: -1, rate: 200 },
      ],
      -20,
    ),
    { subtotal: 0, vat: 0, discount: 0, total: 0 },
  );
  assert.equal(
    invoiceTotals([{ description: "Item", quantity: 1, rate: 100 }], 200)
      .discount,
    100,
  );
});

test("contact initials safely handle whitespace and single names", () => {
  assert.equal(initials("  Pomaline   Moses "), "PM");
  assert.equal(initials("Ada"), "A");
  assert.equal(initials(""), "");
});
