"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button/Button";
import { site } from "@/config/site";
import {
  contactSubjects,
  validateContact,
  type ContactErrors,
  type ContactValues,
} from "./validation";
import fields from "@/components/ui/FormControls/FormControls.module.css";
import styles from "./ContactPage.module.css";

export function ContactForm() {
  const [ready, setReady] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState("US");
  useEffect(() => setReady(true), []);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [unavailable, setUnavailable] = useState(false);
  const notice = useRef<HTMLDivElement>(null);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget,
      data = new FormData(form);
    const values: ContactValues = {
      fullName: String(data.get("fullName") || ""),
      company: String(data.get("company") || ""),
      email: String(data.get("email") || ""),
      phone: String(data.get("phone") || ""),
      subject: String(data.get("subject") || ""),
      message: String(data.get("message") || ""),
      consent: data.get("consent") === "on",
    };
    const next = validateContact(values);
    setErrors(next);
    setUnavailable(false);
    const invalid = Object.keys(next)[0];
    if (invalid) {
      form.querySelector<HTMLElement>(`[name="${invalid}"]`)?.focus();
      return;
    }
    // No delivery endpoint was supplied. Keep values in the form and never claim delivery.
    setUnavailable(true);
    requestAnimationFrame(() => notice.current?.focus());
  }
  const error = (name: keyof ContactValues) =>
    errors[name] ? (
      <span id={`${name}-error`} className={fields.error}>
        {errors[name]}
      </span>
    ) : null;
  const input = (
    name: "fullName" | "company" | "email" | "phone",
    label: string,
    placeholder: string,
    autocomplete: string,
    required = false,
    type = "text",
  ) => (
    <div className={fields.field}>
      <label className={fields.label} htmlFor={name}>
        {label}
        {required && <span className={fields.required}> *</span>}
      </label>
      <input
        className={fields.input}
        id={name}
        name={name}
        type={type}
        autoComplete={autocomplete}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
      />
      {error(name)}
    </div>
  );
  return (
    <form method="post" noValidate onSubmit={submit} className={styles.form}>
      <div className={styles.pair}>
        {input("fullName", "Full name", "Full name", "name", true)}
        {input(
          "company",
          "Company name (If any)",
          "Company name",
          "organization",
        )}
      </div>
      {input("email", "Email", "you@company.com", "email", true, "email")}
      <div className={fields.field}>
        <label className={fields.label} htmlFor="phone">
          Phone number
        </label>
        <div className={styles.phoneField}>
          <select
            aria-label="Phone country"
            value={phoneCountry}
            onChange={(event) => setPhoneCountry(event.target.value)}
          >
            <option value="US">US</option>
            <option value="NG">NG</option>
            <option value="GB">GB</option>
          </select>
          <input
            className={fields.input}
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder={
              phoneCountry === "NG"
                ? "+234 803 000 0000"
                : phoneCountry === "GB"
                  ? "+44 7700 000000"
                  : "+1 (555) 000-0000"
            }
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
        </div>
        {error("phone")}
      </div>
      <div className={fields.field}>
        <label className={fields.label} htmlFor="subject">
          Subject<span className={fields.required}> *</span>
        </label>
        <select
          className={fields.input}
          id="subject"
          name="subject"
          defaultValue=""
          required
          aria-invalid={!!errors.subject}
          aria-describedby={errors.subject ? "subject-error" : undefined}
        >
          <option value="" disabled>
            Select your subject type
          </option>
          {contactSubjects.map((subject) => (
            <option key={subject}>{subject}</option>
          ))}
        </select>
        {error("subject")}
      </div>
      <div className={fields.field}>
        <label className={fields.label} htmlFor="message">
          Message<span className={fields.required}> *</span>
        </label>
        <textarea
          className={fields.input}
          id="message"
          name="message"
          rows={5}
          placeholder="Please describe the service you are interested in..........."
          required
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {error("message")}
      </div>
      <div>
        <label className={fields.check}>
          <input
            type="checkbox"
            name="consent"
            required
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? "consent-error" : undefined}
          />
          <span>
            You agree to our friendly{" "}
            <a href={site.destinations.privacy}>privacy policy.</a>
          </span>
        </label>
        {error("consent")}
      </div>
      <Button type="submit" disabled={!ready}>
        Send Message{" "}
        <img src="/assets/home/5-10/b2930.svg" width={14} height={14} alt="" />
      </Button>
      <noscript>
        Enable JavaScript to use this form, or email support@coreoneng.com.
      </noscript>
      {unavailable && (
        <div ref={notice} tabIndex={-1} role="status" className={fields.status}>
          Online message delivery is not available yet. Your message has not
          been sent. Please email{" "}
          <a href="mailto:support@coreoneng.com">support@coreoneng.com</a>.
        </div>
      )}
    </form>
  );
}
