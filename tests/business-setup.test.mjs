import test from "node:test";
import assert from "node:assert/strict";
import { businessErrors } from "../src/features/auth/business.ts";

const options = {
  industries: [
    {
      value: "technology_telecommunications",
      label: "Technology/Telecommunication Service",
    },
  ],
  business_structures: [
    { value: "limited_liability_company", label: "Limited Liability Company" },
  ],
  owner_roles: [{ value: "owner_partner", label: "Owner or Partner" }],
  employee_ranges: [{ value: "1-10", label: "1–10" }],
  goals: [
    { value: "track_bills", label: "Track your bills" },
    { value: "send_invoices", label: "Send and track invoices" },
  ],
};
const valid = {
  legal_name: "Example Limited",
  industry: "technology_telecommunications",
  business_structure: "limited_liability_company",
  owner_role: "owner_partner",
  employee_range: "1-10",
  goals: ["track_bills"],
};
test("business setup accepts only the backend's option values and a bounded legal name", () => {
  assert.deepEqual(businessErrors(valid, options), {});
  assert.deepEqual(
    Object.keys(
      businessErrors(
        {
          ...valid,
          legal_name: " ",
          industry: "Technology/Telecommunication Service",
          owner_role: "administrator",
        },
        options,
      ),
    ).sort(),
    ["industry", "legal_name", "owner_role"],
  );
  assert.ok(
    businessErrors({ ...valid, legal_name: "x".repeat(201) }, options)
      .legal_name,
  );
});
test("goals may be empty but cannot contain duplicates, unknown values, or more than six entries", () => {
  assert.deepEqual(businessErrors({ ...valid, goals: [] }, options), {});
  for (const goals of [
    ["track_bills", "track_bills"],
    ["unknown"],
    Array(7).fill("track_bills"),
    "track_bills",
  ])
    assert.ok(businessErrors({ ...valid, goals }, options).goals);
});
test("an individual profile is not silently converted to an organization", () => {
  const errors = businessErrors(
    {
      legal_name: "Ada Example",
      industry: valid.industry,
      business_structure: "sole_proprietorship",
      goals: [],
    },
    options,
  );
  assert.ok(errors.owner_role);
  assert.ok(errors.employee_range);
});
