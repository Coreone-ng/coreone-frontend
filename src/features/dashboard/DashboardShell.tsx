"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { authRequest } from "@/features/auth/client";
import { useWorkspace } from "./WorkspaceProvider";
import { AppButton, Dialog, Icon, PendingDialog, Search } from "./components";
import styles from "./Dashboard.module.css";

const navigation = [
  { label: "Dashboard", icon: "dashboard", href: "/dashboard" },
  {
    label: "Customers & Vendors",
    icon: "customers",
    href: "/dashboard/customers",
  },
  {
    label: "Accounting",
    icon: "accounting",
    href: "/dashboard/bank-transactions",
  },
  { label: "Invoicing", icon: "invoice", href: "/dashboard/invoicing" },
  { label: "Expenses & Bills", icon: "expenses" },
  { label: "Reporting", icon: "reports" },
  { label: "Administration", icon: "administration" },
  { label: "Settings", icon: "settings", href: "/dashboard/settings" },
];
export function DashboardShell({ children }: { children: ReactNode }) {
  const { snapshot, demo } = useWorkspace();
  const user = snapshot.user!;
  const router = useRouter();
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [pending, setPending] = useState("");
  const [notification, setNotification] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [error, setError] = useState("");
  const accounting = [
    "bank-transactions",
    "journal-entries",
    "general-ledger",
    "chart-of-accounts",
    "reconciliation",
  ].some((segment) => path.includes(segment));
  const name = `${user.first_name} ${user.last_name}`.trim();
  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setError("");
    try {
      await authRequest("logout");
      router.replace("/sign-in");
    } catch {
      setError("We couldn’t sign you out. Please try again.");
      setLoggingOut(false);
    }
  }
  const nav = (
    <>
      <Search
        value={search}
        onChange={setSearch}
        label="Search navigation"
        placeholder="Search"
      />
      <nav aria-label="Workspace navigation" className={styles.nav}>
        {navigation
          .filter((item) =>
            item.label.toLowerCase().includes(search.toLowerCase()),
          )
          .map((item) => {
            const active =
              item.href === "/dashboard"
                ? path === item.href
                : item.label === "Accounting"
                  ? accounting
                  : !!item.href && path.startsWith(item.href);
            return (
              <div key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={`${styles.navItem} ${active ? styles.navActive : ""}`}
                    onClick={() => setMobileMenu(false)}
                  >
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                    {item.label === "Accounting" && (
                      <b className={styles.chevron} aria-hidden="true">
                        {accounting ? "⌃" : "⌄"}
                      </b>
                    )}
                  </Link>
                ) : (
                  <button
                    className={styles.navItem}
                    onClick={() => {
                      setPending(`${item.label} is coming next`);
                      setMobileMenu(false);
                    }}
                    title={`${item.label} — upcoming handoff`}
                  >
                    <Icon name={item.icon} />
                    <span>{item.label}</span>
                    {[
                      "Expenses & Bills",
                      "Administration",
                      "Settings",
                    ].includes(item.label) && (
                      <b className={styles.chevron} aria-hidden="true">
                        ⌄
                      </b>
                    )}
                  </button>
                )}
                {item.label === "Accounting" && accounting && (
                  <div className={styles.subnav}>
                    {[
                      ["bank-transactions", "Bank Transaction"],
                      ["journal-entries", "Journal Entries"],
                      ["general-ledger", "General Ledger"],
                      ["chart-of-accounts", "Chart of Accounts"],
                      ["reconciliation", "Reconciliation"],
                    ].map(([route, label]) => (
                      <Link
                        key={route}
                        href={`/dashboard/${route}`}
                        aria-current={
                          path === `/dashboard/${route}` ? "page" : undefined
                        }
                        onClick={() => setMobileMenu(false)}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        {!navigation.some((item) =>
          item.label.toLowerCase().includes(search.toLowerCase()),
        ) && <p className={styles.muted}>No navigation matches.</p>}
      </nav>
    </>
  );
  return (
    <div
      data-demo-theme={demo.settings.appearance.toLowerCase()}
      className={`${styles.workspace} ${collapsed ? styles.collapsed : ""}`}
    >
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Link href="/dashboard" aria-label="CoreOne dashboard">
            <img
              src="/assets/brand/coreone.svg"
              alt="CoreOne"
              width="164"
              height="34"
            />
          </Link>
          <button
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>
        {nav}
        <div className={styles.sidebarAccount}>
          <span className={styles.avatar}>
            <Icon name="user" />
          </span>
          <span className={styles.identity}>
            <strong>{name}</strong>
            <small>{user.email}</small>
          </span>
          <button
            onClick={() => setConfirmLogout(true)}
            disabled={loggingOut}
            aria-label="Sign out"
          >
            <Icon name="logout" />
          </button>
        </div>
      </aside>
      <div className={styles.appBody}>
        <header className={styles.topbar}>
          <button
            className={styles.mobileMenu}
            onClick={() => setMobileMenu(true)}
            aria-label="Open navigation"
          >
            <Icon name="menu" />
          </button>
          <div className={styles.greeting}>
            <p>
              Hello,{" "}
              <strong>
                {snapshot.organization?.legal_name || "Swiftroletech Limited"}
              </strong>
            </p>
            <div>
              {name}
              <span className={styles.samplePill}>• Sample workspace</span>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.notifications}
              aria-label="View sample notifications"
              onClick={() => setNotification(true)}
            >
              <Icon name="notification" />
              <span>10</span>
            </button>
            <details className={styles.accountMenu}>
              <summary aria-label="Account menu">
                <span className={styles.avatar}>
                  <Icon name="user" />
                </span>
                <span aria-hidden="true">⌄</span>
              </summary>
              <div>
                <strong>{name}</strong>
                <span>{user.email}</span>
                <button
                  className={styles.textButton}
                  onClick={() => router.push("/dashboard/settings/account")}
                >
                  View Profile
                </button>
                <AppButton
                  variant="secondary"
                  disabled={loggingOut}
                  onClick={() => setConfirmLogout(true)}
                >
                  {loggingOut ? "Signing out…" : "Sign out"}
                </AppButton>
              </div>
            </details>
          </div>
        </header>
        <main id="main-content" className={styles.main}>
          <div className={styles.previewBanner}>
            <span>
              <strong>Sample data.</strong> Changes stay in this tab and reset
              on refresh.{" "}
              {snapshot.next_step === "create_business" && (
                <>
                  Your business is not set up yet.{" "}
                  <Link href="/onboarding/account-type">Complete setup</Link>.
                </>
              )}
            </span>
            <button onClick={() => setPending("More flows are on the way")}>
              What’s pending?
            </button>
          </div>
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
          {children}
        </main>
      </div>
      {mobileMenu && (
        <Dialog title="Navigation" onClose={() => setMobileMenu(false)} drawer>
          {nav}
        </Dialog>
      )}
      {pending === "More flows are on the way" ? (
        <Dialog
          title="More flows are on the way"
          description="These flows are awaiting the next design handoff or live service integration."
          onClose={() => setPending("")}
        >
          <ul className={styles.pendingList}>
            <li>
              Individual profile saving, logo upload, and workspace selection.
            </li>
            <li>
              Live invoice delivery, payment allocation, and note previews.
            </li>
            <li>
              Expenses, reporting, administration, and live billing and security
              services.
            </li>
            <li>
              Live bank authorization, statement processing, and mobile pairing.
            </li>
            <li>Analytics, activity history, and notification destinations.</li>
          </ul>
          <p className={styles.small}>
            Current records and bank flows are clearly labeled samples. These
            previews do not submit accounting records.
          </p>
          <AppButton onClick={() => setPending("")}>Got it</AppButton>
        </Dialog>
      ) : (
        pending && (
          <PendingDialog title={pending} onClose={() => setPending("")} />
        )
      )}{" "}
      {confirmLogout && (
        <Dialog
          title="Logout Your Account?"
          sample={false}
          description="Are you sure you want to logout your account?"
          onClose={() => {
            if (!loggingOut) setConfirmLogout(false);
          }}
        >
          <div className={styles.dialogActions}>
            <AppButton
              variant="secondary"
              disabled={loggingOut}
              onClick={() => setConfirmLogout(false)}
            >
              Cancel
            </AppButton>
            <AppButton
              variant="danger"
              className={styles.logoutConfirmAction}
              disabled={loggingOut}
              onClick={logout}
            >
              {loggingOut ? "Signing out…" : "Yes, log me out"}
            </AppButton>
          </div>
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
        </Dialog>
      )}
      {notification && (
        <Dialog
          title="Sample notifications"
          description="These notifications illustrate the supplied design; they are not account activity."
          onClose={() => setNotification(false)}
        >
          <div className={styles.notificationList}>
            {[
              "Invoice created · INV-0024 · Acme Solutions",
              "Expenses recorded · INV-0024 · Acme Solutions",
              "3 invoices are past their due date.",
            ].map((text) => (
              <p key={text}>
                {text}
                <small>Today · sample</small>
              </p>
            ))}
          </div>
          <AppButton onClick={() => setNotification(false)}>Close</AppButton>
        </Dialog>
      )}
    </div>
  );
}
