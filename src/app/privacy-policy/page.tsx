import type { Metadata } from "next";
import { LegalPage } from "@/features/legal/LegalPage";
import document from "@/features/legal/data/privacy.json";
export const metadata: Metadata = { title: "Privacy Policy — CoreOne" };
export default function PrivacyPage() {
  return <LegalPage document={document} />;
}
