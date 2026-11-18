import type { Metadata } from "next";
import { LegalPage } from "@/features/legal/LegalPage";
import document from "@/features/legal/data/terms.json";
export const metadata: Metadata = { title: "Terms of Service — CoreOne" };
export default function TermsPage() {
  return <LegalPage document={document} />;
}
