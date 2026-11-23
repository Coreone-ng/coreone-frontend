"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AppButton,
  BankTiles,
  Dialog,
  Field,
  Search,
  Select,
} from "./components";
import { banks } from "./model";
import { useWorkspace } from "./WorkspaceProvider";
import styles from "./Dashboard.module.css";

type Step =
  | "permissions"
  | "banks"
  | "handoff"
  | "provider"
  | "otp"
  | "connecting"
  | "failed"
  | "connected"
  | "manual"
  | "upload"
  | "phone";
export function BankWorkflow({
  initial,
  onClose,
}: {
  initial: "permissions" | "manual";
  onClose: () => void;
}) {
  const { setBankConnected, setImported, setDemo } = useWorkspace();
  const [step, setStep] = useState<Step>(initial);
  const [search, setSearch] = useState("");
  const [bank, setBank] = useState("uba");
  const [consent, setConsent] = useState(false);
  const [acknowledge, setAcknowledge] = useState(false);
  const [number, setNumber] = useState("");
  const [file, setFile] = useState<File>();
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const chosen = banks.find((item) => item.id === bank)!;
  useEffect(() => {
    if (step !== "connecting") return;
    const timer = setTimeout(() => {
      setBankConnected(true);
      setDemo((current) => ({
        ...current,
        settings: {
          ...current.settings,
          linkedBanks: [
            ...current.settings.linkedBanks.filter((row) => row.id !== bank),
            {
              id: bank,
              name: chosen.name,
              ending: "0673",
              sync: "Just now · demo",
            },
          ],
        },
      }));
      setStep("connected");
    }, 1000);
    return () => clearTimeout(timer);
  }, [step, setBankConnected, setDemo, bank, chosen.name]);
  const next = (target: Step) => {
    setStep(target);
    setError("");
  };
  function chooseFile(selected?: File) {
    if (!selected) return;
    if (!/\.(pdf|svg|png|jpe?g)$/i.test(selected.name)) {
      setError("Select a PDF, PNG, JPG, or SVG sample file.");
      return;
    }
    setFile(selected);
    setError("");
  }
  const title: Record<Step, string> = {
    permissions: "Account Linking Permissions",
    banks: "Choose your bank",
    handoff: "Sign in at your bank",
    provider: "Sign in at your bank",
    otp: "Example bank OTP",
    connecting: "Connecting your bank account…",
    failed: "Connection failed",
    connected: "Sample bank account connected",
    manual: "Set up bank account",
    upload: "Import transactions",
    phone: "Scan to upload from your phone",
  };
  const description: Partial<Record<Step, string>> = {
    permissions:
      "Before you connect your bank, here’s what CoreOne can and cannot do.",
    banks: "Select the bank where your business account is held.",
    handoff: `You’re going to ${chosen.name} to sign in. CoreOne never sees your password.`,
    provider: `${chosen.name} · provider screen preview`,
    otp: "This code is illustrative. No OTP was requested from a bank.",
    connecting: "Preview only: showing the supplied connection state.",
    failed:
      "Sample error: we couldn’t connect to your bank. No bank request was made.",
    connected:
      "You can now review the supplied sample transactions. No bank account was connected.",
    manual: "Enter the sample account details from your statement.",
    upload: "Upload a statement to bring your bank activity into CoreOne.",
    phone:
      "Device pairing is pending a future handoff. There is no active QR code or mobile session.",
  };
  const uploadFlow = ["manual", "upload", "phone"].includes(step);
  return (
    <Dialog
      className={`${styles.bankDialog} ${uploadFlow ? styles.uploadDialog : ""}`}
      title={title[step]}
      description={description[step]}
      leading={
        step === "permissions" || step === "connected" ? (
          <BankTiles />
        ) : uploadFlow ? (
          <div className={styles.bankProgress}>
            <span aria-current={step === "manual" ? "step" : undefined}>
              Bank
            </span>
            <span aria-hidden="true">—</span>
            <span aria-current={step !== "manual" ? "step" : undefined}>
              Upload
            </span>
          </div>
        ) : undefined
      }
      onClose={onClose}
    >
      <div className={styles.bankFlow}>
        {step === "permissions" ? (
          <>
            <details>
              <summary>CoreOne can</summary>
              <ul>
                <li>Access authorized account details and balances.</li>
                <li>
                  Retrieve transaction history, subject to your bank’s
                  permissions.
                </li>
                <li>
                  Help categorize and reconcile transactions in your books.
                </li>
              </ul>
            </details>
            <details open>
              <summary>CoreOne cannot</summary>
              <ul>
                <li>
                  Move money or initiate bank transfers through a read-only
                  connection.
                </li>
                <li>
                  Make payments or change your bank account details through that
                  connection.
                </li>
                <li>
                  Access information or accounts beyond the permissions you
                  authorize.
                </li>
              </ul>
            </details>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              I authorize CoreOne to access my bank data for accounting and
              reporting purposes.
            </label>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={acknowledge}
                onChange={(e) => setAcknowledge(e.target.checked)}
              />
              I understand CoreOne is not liable for losses caused by inaccurate
              bank data or service disruptions, where permitted by law.
            </label>
            <p className={styles.small}>
              These choices apply only to this preview. They do not authorize
              access to a bank.
            </p>
            <AppButton
              disabled={!consent || !acknowledge}
              onClick={() => next("banks")}
            >
              Connect Account
            </AppButton>
          </>
        ) : step === "banks" ? (
          <>
            <Search
              value={search}
              onChange={setSearch}
              label="Search banks"
              placeholder="Search Banks"
            />
            <div className={styles.bankList}>
              {banks
                .filter((item) =>
                  item.name.toLowerCase().includes(search.toLowerCase()),
                )
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setBank(item.id);
                      next("handoff");
                    }}
                  >
                    <img
                      src={`/assets/dashboard/bank-${item.id}.webp`}
                      width="29"
                      height="29"
                      alt=""
                    />
                    {item.name}
                    <span aria-hidden="true">›</span>
                  </button>
                ))}
              {!banks.some((item) =>
                item.name.toLowerCase().includes(search.toLowerCase()),
              ) && <p>No matching sample banks.</p>}
            </div>
          </>
        ) : step === "handoff" ? (
          <>
            <p className={styles.inlineNotice}>
              This is a screen preview. The real bank-provider redirect is not
              connected.
            </p>
            <div className={styles.dialogActions}>
              <AppButton variant="secondary" onClick={() => next("banks")}>
                Back
              </AppButton>
              <AppButton onClick={() => next("provider")}>
                Continue to bank
              </AppButton>
            </div>
          </>
        ) : step === "provider" ? (
          <>
            <p className={styles.inlineNotice}>
              Illustrative provider form. Inputs are disabled so no real
              credentials can be entered.
            </p>
            <Field label="Customer ID" value="sample-customer-id" disabled />
            <Field
              label="Password"
              type="password"
              value="sample-only"
              disabled
            />
            <div className={styles.dialogActions}>
              <AppButton variant="secondary" onClick={() => next("handoff")}>
                Back
              </AppButton>
              <AppButton onClick={() => next("otp")}>
                Request OTP code
              </AppButton>
            </div>
            <p className={styles.small}>
              No OTP will be requested. The next screen is a sample.
            </p>
          </>
        ) : step === "otp" ? (
          <>
            <Field label="One-time code" value="123456" disabled />
            <div className={styles.dialogActions}>
              <AppButton variant="secondary" onClick={() => next("provider")}>
                Back
              </AppButton>
              <AppButton onClick={() => next("connecting")}>
                Sign and authorise
              </AppButton>
            </div>
            <button
              className={styles.textButton}
              onClick={() => next("failed")}
            >
              Preview failed connection
            </button>
          </>
        ) : step === "connecting" ? (
          <>
            <div
              className={styles.spinner}
              role="status"
              aria-label="Sample connecting state"
            />
            <p className={styles.small}>
              Nothing is being connected. This preview advances to the sample
              success screen.
            </p>
          </>
        ) : step === "failed" ? (
          <div className={styles.dialogActions}>
            <AppButton variant="secondary" onClick={onClose}>
              Close
            </AppButton>
            <AppButton onClick={() => next("handoff")}>Try again</AppButton>
          </div>
        ) : step === "connected" ? (
          <>
            <div className={styles.connectedBank}>
              <img
                src={`/assets/dashboard/bank-${bank}.webp`}
                alt=""
                width="29"
                height="29"
              />
              <div>
                <strong>{chosen.name}</strong>
                <p>Account ending in •••• 4821</p>
              </div>
              <span>Connected · sample</span>
            </div>
            <AppButton onClick={onClose}>Done</AppButton>
          </>
        ) : step === "manual" ? (
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (number !== "2346700742") {
                setError(
                  "No account found in the sample data. Try 2346700742.",
                );
                return;
              }
              next("upload");
            }}
          >
            <Select
              label="Bank Name"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
            >
              {banks.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
            <Field
              label="Account Number"
              name="accountNumber"
              inputMode="numeric"
              value={number}
              onChange={(e) =>
                setNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="Enter Account Number"
              error={error}
            />
            {number === "2346700742" && (
              <p className={styles.sampleAccountName}>
                POMALINE TECHNOLOGIES LIMITED · sample
              </p>
            )}
            <p className={styles.small}>
              Use sample account 2346700742. No account lookup is performed.
            </p>
            <AppButton type="submit">Continue</AppButton>
          </form>
        ) : step === "upload" ? (
          <>
            <input
              ref={fileInput}
              className="sr-only"
              type="file"
              accept=".pdf,.svg,.png,.jpg,.jpeg"
              aria-label="Select sample statement"
              onChange={(e) => chooseFile(e.target.files?.[0])}
            />
            <button
              className={styles.uploadZone}
              onClick={() => fileInput.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                chooseFile(event.dataTransfer.files[0]);
              }}
            >
              <span className={styles.uploadGlyph} aria-hidden="true">
                ↑
              </span>
              <strong>
                {file ? file.name : "Click to upload or drag and drop"}
              </strong>
              <span>
                {file
                  ? `${(file.size / 1024).toFixed(1)} KB · selected locally`
                  : "SVG, PNG, JPG, or PDF · local preview only"}
              </span>
            </button>
            {error && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}
            <p className={styles.small}>
              Files are not read, uploaded, stored, or converted. Continue shows
              the supplied sample transactions.
            </p>
            <button className={styles.textButton} onClick={() => next("phone")}>
              Snap a photo to upload
            </button>
            <div className={styles.dialogActions}>
              <AppButton variant="secondary" onClick={() => next("manual")}>
                Back
              </AppButton>
              <AppButton
                disabled={!file}
                onClick={() => {
                  setImported(true);
                  onClose();
                }}
              >
                Continue
              </AppButton>
            </div>
          </>
        ) : (
          <>
            <div className={styles.inactiveQr}>
              <p>Mobile pairing unavailable</p>
              <span>No active QR code</span>
            </div>
            <Link
              className={styles.button}
              href="/dashboard/capture"
              onClick={onClose}
            >
              Preview mobile capture
            </Link>
            <AppButton variant="secondary" onClick={() => next("upload")}>
              Back to upload
            </AppButton>
          </>
        )}
      </div>
    </Dialog>
  );
}
