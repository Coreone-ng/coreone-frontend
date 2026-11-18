import type { ReactNode } from "react";
import { SiteHeader } from "../SiteHeader/SiteHeader";
import { SiteFooter } from "../SiteFooter/SiteFooter";
import styles from "./MarketingPage.module.css";

export function MarketingPage({
  children,
  tone = "white",
}: {
  children: ReactNode;
  tone?: "white" | "cyan";
}) {
  return (
    <>
      <div className={`${styles.header} ${tone === "cyan" ? styles.cyan : ""}`}>
        <SiteHeader />
      </div>
      <main id="main-content">{children}</main>
      <SiteFooter />
    </>
  );
}
