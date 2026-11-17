import type { Feature } from "../types";
const base = "/assets/home/1114-214981";
export const features: readonly Feature[] = [
  {
    id: "banking",
    label: "Banking & Reconciliation",
    icon: `${base}/aaa33.svg`,
    activeIcon: "/assets/home/1110-211618/1f3d5.svg",
    description:
      "Upload your bank statement and review every transaction before it hits your books, no manual retyping, no guesswork.",
    desktop: "/assets/home/5-10/caf37.png",
    mobile: "/assets/home/5-10/3ba8a.png",
    desktopCrop: 188.89,
    mobileCrop: 415.93,
  },
  {
    id: "invoicing",
    label: "Invoicing",
    icon: `${base}/d87b2.svg`,
    activeIcon: "/assets/home/1110-211620/c3f86.svg",
    description:
      "Create professional, branded invoices in minutes, share your bank transfer details, and track exactly who's paid and who hasn't.",
    desktop: "/assets/home/1110-211620/98cf5.png",
    mobile: "/assets/home/1110-211620/6627c.png",
    desktopCrop: 150.42,
    mobileCrop: 195.45,
  },
  {
    id: "expenses",
    label: "Expenses",
    icon: `${base}/1e8f8.svg`,
    activeIcon: "/assets/home/expenses/active-icon.svg",
    description:
      "Snap or upload a receipt and let OCR pull out the vendor, date and amount for you, ready for your review before it’s posted.",
    desktop: "/assets/home/expenses/desktop.png",
    mobile: "/assets/home/expenses/mobile.png",
    desktopCrop: 150.41657,
    mobileCrop: 189.853831,
    desktopPosition: { top: -0.0253501, left: 0.00686484 },
    mobilePosition: { top: -0.0019048, left: -0.0258797 },
  },
  {
    id: "reports",
    label: "Reports",
    icon: `${base}/a2246.svg`,
    activeIcon: "/assets/home/reports/active-icon.svg",
    description:
      "Profit & Loss, Balance Sheet, Trial Balance and more — generated straight from your ledger, always accurate, always current.",
    desktop: "/assets/home/reports/desktop.png",
    mobile: "/assets/home/reports/mobile.png",
    desktopCrop: 150.41657,
    mobileCrop: 202.804775,
    desktopPosition: { top: -0.0248021, left: -0.012755 },
    mobilePosition: { top: -0.0234927, left: -0.0961693 },
    desktopInset: 64,
  },
  {
    id: "teams",
    label: "Teams & Roles",
    icon: "/assets/home/1110-211618/e9dc6.svg",
    activeIcon: `${base}/82a0a.svg`,
    description:
      "Invite your accountant or finance team with access that matches exactly what they need to do — nothing more, nothing less.",
    desktop: `${base}/3231b.png`,
    mobile: `${base}/594cc.png`,
    desktopCrop: 119.72,
    mobileCrop: 205.53,
  },
  {
    id: "tax",
    label: "Know Your Tax Position",
    icon: `${base}/f7ab0.svg`,
    description:
      "Keep your financial records organised for tax, calculate applicable obligations and stay prepared for changing local compliance requirements.",
    desktop: "/assets/home/5-10/caf37.png",
    mobile: "/assets/home/5-10/3ba8a.png",
    desktopCrop: 188.89,
    mobileCrop: 415.93,
  },
];
