import type { PricingPlan } from "../types";
export const pricingPlans: readonly PricingPlan[] = [
  {
    name: "Starter",
    eyebrow: "01 / A CLEAR START",
    monthly: 4500,
    annual: null,
    features: [
      "Accounting, up to 2 users",
      "Unlimited invoices & expenses",
      "Chart of Accounts & General Ledger",
      "Basic reports (P&L, Balance Sheet, Trial Balance)",
      "Manual bank accounts",
      "Single-currency accounting",
    ],
  },
  {
    name: "Growth",
    eyebrow: "02 / FOR WHAT’S NEXT",
    monthly: 7000,
    annual: null,
    popular: true,
    features: [
      "Roles & permissions",
      "Receipt OCR",
      "Bank statement import & review",
      "Vendor bills & Accounts Payable",
      "AR/AP ageing reports",
      "Multi-currency accounting",
    ],
  },
  {
    name: "Business",
    eyebrow: "03 / ROOM TO SCALE",
    monthly: 10000,
    annual: null,
    features: [
      "Unlimited users",
      "Advanced reconciliation",
      "Tax & compliance features",
      "Full audit trail",
      "Priority support",
      "Early access to compliance & e-invoicing features",
      "Advanced multi-currency + multiple businesses/entities",
    ],
  },
];
