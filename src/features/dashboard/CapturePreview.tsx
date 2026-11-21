"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { AppButton, Icon } from "./components";
import styles from "./Dashboard.module.css";
export function CapturePreview() {
  const camera = useRef<HTMLInputElement>(null);
  const browse = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  return (
    <section className={styles.capture}>
      <div className={styles.captureDevices}>
        <Icon name="monitor" />
        <Icon name="device-transfer" />
        <Icon name="mobile" />
      </div>
      <p className={styles.small}>
        Sample capture screen · no active pairing session
      </p>
      <h1>Photo Capture Tips</h1>
      {[
        "Find an area that’s well lit, or use flash.",
        "Place your document on a desk, flat surface.",
        "Remove objects that obstruct the view or cause shadows or reflection.",
        "Only take a photo of one document at a time.",
      ].map((tip) => (
        <div className={styles.captureTip} key={tip}>
          <span aria-hidden="true">✓</span>
          {tip}
        </div>
      ))}
      {file && (
        <p className={styles.inlineNotice} role="status">
          {file.name} selected locally. Nothing was uploaded. Cross-device
          transfer is not connected.
        </p>
      )}
      <input
        ref={camera}
        className="sr-only"
        type="file"
        accept="image/*"
        capture="environment"
        aria-label="Take sample document photo"
        onChange={(e) => setFile(e.target.files?.[0])}
      />
      <input
        ref={browse}
        className="sr-only"
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.svg"
        aria-label="Browse sample document"
        onChange={(e) => setFile(e.target.files?.[0])}
      />
      <AppButton onClick={() => camera.current?.click()}>
        Snap a document
      </AppButton>
      <AppButton variant="secondary" onClick={() => browse.current?.click()}>
        Browse file to upload
      </AppButton>
      <Link className={styles.textButton} href="/dashboard/bank-transactions">
        Return to bank transactions
      </Link>
    </section>
  );
}
