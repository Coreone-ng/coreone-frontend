"use client";
import Link from "next/link";
import { useState } from "react";
import {
  AppButton,
  Dialog,
  Field,
  Icon,
  Panel,
  Select,
  Status,
} from "./components";
import {
  Attachment,
  ConfirmDemo,
  DemoNotice,
  ModuleHeading,
  RecordsTable,
} from "./ModuleUI";
import { type DemoSettings, downloadDemoCsv } from "./demo";
import { money } from "./model";
import { useWorkspace } from "./WorkspaceProvider";
import { BankWorkflow } from "./BankWorkflow";
import styles from "./Dashboard.module.css";
import ui from "./Modules.module.css";

export type SettingsTab =
  "account" | "billing" | "security" | "banks" | "preferences";
const tabs: [SettingsTab, string][] = [
  ["account", "My Account"],
  ["billing", "Plan & Billing"],
  ["security", "Security"],
  ["banks", "Bank Integrations"],
  ["preferences", "Preferences"],
];
function SettingsEdit({
  kind,
  onClose,
  onSaved,
}: {
  kind: "personal" | "business" | "address";
  onClose: () => void;
  onSaved: () => void;
}) {
  const { demo, setDemo } = useWorkspace();
  const [draft, setDraft] = useState({ ...demo.settings });
  const [error, setError] = useState("");
  const [logo, setLogo] = useState("");
  const update = (key: keyof DemoSettings, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const fields =
    kind === "personal"
      ? [
          ["firstName", "First Name"],
          ["lastName", "Last Name"],
          ["email", "Email"],
          ["phone", "Phone Number"],
        ]
      : kind === "business"
        ? [
            ["businessName", "Business Name"],
            ["businessEmail", "Business Email"],
            ["tin", "Tax Identification Number (TIN)"],
            ["industry", "Industry"],
            ["structure", "Business Structure"],
            ["phone", "Phone Number"],
            ["employees", "Number of Employees"],
          ]
        : [
            ["street", "Street"],
            ["city", "City/State"],
            ["country", "Country"],
          ];
  return (
    <Dialog
      title={
        kind === "personal"
          ? "Edit Personal Information"
          : kind === "business"
            ? "Edit Business Information"
            : "Edit Address Information"
      }
      drawer
      onClose={onClose}
    >
      <DemoNotice>
        These edits apply only to the sample profile. Your login, email,
        business and real account stay unchanged.
      </DemoNotice>
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (
            fields.some(
              ([key]) => !String(draft[key as keyof DemoSettings]).trim(),
            ) ||
            !/^\S+@\S+\.\S+$/.test(draft.email) ||
            !/^\S+@\S+\.\S+$/.test(draft.businessEmail)
          ) {
            setError(
              "Complete the fields and enter valid demo email addresses.",
            );
            return;
          }
          setDemo((current) => ({ ...current, settings: draft }));
          onSaved();
          onClose();
        }}
      >
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        {fields.map(([key, label]) => (
          <Field
            key={key}
            label={label}
            value={String(draft[key as keyof DemoSettings])}
            onChange={(e) => update(key as keyof DemoSettings, e.target.value)}
            type={
              key.toLowerCase().includes("email")
                ? "email"
                : key === "phone"
                  ? "tel"
                  : "text"
            }
            maxLength={300}
          />
        ))}
        {kind === "business" && (
          <Attachment
            name={logo || undefined}
            onSelect={(file) => setLogo(file.name)}
          />
        )}
        <div className={styles.dialogActions}>
          <AppButton variant="secondary" onClick={onClose}>
            Back
          </AppButton>
          <AppButton type="submit">Save demo changes</AppButton>
        </div>
      </form>
    </Dialog>
  );
}
export function Settings({ tab }: { tab: SettingsTab }) {
  const { demo, setDemo, setBankConnected } = useWorkspace();
  const s = demo.settings;
  const [edit, setEdit] = useState<"personal" | "business" | "address">();
  const [modal, setModal] = useState<
    | "password"
    | "password-done"
    | "two-factor"
    | "method"
    | "bank-details"
    | "plan"
    | "receipt"
  >();
  const [receipt, setReceipt] = useState("2026-10-20");
  const [unlink, setUnlink] = useState<string>();
  const [workflow, setWorkflow] = useState(false);
  const [notice, setNotice] = useState("");
  const [logo, setLogo] = useState("");
  const update = (patch: Partial<DemoSettings>) =>
    setDemo((current) => ({
      ...current,
      settings: { ...current.settings, ...patch },
    }));
  function block(
    title: string,
    description: string,
    children: React.ReactNode,
    action?: React.ReactNode,
  ) {
    return (
      <section className={ui.settingsBlock}>
        <div className={ui.blockHeading}>
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
          {action}
        </div>
        {children}
      </section>
    );
  }
  return (
    <>
      <ModuleHeading
        section={`Settings › ${tabs.find((row) => row[0] === tab)?.[1]}`}
        title="Settings"
        description="Manage your business, accounting preferences and workspace"
      />
      <div className={ui.settingsLayout}>
        <nav className={ui.settingsNav} aria-label="Settings sections">
          <small>GENERAL</small>
          {tabs.map(([id, label]) => (
            <Link
              key={id}
              href={`/dashboard/settings/${id}`}
              aria-current={tab === id ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <Panel className={ui.settingsContent}>
          <DemoNotice>
            Demo settings only. Saving here does not change your real profile,
            security, subscriptions or connected banks.
          </DemoNotice>
          {notice && (
            <p className={styles.inlineNotice} role="status">
              {notice}
            </p>
          )}
          {tab === "account" ? (
            <>
              <h2>Business Profile</h2>
              <p className={styles.muted}>
                Manage your personal and business information
              </p>
              {block(
                "Personal Information",
                "Manage your personal details.",
                <>
                  <div className={ui.profileBadge}>
                    <span className={styles.initialAvatar}>
                      {s.firstName[0]}
                      {s.lastName[0]}
                    </span>
                    <div>
                      <h3>
                        {s.firstName} {s.lastName}
                      </h3>
                      <p>{s.email}</p>
                    </div>
                  </div>
                  <dl className={ui.profileGrid}>
                    {[
                      ["First Name", s.firstName],
                      ["Last Name", s.lastName],
                      ["Email Address", s.email],
                      ["Role", s.role],
                      ["Phone Number", s.phone],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </>,
                <AppButton
                  variant="secondary"
                  onClick={() => setEdit("personal")}
                >
                  Edit Personal Details
                </AppButton>,
              )}
              {block(
                "Business Information",
                "Manage your business identity and registered details.",
                <>
                  <h3>{s.businessName}</h3>
                  <p className={styles.muted}>RC No. 12345678 · demo</p>
                  <dl className={ui.profileGrid}>
                    {[
                      ["Business Email", s.businessEmail],
                      ["Tax Identification Number (TIN)", s.tin],
                      ["Industry", s.industry],
                      ["Business Structure", s.structure],
                      ["Number of Employees", s.employees],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </>,
                <AppButton
                  variant="secondary"
                  onClick={() => setEdit("business")}
                >
                  Edit Business Details
                </AppButton>,
              )}
              {block(
                "Address Information",
                "",
                <dl className={ui.profileGrid}>
                  {[
                    ["Street", s.street],
                    ["City/State", s.city],
                    ["Country", s.country],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>,
                <AppButton
                  variant="secondary"
                  onClick={() => setEdit("address")}
                >
                  Edit Address Details
                </AppButton>,
              )}
            </>
          ) : tab === "billing" ? (
            <>
              {block(
                "Basic plan",
                "Demo subscription · no auto-renewal or charge is scheduled.",
                <Status>Monthly</Status>,
                <AppButton variant="secondary" onClick={() => setModal("plan")}>
                  Change Plan
                </AppButton>,
              )}
              {block(
                "Payment method",
                "Change how you pay for your plan.",
                <div className={ui.paymentCard}>
                  {s.paymentMethod === "Card Payment" ? (
                    <>
                      <img
                        src="/assets/dashboard/visa.svg"
                        width="48"
                        height="32"
                        alt="Visa"
                      />
                      <div>
                        <strong>Visa ending in 1234 · demo</strong>
                        <p>Expiry 06/2032</p>
                        <p>{s.email}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Icon name="accounting" />
                      <div>
                        <strong>Bank Transfer · demo</strong>
                        <p>
                          Pay your subscription by transferring to our account
                        </p>
                        <button
                          className={styles.textButton}
                          onClick={() => setModal("bank-details")}
                        >
                          View demo bank details
                        </button>
                      </div>
                    </>
                  )}
                  <AppButton
                    variant="secondary"
                    onClick={() => setModal("method")}
                  >
                    Update payment method
                  </AppButton>
                </div>,
              )}
              {block(
                "Invoices",
                "View and download your past invoices and payment receipts",
                <RecordsTable
                  label="Demo subscription invoices"
                  headers={["Date", "Total", "Status", "Action"]}
                  rows={["2026-10-20", "2026-09-20"].map((date) => ({
                    id: date,
                    cells: [
                      date,
                      money(12000),
                      <Status key="status">Paid</Status>,
                      <button
                        key="pdf"
                        className={styles.textButton}
                        onClick={() => {
                          setReceipt(date);
                          setModal("receipt");
                        }}
                      >
                        Download PDF
                      </button>,
                    ],
                  }))}
                />,
              )}
            </>
          ) : tab === "security" ? (
            <>
              <h2>Security</h2>
              <p className={styles.muted}>
                Keep your account secure with strong passwords and additional
                protection options.
              </p>
              {block(
                "Password",
                "Change your password regularly to keep your account secure",
                null,
                <AppButton
                  variant="secondary"
                  onClick={() => setModal("password")}
                >
                  Change Password
                </AppButton>,
              )}
              {block(
                "Two-Factor Authentication (2FA)",
                "Add an extra layer of security to your account. You’ll need your password and a verification code to sign in.",
                <div className={ui.twoFactor}>
                  <div>
                    <Status>
                      {s.twoFactor ? "Demo 2FA Enabled" : "Demo 2FA Disabled"}
                    </Status>
                    <p>
                      {s.twoFactor
                        ? "Enabled state preview · no authenticator has been enrolled"
                        : "Enable two-factor authenticator · demo preview"}
                    </p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={s.twoFactor}
                    aria-label="Demo two-factor authentication"
                    className={ui.switch}
                    onClick={() => setModal("two-factor")}
                  />
                </div>,
              )}
              {block(
                "Devices",
                "These sessions are illustrative and are not your current login sessions.",
                <RecordsTable
                  label="Demo security devices"
                  headers={[
                    "Device",
                    "Location",
                    "Last active",
                    "Status",
                    "Action",
                  ]}
                  rows={[
                    {
                      id: "mac",
                      cells: [
                        <span key="device">
                          <Icon name="monitor" /> Macbook Pro
                        </span>,
                        "Lagos, Nigeria",
                        "Now",
                        <Status key="status">Active</Status>,
                      ],
                      actions: [
                        {
                          label: "View demo device",
                          onClick: () =>
                            setNotice(
                              "Demo Macbook Pro in Lagos. Real session management is not connected here.",
                            ),
                        },
                      ],
                    },
                    {
                      id: "mobile",
                      cells: [
                        <span key="device">
                          <Icon name="mobile" /> Macbook Pro
                        </span>,
                        "Abuja, Nigeria",
                        "1 day ago",
                        <Status key="status">Inactive</Status>,
                      ],
                      actions: [
                        {
                          label: "View demo device",
                          onClick: () =>
                            setNotice(
                              "Demo device in Abuja. No real session was ended.",
                            ),
                        },
                      ],
                    },
                  ]}
                />,
              )}
            </>
          ) : tab === "banks" ? (
            <>
              <h2>Bank Integrations</h2>
              <p className={styles.muted}>
                Connect your bank accounts to import transactions and keep your
                records up to date.
              </p>
              {block(
                "Default Bank for Payment",
                "This account will be used for customer payments and other incoming funds in the preview.",
                <Select
                  label="Select Account"
                  value={s.defaultBank}
                  onChange={(e) => update({ defaultBank: e.target.value })}
                >
                  <option value="">Select Account</option>
                  {s.linkedBanks.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name}
                    </option>
                  ))}
                </Select>,
              )}
              {block(
                "Connected Bank Accounts",
                "Manage your linked demo bank accounts.",
                <RecordsTable
                  label="Demo linked banks"
                  headers={["Bank", "Account number", "Last sync", "Action"]}
                  rows={s.linkedBanks.map((bank) => ({
                    id: bank.id,
                    cells: [
                      <span key="bank" className={ui.bankCell}>
                        <img
                          src={`/assets/dashboard/bank-${bank.id}.webp`}
                          width="29"
                          height="29"
                          alt=""
                        />
                        {bank.name}
                      </span>,
                      `••••${bank.ending}`,
                      bank.sync,
                    ],
                    actions: [
                      {
                        label: "Sync",
                        onClick: () => {
                          update({
                            linkedBanks: s.linkedBanks.map((row) =>
                              row.id === bank.id
                                ? { ...row, sync: "Just now · demo" }
                                : row,
                            ),
                          });
                          setNotice(
                            "Demo sync complete. No bank was contacted.",
                          );
                        },
                      },
                      {
                        label: "Delete Account",
                        danger: true,
                        onClick: () => setUnlink(bank.id),
                      },
                    ],
                  }))}
                />,
                <AppButton onClick={() => setWorkflow(true)}>
                  Connect Bank
                </AppButton>,
              )}
            </>
          ) : (
            <>
              <h2>Preferences</h2>
              <p className={styles.muted}>
                Customise how CoreOne works for you
              </p>
              {block(
                "Language",
                "Set your preferred language and region",
                <div className={styles.formColumns}>
                  <Select label="Language" value="English" disabled>
                    <option>English</option>
                  </Select>
                  <Select label="Region" value="Nigeria" disabled>
                    <option>Nigeria</option>
                  </Select>
                </div>,
              )}
              {block(
                "Appearance",
                "Choose how CoreOne looks",
                <div className={ui.appearance}>
                  {(["Light", "Dark", "System"] as const).map((value) => (
                    <button
                      key={value}
                      aria-pressed={s.appearance === value}
                      onClick={() => update({ appearance: value })}
                    >
                      <Icon
                        name={
                          value === "Light"
                            ? "sun"
                            : value === "Dark"
                              ? "moon"
                              : "monitor"
                        }
                      />
                      {value}
                    </button>
                  ))}
                </div>,
              )}
              {block(
                "Invoice Branding",
                "How your invoice will look like",
                <>
                  <Attachment
                    name={logo || undefined}
                    onSelect={(file) => {
                      setLogo(file.name);
                      setNotice(
                        "Demo logo filename selected. Nothing was uploaded or saved to your real invoices.",
                      );
                    }}
                  />
                </>,
              )}
              {block(
                "Notifications",
                "Manage how you receive updates and alerts",
                <div className={ui.notificationChoices}>
                  <label>
                    <span>
                      <strong>Email</strong>
                      <small>Get important updates via email</small>
                    </span>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={s.emailNotices}
                      onChange={(e) =>
                        update({ emailNotices: e.target.checked })
                      }
                    />
                  </label>
                  <label>
                    <span>
                      <strong>In-app</strong>
                      <small>See alerts and reminders in the app</small>
                    </span>
                    <input
                      type="checkbox"
                      role="switch"
                      checked={s.inAppNotices}
                      onChange={(e) =>
                        update({ inAppNotices: e.target.checked })
                      }
                    />
                  </label>
                </div>,
              )}
            </>
          )}
        </Panel>
      </div>
      {edit && (
        <SettingsEdit
          kind={edit}
          onClose={() => setEdit(undefined)}
          onSaved={() =>
            setNotice(
              "Demo profile saved in this tab. Your real account is unchanged.",
            )
          }
        />
      )}
      {unlink && (
        <ConfirmDemo
          title="Un-link Bank Account?"
          confirmLabel="Yes, un-link demo bank"
          onClose={() => setUnlink(undefined)}
          onConfirm={() => {
            const linked = s.linkedBanks.filter((row) => row.id !== unlink);
            update({
              linkedBanks: linked,
              defaultBank:
                s.defaultBank === unlink ? linked[0]?.id || "" : s.defaultBank,
            });
            if (!linked.length) setBankConnected(false);
            setUnlink(undefined);
            setNotice(
              "Demo bank unlinked. No real bank connection was changed.",
            );
          }}
        />
      )}
      {workflow && (
        <BankWorkflow
          initial="permissions"
          onClose={() => setWorkflow(false)}
        />
      )}{" "}
      {modal && (
        <Dialog
          title={
            modal === "password"
              ? "Change Password"
              : modal === "password-done"
                ? "Demo password changed"
                : modal === "two-factor"
                  ? "Preview two-factor authentication"
                  : modal === "method"
                    ? "Change Payment Method"
                    : modal === "bank-details"
                      ? "Bank Account Details"
                      : modal === "plan"
                        ? "Change Plan"
                        : "Demo subscription invoice"
          }
          drawer={modal === "password"}
          className={modal === "receipt" ? ui.documentDialog : ""}
          onClose={() => setModal(undefined)}
        >
          {modal === "password" ? (
            <>
              <DemoNotice>
                Example fields are disabled. Do not enter a real password. Your
                authentication password is never changed by this demo.
              </DemoNotice>
              <Field
                label="Old Password"
                type="password"
                value="demo-only"
                disabled
              />
              <Field
                label="New Password"
                type="password"
                value="demo-new-only"
                disabled
              />
              <Field
                label="Confirm New Password"
                type="password"
                value="demo-new-only"
                disabled
              />
              <div className={styles.dialogActions}>
                <AppButton
                  variant="secondary"
                  onClick={() => setModal(undefined)}
                >
                  Back
                </AppButton>
                <AppButton onClick={() => setModal("password-done")}>
                  Simulate change
                </AppButton>
              </div>
            </>
          ) : modal === "password-done" ? (
            <>
              <div className={styles.successMark}>✓</div>
              <p className={styles.inlineNotice}>
                The demo success state is shown. Your real password has not
                changed.
              </p>
              <AppButton onClick={() => setModal(undefined)}>Done</AppButton>
            </>
          ) : modal === "two-factor" ? (
            <>
              <DemoNotice>
                This switch previews enabled/disabled states only. No real
                authenticator, secret, or recovery code is created.
              </DemoNotice>
              <AppButton
                onClick={() => {
                  update({ twoFactor: !s.twoFactor });
                  setModal(undefined);
                }}
              >
                Preview {s.twoFactor ? "disabled" : "enabled"} state
              </AppButton>
            </>
          ) : modal === "method" ? (
            <>
              <p>
                Choose a payment method for your CoreOne subscription preview.
              </p>
              {(["Card Payment", "Bank Transfer"] as const).map((value) => (
                <label key={value} className={ui.paymentChoice}>
                  <input
                    type="radio"
                    name="demoMethod"
                    checked={s.paymentMethod === value}
                    onChange={() => update({ paymentMethod: value })}
                  />
                  <span>
                    <strong>{value}</strong>
                    <small>
                      {value === "Card Payment"
                        ? "Pay with a credit or debit card"
                        : "Transfer funds directly to our bank account"}
                    </small>
                  </span>
                </label>
              ))}
              <DemoNotice>
                No card data is collected and no payment is processed.
              </DemoNotice>
              <AppButton
                onClick={() => {
                  setModal(undefined);
                  setNotice(
                    "Demo payment method updated. Your actual subscription is unchanged.",
                  );
                }}
              >
                Continue
              </AppButton>
            </>
          ) : modal === "bank-details" ? (
            <>
              <DemoNotice>
                Illustrative bank details only. Do not transfer money to any
                account shown in a design reference.
              </DemoNotice>
              <dl className={ui.detailList}>
                {[
                  ["Bank Name", "Access Bank · demo"],
                  ["Account Name", "CoreOne Technologies Ltd. · demo"],
                  ["Account Number", "••••6789 · not a payment destination"],
                  ["Account Type", "Business"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className={styles.dialogActions}>
                <AppButton
                  variant="secondary"
                  onClick={() => setModal(undefined)}
                >
                  Cancel
                </AppButton>
                <AppButton
                  onClick={() => {
                    setModal(undefined);
                    setNotice(
                      "Demo acknowledgement recorded. No payment was confirmed or subscription updated.",
                    );
                  }}
                >
                  Preview acknowledgement
                </AppButton>
              </div>
            </>
          ) : modal === "plan" ? (
            <>
              <DemoNotice>
                Plan changes and purchases are not available. This handoff does
                not include the full plan-change flow or a billing API.
              </DemoNotice>
              <AppButton onClick={() => setModal(undefined)}>Close</AppButton>
            </>
          ) : (
            <>
              <article className={ui.printPaper}>
                <strong className={ui.demoWatermark}>
                  DEMO · NOT A PAYMENT RECEIPT
                </strong>
                <h1>CoreOne subscription invoice</h1>
                <p>Date: {receipt}</p>
                <p>Billed to: {s.businessName}</p>
                <h3>Basic plan · Monthly</h3>
                <dl className={styles.invoiceTotals}>
                  <div>
                    <dt>Demo total</dt>
                    <dd>{money(12000)}</dd>
                  </div>
                </dl>
                <p>Sample status: Paid. No payment has been verified.</p>
              </article>
              <AppButton onClick={() => window.print()}>
                Print / Save PDF
              </AppButton>
              <AppButton
                variant="secondary"
                onClick={() =>
                  downloadDemoCsv(
                    "coreone-demo-subscription.csv",
                    ["Date", "Plan", "Demo amount", "Demo status"],
                    [[receipt, "Basic", 12000, "Paid"]],
                  )
                }
              >
                Download demo CSV
              </AppButton>
            </>
          )}
        </Dialog>
      )}
    </>
  );
}
