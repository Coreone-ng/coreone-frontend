"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button/Button";
import { site } from "@/config/site";
import { AuthError, authRequest, loadSession } from "./client";
import {
  destination,
  passwordHint,
  signupErrors,
  validEmail,
  validPassword,
  validPhone,
  type Fields,
  type Snapshot,
} from "./model";
import styles from "./AuthPage.module.css";
import { AuthShell } from "./AuthShell";
import type { AuthMode } from "./model";

function FieldIcon({ kind }: { kind: "email" | "password" | "person" }) {
  return (
    <svg
      className={styles.fieldIcon}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      {kind === "email" ? (
        <>
          <rect x="3" y="5" width="18" height="14" rx="4" />
          <path d="m6 8 6 5 6-5" />
        </>
      ) : kind === "password" ? (
        <>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <path d="m7 17 3-3a4 4 0 1 0-1-4l-3 3v4h3" />
          <circle cx="14" cy="9" r=".5" />
        </>
      ) : (
        <>
          <circle cx="12" cy="7" r="4" />
          <path d="M4 22v-2a8 8 0 0 1 16 0v2" />
        </>
      )}
    </svg>
  );
}
function Field({
  label,
  error,
  hint,
  password = false,
  phone = false,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
  password?: boolean;
  phone?: boolean;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.inputWrap}>
        {!phone && (
          <FieldIcon
            kind={
              password
                ? "password"
                : props.type === "email"
                  ? "email"
                  : "person"
            }
          />
        )}
        {phone && (
          <span
            className={styles.country}
            aria-label="Nigeria, country code +234"
          >
            NG
          </span>
        )}
        <input
          {...props}
          id={id}
          type={
            password ? (visible ? "text" : "password") : props.type || "text"
          }
          aria-invalid={!!error}
          aria-describedby={error || hint ? `${id}-help` : undefined}
        />
        {password && (
          <button
            type="button"
            className={styles.eye}
            aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
              <circle cx="12" cy="12" r="3" />
              {visible && <path d="m3 3 18 18" />}
            </svg>
          </button>
        )}
      </div>
      {(error || hint) && (
        <p
          id={`${id}-help`}
          className={error ? styles.fieldError : styles.hint}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
}
function Otp({
  value,
  onChange,
  disabled,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  error?: string;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  return (
    <fieldset
      className={styles.otp}
      aria-describedby={error ? "code-error" : undefined}
    >
      <legend className="sr-only">6-digit verification code</legend>
      {Array.from({ length: 6 }, (_, index) => (
        <input
          key={index}
          ref={(element) => {
            refs.current[index] = element;
          }}
          aria-label={`Digit ${index + 1} of 6`}
          aria-invalid={!!error}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          pattern="[0-9]*"
          disabled={disabled}
          value={value[index] || ""}
          onFocus={(event) => event.currentTarget.select()}
          onPaste={(event) => {
            event.preventDefault();
            const code = event.clipboardData
              .getData("text")
              .replace(/\D/g, "")
              .slice(0, 6);
            onChange(code);
            refs.current[Math.min(code.length, 5)]?.focus();
          }}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "");
            if (digits.length > 1) {
              onChange(digits.slice(0, 6));
              refs.current[Math.min(digits.length, 5)]?.focus();
            } else {
              const next = value.padEnd(6, " ").split("");
              next[index] = digits || " ";
              onChange(next.join("").trimEnd().slice(0, 6));
              if (digits) refs.current[Math.min(index + 1, 5)]?.focus();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !value[index]?.trim())
              refs.current[Math.max(index - 1, 0)]?.focus();
            if (event.key === "ArrowLeft")
              refs.current[Math.max(index - 1, 0)]?.focus();
            if (event.key === "ArrowRight")
              refs.current[Math.min(index + 1, 5)]?.focus();
          }}
        />
      ))}
      {error && (
        <p id="code-error" className={styles.fieldError}>
          {error}
        </p>
      )}
    </fieldset>
  );
}
export function AuthPage({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<Snapshot>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [errors, setErrors] = useState<Fields>({});
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [code, setCode] = useState("");
  const [now, setNow] = useState(Date.now());
  const [retryAt, setRetryAt] = useState(0);
  const [resumePurpose, setResumePurpose] = useState("verify_email");
  const status = useRef<HTMLDivElement>(null);
  const setup = ["setup", "verify", "change-phone", "complete"].includes(mode);
  const pending = mode === "reset-verify" ? snapshot?.reset : snapshot?.pending;
  const seconds = Math.max(
    0,
    Math.ceil((Math.max(pending?.resendAt || 0, retryAt) - now) / 1000),
  );
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    let alive = true;
    loadSession()
      .then((data) => {
        if (alive) {
          setSnapshot(data);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (alive) {
          setMessage(error.message);
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [mode]);
  useEffect(() => {
    if (!snapshot || loading) return;
    if (
      snapshot.user &&
      ["setup", "sign-in", "verify", "change-phone", "totp"].includes(mode) &&
      (mode !== "verify" ||
        (snapshot.user.email_verified && snapshot.user.phone_verified))
    ) {
      router.replace(destination(snapshot));
      return;
    }
    if (mode === "totp" && !snapshot.totp) router.replace("/sign-in");
    if (
      mode === "change-phone" &&
      snapshot.pending?.next_step !== "verify_phone"
    )
      router.replace("/onboarding/verify");
    if (mode === "reset-verify" && !snapshot.reset)
      router.replace("/forgot-password");
    if (mode === "new-password" && !snapshot.canReset)
      router.replace(
        snapshot.resetDone
          ? "/forgot-password/done"
          : snapshot.reset
            ? "/forgot-password/verify"
            : "/forgot-password",
      );
    if (mode === "reset-done" && !snapshot.resetDone)
      router.replace("/forgot-password");
    if (mode === "complete" && !snapshot.user)
      router.replace(snapshot.pending ? "/onboarding/verify" : "/sign-in");
  }, [snapshot, loading, mode, router]);
  useEffect(() => {
    if (message || Object.keys(errors).length) status.current?.focus();
  }, [message, errors]);
  async function run(
    action: string,
    values: Record<string, unknown>,
    next?: string,
  ) {
    if (locked.current) return;
    let accepted = false;
    locked.current = true;
    setBusy(true);
    setMessage("");
    setErrors({});
    setNotice("");
    try {
      await authRequest(action, values);
      accepted = true;
      const data = await loadSession();
      setSnapshot(data);
      setCode("");
      setRetryAt(0);
      if (next) router.push(next === "auto" ? destination(data) : next);
      else
        setNotice(
          action === "change-phone"
            ? "A new code has been sent to your number."
            : "If an account matches, a new verification code has been sent.",
        );
    } catch (error) {
      if (accepted) setSnapshot(undefined);
      if (error instanceof AuthError) {
        setMessage(error.message);
        setErrors(error.fields);
        setVerificationRequired(error.verificationRequired);
        if (error.retryAfter) setRetryAt(Date.now() + error.retryAfter * 1000);
      } else setMessage("We couldn’t complete this request. Please try again.");
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  const title = (heading: string, description: string) => (
    <div className={styles.heading}>
      <h1>{heading}</h1>
      <p>{description}</p>
    </div>
  );
  const form = (children: ReactNode, submit: (values: FormData) => void) => (
    <form
      noValidate
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!busy) submit(new FormData(event.currentTarget));
      }}
    >
      {children}
    </form>
  );
  const get = (data: FormData, key: string) => String(data.get(key) || "");
  const submit = (label: string, pendingLabel: string) => (
    <Button
      type="submit"
      className={styles.submit}
      disabled={busy || now < retryAt}
    >
      {busy ? pendingLabel : label}
    </Button>
  );
  const emailField = (
    <Field
      key="email"
      label="Email Address"
      name="email"
      type="email"
      placeholder="you@example.com"
      autoComplete="email"
      maxLength={254}
      required
      error={errors.email}
    />
  );
  const passwordField = (
    label = "Password",
    name = "password",
    hint?: string,
  ) => (
    <Field
      label={label}
      name={name}
      password
      placeholder={
        name === "confirm_password"
          ? "Re-enter your password"
          : "Enter your password"
      }
      autoComplete={
        mode === "setup" || mode === "new-password"
          ? "new-password"
          : "current-password"
      }
      maxLength={128}
      hint={hint}
      required
      error={errors[name]}
    />
  );
  const feedback = (
    <div
      ref={status}
      tabIndex={-1}
      className={styles.feedback}
      role={message || Object.keys(errors).length ? "alert" : "status"}
    >
      {message ||
        (Object.keys(errors).length
          ? "Please check the highlighted fields."
          : "")}
      {notice && <span className={styles.notice}>{notice}</span>}
      {seconds > 0 && retryAt > now && (
        <span>Please try again in {seconds}s.</span>
      )}
    </div>
  );
  const redirecting =
    !!snapshot &&
    ((!!snapshot.user &&
      ["setup", "sign-in", "verify", "change-phone", "totp"].includes(mode) &&
      (mode !== "verify" ||
        (snapshot.user.email_verified && snapshot.user.phone_verified))) ||
      (mode === "totp" && !snapshot.totp) ||
      (mode === "change-phone" &&
        snapshot.pending?.next_step !== "verify_phone") ||
      (mode === "reset-verify" && !snapshot.reset) ||
      (mode === "new-password" && !snapshot.canReset) ||
      (mode === "reset-done" && !snapshot.resetDone) ||
      (mode === "complete" && !snapshot.user));
  let content: ReactNode;
  if (redirecting) content = <p role="status">Taking you to the next step…</p>;
  else if (loading) content = <p role="status">Loading your account…</p>;
  else if (!snapshot)
    content = (
      <>
        {title(
          "Let’s get you connected",
          "We couldn’t check your account. Please retry.",
        )}
        {feedback}
        <Button
          className={styles.submit}
          onClick={() => {
            setLoading(true);
            loadSession()
              .then((data) => {
                setSnapshot(data);
                setMessage("");
              })
              .catch((error) => setMessage(error.message))
              .finally(() => setLoading(false));
          }}
        >
          Try again
        </Button>
      </>
    );
  else if (mode === "setup" && snapshot.pending)
    content = (
      <>
        {title(
          "Let’s pick up where you left off",
          "Your account is awaiting verification. Continue with your email and phone verification.",
        )}
        {feedback}
        <Button
          className={styles.submit}
          onClick={() => router.push("/onboarding/verify")}
        >
          Continue verification
        </Button>
        <button
          className={styles.textButton}
          disabled={busy}
          onClick={() => run("clear-flow", {})}
        >
          Use a different account
        </button>
      </>
    );
  else if (mode === "setup")
    content = (
      <>
        {title(
          "Let’s get you set up",
          "Set up your account in a few simple steps to get started.",
        )}
        {feedback}
        {form(
          <>
            <Field
              label="First Name"
              name="first_name"
              placeholder="Enter your first name"
              autoComplete="given-name"
              maxLength={100}
              required
              error={errors.first_name}
            />
            <Field
              label="Last Name"
              name="last_name"
              placeholder="Enter your last name"
              autoComplete="family-name"
              maxLength={100}
              required
              error={errors.last_name}
            />
            {emailField}
            <Field
              label="Phone Number"
              name="phone"
              phone
              type="tel"
              placeholder="Enter your phone number"
              autoComplete="tel-national"
              maxLength={20}
              hint="To protect your account, we’ll send you a code to verify it’s you. Standard call or SMS rates may apply."
              required
              error={errors.phone}
            />
            {passwordField("Password", "password", passwordHint)}
            {passwordField(
              "Confirm Password",
              "confirm_password",
              "Make sure both passwords match.",
            )}
            <div className={styles.checks}>
              <label className={styles.check}>
                <input type="checkbox" name="marketing_opt_in" />
                I’d like to receive helpful marketing emails and SMS from
                CoreOne
              </label>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  name="accept_terms"
                  aria-invalid={!!errors.accept_terms}
                  aria-describedby={
                    errors.accept_terms ? "terms-error" : undefined
                  }
                />{" "}
                <span>
                  I have read, understood and agreed to the{" "}
                  <a
                    href={site.destinations.terms}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Terms & Conditions
                  </a>{" "}
                  and{" "}
                  <a
                    href={site.destinations.privacy}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
              {errors.accept_terms && (
                <p id="terms-error" className={styles.fieldError}>
                  {errors.accept_terms}
                </p>
              )}
            </div>
            {submit("Create account", "Creating your account…")}
            <p className={styles.switch}>
              Already have a CoreOne account?{" "}
              <a href={site.destinations.login}>Log in</a>
            </p>
          </>,
          (data) => {
            const values = {
              first_name: get(data, "first_name").trim(),
              last_name: get(data, "last_name").trim(),
              email: get(data, "email").trim().toLowerCase(),
              phone: get(data, "phone"),
              password: get(data, "password"),
              accept_terms: data.has("accept_terms"),
              marketing_opt_in: data.has("marketing_opt_in"),
            };
            const invalid = signupErrors(values);
            if (values.password !== get(data, "confirm_password"))
              invalid.confirm_password = "Passwords don’t match.";
            if (Object.keys(invalid).length) {
              setErrors(invalid);
              return;
            }
            run("signup", values, "auto");
          },
        )}
      </>
    );
  else if (mode === "sign-in")
    content = (
      <>
        {title("Log in", "Welcome back! Let’s get you in to CoreOne")}
        {feedback}
        <div className={styles.tabs} role="tablist" aria-label="Sign-in method">
          {(["email", "phone"] as const).map((method, index) => (
            <button
              key={method}
              id={`tab-${method}`}
              type="button"
              role="tab"
              aria-controls="login-panel"
              aria-selected={loginMethod === method}
              tabIndex={loginMethod === method ? 0 : -1}
              onClick={() => {
                setLoginMethod(method);
                setErrors({});
              }}
              onKeyDown={(event) => {
                if (
                  ["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
                ) {
                  event.preventDefault();
                  const next =
                    event.key === "Home"
                      ? "email"
                      : event.key === "End"
                        ? "phone"
                        : index === 0
                          ? "phone"
                          : "email";
                  setLoginMethod(next);
                  document.getElementById(`tab-${next}`)?.focus();
                }
              }}
            >
              {method === "email" ? "Email" : "Phone Number"}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id="login-panel"
          aria-labelledby={`tab-${loginMethod}`}
        >
          {form(
            <>
              {loginMethod === "email" ? (
                emailField
              ) : (
                <Field
                  key="phone"
                  label="Phone Number"
                  name="phone"
                  phone
                  type="tel"
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  required
                  error={errors.phone}
                />
              )}{" "}
              {passwordField()}
              <div className={styles.remember}>
                <label className={styles.check}>
                  <input type="checkbox" name="remember_me" />
                  Remember for 30 days
                </label>
                <a href="/forgot-password">Forgot password</a>
              </div>
              {submit("Sign in", "Signing you in…")}
              <p className={styles.switch}>
                Don’t have an account?{" "}
                <a href={site.destinations.signup}>Sign up</a>
              </p>
              {verificationRequired && (
                <a className={styles.textButton} href="/onboarding/verify">
                  Continue account verification
                </a>
              )}
            </>,
            (data) => {
              const invalid: Fields = {};
              const identifier = get(data, loginMethod).trim();
              if (
                loginMethod === "email"
                  ? !validEmail(identifier)
                  : !validPhone(identifier)
              )
                invalid[loginMethod] =
                  `Enter a valid ${loginMethod === "phone" ? "Nigerian mobile number" : "email address"}.`;
              if (!get(data, "password"))
                invalid.password = "Enter your password.";
              if (Object.keys(invalid).length) {
                setErrors(invalid);
                return;
              }
              run(
                "login",
                {
                  [loginMethod]: identifier,
                  password: get(data, "password"),
                  remember_me: data.has("remember_me"),
                },
                "auto",
              );
            },
          )}
        </div>
      </>
    );
  else if (mode === "forgot")
    content = (
      <>
        {title(
          "Reset your password",
          "Enter your email to receive a secure verification code.",
        )}
        {feedback}
        {form(
          <>
            {emailField}
            {submit("Send verification code", "Sending verification code…")}
            <p className={styles.switch}>
              Remember your password? <a href="/sign-in">Sign in</a>
            </p>
          </>,
          (data) => {
            const email = get(data, "email").trim();
            if (!validEmail(email)) {
              setErrors({ email: "Enter a valid email address." });
              return;
            }
            run("forgot-password", { email }, "/forgot-password/verify");
          },
        )}
      </>
    );
  else if (mode === "verify" && !snapshot.pending)
    content = (
      <>
        {title(
          "Verify your account",
          "Enter your signup email to resume verification.",
        )}
        {feedback}
        {form(
          <>
            {emailField}
            <div className={styles.field}>
              <label htmlFor="verification-method">Verification step</label>
              <select
                id="verification-method"
                value={resumePurpose}
                onChange={(event) => setResumePurpose(event.target.value)}
              >
                <option value="verify_email">Verify email first</option>
                <option value="verify_phone">
                  Verify phone (email already verified)
                </option>
              </select>
            </div>
            {submit("Send verification code", "Sending code…")}
            <p className={styles.switch}>
              <a href="/setup">Create an account</a> ·{" "}
              <a href="/sign-in">Sign in</a>
            </p>
          </>,
          (data) =>
            run("resume", {
              email: get(data, "email"),
              purpose: resumePurpose,
            }),
        )}
      </>
    );
  else if (mode === "verify" || mode === "reset-verify" || mode === "totp") {
    const phone = mode === "verify" && pending?.next_step === "verify_phone";
    content = (
      <>
        {title(
          mode === "totp"
            ? "Two-step verification"
            : phone
              ? "Check your text message"
              : "Check your email",
          mode === "totp"
            ? "Enter the 6-digit code from your authenticator app."
            : "Enter the 6-digit verification code we sent you to verify your identity.",
        )}
        {mode !== "totp" && (
          <p className={styles.destination}>
            {pending?.destination ||
              (phone
                ? pending?.phone || "Your registered phone number"
                : pending?.email)}
          </p>
        )}
        {mode === "reset-verify" && (
          <p className={styles.hint}>
            If an account matches this email, you’ll receive a code.
          </p>
        )}
        {feedback}
        {form(
          <>
            <Otp
              value={code}
              onChange={setCode}
              disabled={busy}
              error={errors.code}
            />
            {submit("Continue", "Verifying…")}
          </>,
          () => {
            if (!/^\d{6}$/.test(code)) {
              setErrors({ code: "Enter the 6-digit code." });
              return;
            }
            run(
              mode === "totp"
                ? "totp"
                : mode === "reset-verify"
                  ? "verify-reset"
                  : "verify-code",
              { code },
              mode === "reset-verify" ? "/forgot-password/new" : "auto",
            );
          },
        )}
        {mode !== "totp" && (
          <div className={styles.resend}>
            <p>Didn’t receive the code?</p>
            <button
              type="button"
              disabled={busy || seconds > 0}
              onClick={() =>
                run(
                  mode === "reset-verify" ? "forgot-password" : "send-code",
                  mode === "reset-verify" ? { email: pending?.email } : {},
                )
              }
            >
              {seconds > 0 ? `Resend in ${seconds}s` : "Resend code"}
            </button>
          </div>
        )}
        {phone ? (
          <a className={styles.textButton} href="/onboarding/change-phone">
            Change Number
          </a>
        ) : (
          <a
            className={styles.textButton}
            href={mode === "reset-verify" ? "/forgot-password" : "/sign-in"}
          >
            {mode === "reset-verify" ? "Change email" : "Back to sign in"}
          </a>
        )}
      </>
    );
  } else if (mode === "change-phone")
    content = (
      <>
        {title(
          "Change your phone number",
          "Confirm your password to send a new code to your updated number.",
        )}
        {feedback}
        {form(
          <>
            <Field
              label="Phone Number"
              name="phone"
              phone
              type="tel"
              autoComplete="tel"
              required
              error={errors.phone}
            />
            {passwordField()}
            {submit("Send verification code", "Updating your number…")}
            <a className={styles.textButton} href="/onboarding/verify">
              Back to verification
            </a>
          </>,
          (data) =>
            run(
              "change-phone",
              { phone: get(data, "phone"), password: get(data, "password") },
              "/onboarding/verify",
            ),
        )}
      </>
    );
  else if (mode === "new-password")
    content = (
      <>
        {title(
          "Create a new password",
          "Choose a secure password for your account.",
        )}
        {feedback}
        {form(
          <>
            {passwordField("New Password", "new_password", passwordHint)}
            {passwordField(
              "Confirm Password",
              "confirm_password",
              "Make sure both passwords match.",
            )}
            {submit("Update password", "Updating password…")}
          </>,
          (data) => {
            const password = get(data, "new_password");
            const invalid: Fields = {};
            if (!validPassword(password)) invalid.new_password = passwordHint;
            if (password !== get(data, "confirm_password"))
              invalid.confirm_password = "Passwords don’t match.";
            if (Object.keys(invalid).length) {
              setErrors(invalid);
              return;
            }
            run(
              "reset-password",
              { new_password: password },
              "/forgot-password/done",
            );
          },
        )}
      </>
    );
  else if (mode === "reset-done")
    content = (
      <>
        <div className={styles.successIcon} aria-hidden="true">
          ✓
        </div>
        {title(
          "Success",
          "You have successfully updated your password. You can now sign in with your new password.",
        )}
        <a className={styles.linkButton} href="/sign-in">
          Sign in
        </a>
      </>
    );
  else
    content = (
      <>
        <div className={styles.successIcon} aria-hidden="true">
          ✓
        </div>
        {title(
          "You’re signed in",
          snapshot.user?.email_verified && snapshot.user?.phone_verified
            ? "Your email and phone number have been successfully verified and confirmed."
            : "You have successfully signed in to CoreOne.",
        )}
        {feedback}
        <div className={styles.completion}>
          <p>{snapshot.user?.first_name}, welcome to CoreOne.</p>
          <p>
            {snapshot.next_step === "dashboard"
              ? "Your account is ready. Explore the dashboard using clearly labeled sample data."
              : "Your next step is to choose your account type and set up your business profile."}
          </p>
          <p>No plan or payment is required for account verification.</p>
        </div>
        <a href={destination(snapshot)} className={styles.linkButton}>
          {snapshot.next_step === "create_business"
            ? "Continue setup"
            : "Proceed to dashboard"}
        </a>
        <button
          type="button"
          className={styles.textButton}
          disabled={busy}
          onClick={() => run("logout", {}, "/sign-in")}
        >
          Sign out
        </button>
      </>
    );
  return (
    <AuthShell
      setup={setup}
      mode={mode}
      step={mode === "setup" ? 0 : mode === "complete" ? 2 : 1}
    >
      {content}
    </AuthShell>
  );
}
