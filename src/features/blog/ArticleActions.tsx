"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { site } from "@/config/site";
import fields from "@/components/ui/FormControls/FormControls.module.css";
import styles from "./BlogPage.module.css";

export function CopyLink() {
  const [status, setStatus] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus("Link copied.");
    } catch {
      setStatus("Could not copy the link. Copy the address from your browser.");
    }
  }
  return (
    <div className={styles.copyLink}>
      <button type="button" onClick={copy}>
        Copy link
      </button>
      <span role="status">{status}</span>
    </div>
  );
}
export function NewsletterForm({
  buttonLabel = "Subscribe",
  tone = "purple",
}: { buttonLabel?: string; tone?: "purple" | "brand" } = {}) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [status, setStatus] = useState("");
  return (
    <form
      method="post"
      className={`${styles.newsletterForm} ${tone === "brand" ? styles.brandNewsletter : ""}`}
      onSubmit={(event) => {
        event.preventDefault();
        setStatus(
          "Newsletter subscriptions are not available yet. Your email has not been submitted.",
        );
      }}
    >
      <div className={styles.subscribe}>
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <input
          className={fields.input}
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          required
        />
        <Button type="submit" disabled={!ready}>
          {buttonLabel}
        </Button>
      </div>
      <noscript>Newsletter subscriptions are not available yet.</noscript>
      <p>
        We care about your data in our{" "}
        <a href={site.destinations.privacy}>privacy policy.</a>
      </p>
      <p role="status">{status}</p>
    </form>
  );
}
