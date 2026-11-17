import type { Metadata } from "next";
import { site } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoreOne — Smart, simple accounting for modern businesses",
  description: site.description,
  applicationName: site.name,
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a href="#main-content" className="skip-link">Skip to main content</a>{children}</body></html>;
}
