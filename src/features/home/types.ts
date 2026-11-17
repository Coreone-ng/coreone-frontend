export type FeatureId =
  "banking" | "invoicing" | "expenses" | "reports" | "teams" | "tax";
export type MockupPosition = { top: number; left: number };
export type Feature = {
  id: FeatureId;
  label: string;
  icon: string;
  activeIcon?: string;
  description: string | null;
  desktop: string | null;
  mobile: string | null;
  desktopCrop?: number;
  mobileCrop?: number;
  desktopPosition?: MockupPosition;
  mobilePosition?: MockupPosition;
  desktopInset?: number;
};
export type PricingPlan = {
  name: string;
  eyebrow: string;
  monthly: number;
  annual: number | null;
  popular?: boolean;
  features: readonly string[];
};
