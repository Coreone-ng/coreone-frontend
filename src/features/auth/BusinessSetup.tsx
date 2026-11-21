"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button/Button";
import { AuthShell } from "./AuthShell";
import { AuthError, authRequest, loadSession } from "./client";
import {
  businessErrors,
  type BusinessDraft,
  type BusinessOptions,
  type Option,
} from "./business";
import type { Snapshot } from "./model";
import auth from "./AuthPage.module.css";
import styles from "./BusinessSetup.module.css";

type Mode = "choose" | "business" | "individual";
const empty: BusinessDraft = {
  legal_name: "",
  industry: "",
  business_structure: "",
  owner_role: "",
  employee_range: "",
  goals: [],
};
function Choice({
  label,
  name,
  options,
  value,
  onChange,
  error,
  disabled = false,
}: {
  label: string;
  name:
    | "industry"
    | "business_structure"
    | "owner_role"
    | "employee_range"
    | "coworkers";
  options: Option[];
  value: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}) {
  const icon = {
    industry: "field-industry",
    business_structure: "field-structure",
    owner_role: "field-role",
    employee_range: "field-employees",
    coworkers: "field-employees",
  }[name];
  return (
    <div className={auth.field}>
      <label htmlFor={name}>{label}</label>
      <div className={styles.control}>
        <img
          src={`/assets/business-setup/${icon}.svg`}
          width="20"
          height="20"
          alt=""
        />
        <select
          id={name}
          name={name}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className={auth.fieldError} id={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}
export function BusinessSetup({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<Snapshot>();
  const [options, setOptions] = useState<BusinessOptions>();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [type, setType] = useState<"business" | "individual">();
  const [draft, setDraft] = useState<BusinessDraft>({ ...empty });
  const [step, setStep] = useState<"profile" | "goals">("profile");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const locked = useRef(false);
  const feedback = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const generation = useRef(0);
  async function initialize() {
    const current = ++generation.current;
    setLoading(true);
    setLoadError("");
    try {
      const [session, response] = await Promise.all([
        loadSession(),
        fetch("/api/auth/business-options", { cache: "no-store" }),
      ]);
      if (current !== generation.current) return;
      if (!session.user) {
        router.replace(session.pending ? "/onboarding/verify" : "/sign-in");
        return;
      }
      if (!session.user.email_verified || !session.user.phone_verified) {
        router.replace("/onboarding/verify");
        return;
      }
      if (session.next_step === "dashboard") {
        router.replace("/dashboard");
        return;
      }
      const choices = await response.json();
      if (current !== generation.current) return;
      if (
        !response.ok ||
        ![
          "industries",
          "business_structures",
          "owner_roles",
          "employee_ranges",
          "goals",
        ].every((key) => Array.isArray(choices[key]))
      )
        throw Error("We couldn’t load setup choices. Please retry.");
      setSnapshot(session);
      setOptions(choices);
      setDraft({
        ...empty,
        goals: [],
        ...(mode === "individual"
          ? {
              legal_name:
                `${session.user.first_name} ${session.user.last_name}`.trim(),
              business_structure: "sole_proprietorship",
            }
          : {}),
      });
    } catch (error) {
      if (current !== generation.current) return;
      setLoadError(
        error instanceof AuthError
          ? error.message
          : "We couldn’t load setup. Please retry.",
      );
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }
  useEffect(() => {
    void initialize(); /* A new route starts a fresh, unsaved draft. */
    return () => {
      generation.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);
  useEffect(() => {
    if (!loading && snapshot) title.current?.focus();
  }, [step, loading, snapshot]);
  function update(key: keyof BusinessDraft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setMessage("");
  }
  function next(event: FormEvent) {
    event.preventDefault();
    if (!options) return;
    const invalid =
      mode === "business"
        ? businessErrors(draft as unknown as Record<string, unknown>, options)
        : {
            ...(!draft.legal_name.trim()
              ? { legal_name: "Enter your full name." }
              : {}),
            ...(!draft.industry ? { industry: "Choose an industry." } : {}),
          };
    delete invalid.goals;
    setErrors(invalid);
    if (Object.keys(invalid).length) {
      requestAnimationFrame(() => feedback.current?.focus());
      return;
    }
    setStep("goals");
    setMessage("");
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (locked.current || mode !== "business" || !options) return;
    const invalid = businessErrors(
      draft as unknown as Record<string, unknown>,
      options,
    );
    setErrors(invalid);
    if (Object.keys(invalid).length) {
      setStep("profile");
      requestAnimationFrame(() => feedback.current?.focus());
      return;
    }
    locked.current = true;
    setBusy(true);
    setMessage("");
    let accepted = saved;
    try {
      if (!saved) {
        try {
          await authRequest("create-business", {
            ...draft,
            legal_name: draft.legal_name.trim(),
          });
        } catch (error) {
          if (!(error instanceof AuthError) || error.status !== 401)
            throw error;
          await authRequest("refresh");
          await authRequest("create-business", {
            ...draft,
            legal_name: draft.legal_name.trim(),
          });
        }
        accepted = true;
        setSaved(true);
      }
      const latest = await loadSession();
      if (latest.next_step !== "dashboard")
        throw Error(
          "Your business was saved, but we couldn’t confirm your workspace yet. Please retry.",
        );
      router.replace("/dashboard");
    } catch (error) {
      setMessage(
        accepted
          ? "Your business profile was saved. We couldn’t open your workspace yet; retry to continue without creating it again."
          : error instanceof Error
            ? error.message
            : "We couldn’t save your business. Please retry.",
      );
      if (error instanceof AuthError) setErrors(error.fields);
      requestAnimationFrame(() => feedback.current?.focus());
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  const heading = (text: string, description: string) => (
    <div className={auth.heading}>
      <h1 ref={title} tabIndex={-1}>
        {text}
      </h1>
      <p>{description}</p>
    </div>
  );
  const status = (
    <div
      ref={feedback}
      tabIndex={-1}
      className={styles.feedback}
      role={message || Object.keys(errors).length ? "alert" : "status"}
    >
      {message ||
        (Object.keys(errors).length
          ? "Please check the highlighted fields."
          : "")}
    </div>
  );
  const footer = (
    <>
      <p className={auth.switch}>
        Already have a CoreOne account? <Link href="/sign-in">Log in</Link>
      </p>
      <Link className={styles.explore} href="/dashboard">
        Explore the sample dashboard
      </Link>
    </>
  );
  let content;
  if (loading) content = <p role="status">Loading your setup…</p>;
  else if (loadError)
    content = (
      <>
        {heading("Let’s get you connected", loadError)}
        <Button className={auth.submit} onClick={() => void initialize()}>
          Try again
        </Button>
      </>
    );
  else if (!snapshot || !options)
    content = <p role="status">Taking you to the next step…</p>;
  else if (busy)
    content = (
      <div className={styles.saving} role="status" aria-live="polite">
        {heading(
          "Getting everything ready for you",
          "Saving your business profile…",
        )}
        <progress aria-label="Saving business profile" />
        <p>Keep this page open while we finish.</p>
      </div>
    );
  else if (mode === "choose")
    content = (
      <>
        {heading(
          "Choose your account type",
          "Select the account type that best describes you to get started.",
        )}
        <fieldset className={styles.accountChoices}>
          <legend className="sr-only">Account type</legend>
          {(["individual", "business"] as const).map((value) => (
            <label
              key={value}
              className={type === value ? styles.selected : ""}
            >
              <input
                type="radio"
                name="account-type"
                value={value}
                checked={type === value}
                onChange={() => setType(value)}
              />
              <img
                src={`/assets/business-setup/${value}.svg`}
                width="60"
                height="60"
                alt=""
              />
              <span>
                <strong>
                  {value === "individual" ? "Individual" : "Business"}
                </strong>
                <small>
                  Manage your {value === "individual" ? "personal" : "business"}{" "}
                  finances & decisions
                </small>
              </span>
            </label>
          ))}
        </fieldset>
        <Button
          className={auth.submit}
          disabled={!type}
          onClick={() =>
            router.push(
              `/onboarding/${type === "individual" ? "individual" : "business"}-profile`,
            )
          }
        >
          Continue
        </Button>
        {footer}
      </>
    );
  else if (step === "profile")
    content = (
      <>
        {heading(
          mode === "business"
            ? "Let’s get your business dashboard up and running."
            : "Let’s get your dashboard up and running.",
          mode === "business"
            ? "With this, we’ll make sure your legal business name shows up in the right places."
            : "With this, we’ll make sure your name shows up in the right places.",
        )}
        {status}
        {mode === "individual" && (
          <p className={styles.notice}>
            Individual setup is a preview. Saving this account type is not
            available yet.
          </p>
        )}
        <form onSubmit={next} noValidate>
          <div className={auth.field}>
            <label htmlFor="legal_name">
              {mode === "business"
                ? "Your legal business name"
                : "Your full name"}
            </label>
            <div className={styles.control}>
              <img
                src={`/assets/business-setup/${mode === "business" ? "field-name" : "field-person"}.svg`}
                width="20"
                height="20"
                alt=""
              />
              <input
                id="legal_name"
                name="legal_name"
                value={draft.legal_name}
                onChange={(event) => update("legal_name", event.target.value)}
                maxLength={200}
                placeholder={
                  mode === "business"
                    ? "Enter your business name"
                    : "Enter your full name"
                }
                required
                aria-invalid={!!errors.legal_name}
                aria-describedby={
                  errors.legal_name ? "legal_name-error" : undefined
                }
              />
            </div>
            {errors.legal_name && (
              <p id="legal_name-error" className={auth.fieldError}>
                {errors.legal_name}
              </p>
            )}
          </div>
          <Choice
            label="Industry"
            name="industry"
            options={options.industries}
            value={draft.industry}
            onChange={(value) => update("industry", value)}
            error={errors.industry}
          />
          <Choice
            label="Business structure"
            name="business_structure"
            options={options.business_structures}
            value={draft.business_structure}
            onChange={(value) => update("business_structure", value)}
            error={errors.business_structure}
            disabled={mode === "individual"}
          />
          {mode === "business" ? (
            <>
              <Choice
                label="What’s your role?"
                name="owner_role"
                options={options.owner_roles}
                value={draft.owner_role}
                onChange={(value) => update("owner_role", value)}
                error={errors.owner_role}
              />
              <Choice
                label="How many employees?"
                name="employee_range"
                options={options.employee_ranges}
                value={draft.employee_range}
                onChange={(value) => update("employee_range", value)}
                error={errors.employee_range}
              />
            </>
          ) : (
            <>
              <Choice
                label="Do you work with anyone?"
                name="coworkers"
                options={[]}
                value=""
                disabled
              />
              <p className={styles.hint}>
                Individual profile choices are still being finalized.
              </p>
            </>
          )}
          <div className={styles.logoField}>
            <p>Business logo (optional) — This also appears on your invoice</p>
            <div>
              <span className={styles.logoPlaceholder} aria-hidden="true" />
              <button type="button" className={styles.logoUpload} disabled>
                <span aria-hidden="true">
                  <img
                    src="/assets/business-setup/upload.svg"
                    width="20"
                    height="20"
                    alt=""
                  />
                </span>
                <strong>Click to upload or drag and drop</strong>
                <small>SVG, PNG, JPG or GIF (max. 800×400px)</small>
              </button>
            </div>
            <p className={styles.hint}>
              Logo uploads are not available yet. You can continue without a
              logo.
            </p>
          </div>
          <Button className={auth.submit} type="submit">
            Continue
          </Button>
          <Link href="/onboarding/account-type" className={styles.back}>
            Back
          </Link>
        </form>
        {footer}
      </>
    );
  else
    content = (
      <>
        {heading(
          "What do you want to do in CoreOne?",
          "Your choice will help us personalise your setup.",
        )}
        {status}
        <form onSubmit={submit}>
          <fieldset className={styles.goals}>
            <legend className="sr-only">Setup goals (optional)</legend>
            {options.goals.map((goal) => (
              <label
                key={goal.value}
                className={
                  draft.goals.includes(goal.value) ? styles.selected : ""
                }
              >
                <img
                  src={`/assets/business-setup/goal-${goal.value}.svg`}
                  width="60"
                  height="60"
                  alt=""
                />
                <span>{goal.label}</span>
                <input
                  type="checkbox"
                  name="goals"
                  value={goal.value}
                  checked={draft.goals.includes(goal.value)}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      goals: event.target.checked
                        ? [...current.goals, goal.value]
                        : current.goals.filter((value) => value !== goal.value),
                    }))
                  }
                />
              </label>
            ))}
          </fieldset>
          {mode === "business" ? (
            <>
              <p className={styles.hint}>
                Choose any that apply, or continue. Your business profile will
                be saved to your account.
              </p>
              <Button className={auth.submit} type="submit">
                {saved ? "Continue to dashboard" : "Continue"}
              </Button>
            </>
          ) : (
            <>
              <p className={styles.notice}>
                Saving an Individual profile is not available yet. These choices
                haven’t been submitted.
              </p>
              <Button className={auth.submit} disabled>
                Continue
              </Button>
            </>
          )}
          <button
            type="button"
            className={styles.back}
            onClick={() => {
              setStep("profile");
              setMessage("");
            }}
          >
            Back
          </button>
        </form>
        {footer}
      </>
    );
  return (
    <AuthShell
      setup
      step={0}
      mode="setup"
      profileStep={
        mode === "choose"
          ? "User"
          : mode === "business"
            ? "Business Profile"
            : "User Profile"
      }
      className={styles.wizard}
    >
      {content}
    </AuthShell>
  );
}
