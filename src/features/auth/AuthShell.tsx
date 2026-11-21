"use client";
import { useState, type ReactNode } from "react";
import { site } from "@/config/site";
import type { AuthMode } from "./model";
import styles from "./AuthPage.module.css";
function Artwork() {
  return (
    <aside className={styles.artwork} aria-hidden="true">
      <img
        className={styles.portraitTeal}
        src="/assets/onboarding/portrait-teal.webp"
        alt=""
      />
      <span className={styles.cyanShape} />
      <img
        className={styles.portraitSand}
        src="/assets/onboarding/portrait-sand.webp"
        alt=""
      />
      <span className={styles.circle} />
      <span className={styles.leftShape} />
      <span className={styles.rightShape} />
      <span className={styles.bottomShape} />
      <img
        className={styles.portraitCyan}
        src="/assets/onboarding/portrait-cyan.webp"
        alt=""
      />
      <img
        className={styles.portraitRose}
        src="/assets/onboarding/portrait-rose.webp"
        alt=""
      />
      <span className={styles.circle} />
      <span className={styles.peachShape} />
    </aside>
  );
}
export function AuthShell({
  children,
  setup,
  step,
  mode,
  profileStep,
  className = "",
}: {
  children: ReactNode;
  setup: boolean;
  step: number;
  mode: AuthMode;
  profileStep?: "User" | "Business Profile" | "User Profile";
  className?: string;
}) {
  const [menu, setMenu] = useState(false);
  const login = mode === "sign-in";
  return (
    <div
      className={`${styles.shell} ${login ? styles.splitShell : styles.setupShell} ${!setup && !login ? styles.resetShell : ""} ${className}`}
    >
      <header className={styles.header}>
        <a href="/" aria-label="CoreOne home">
          <img
            src="/assets/brand/coreone.svg"
            width="147"
            height="30"
            alt="CoreOne"
          />
        </a>
        {!login && (
          <div className={styles.menu}>
            <button
              type="button"
              aria-label="Account help"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                aria-hidden="true"
              >
                <rect width="32" height="32" rx="4" fill="#15B8AC" />
                <circle cx="16" cy="12" r="4" fill="white" fillOpacity=".6" />
                <path d="M9 25a7 7 0 0 1 14 0" fill="white" />
              </svg>{" "}
              <span aria-hidden="true">⌄</span>
              <svg
                className={styles.menuHamburger}
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            {menu && (
              <nav aria-label="Account help">
                <a href={site.destinations.contact}>Support</a>
                <a href={site.destinations.faqs}>FAQ</a>
                <a href={site.destinations.login}>Sign in</a>
              </nav>
            )}
          </div>
        )}
      </header>
      {login && (
        <div className={styles.mobileStrip} aria-hidden="true">
          <img src="/assets/onboarding/portrait-teal.webp" alt="" />
          <span className={styles.cyanShape} />
          <img src="/assets/onboarding/portrait-sand.webp" alt="" />
          <span className={styles.circle} />
          <span className={styles.circle} style={{ background: "#cad1e7" }} />
        </div>
      )}
      <main id="main-content" className={styles.main}>
        {profileStep ? (
          <div className={styles.singleProgress}>
            <img
              src={`/assets/business-setup/${profileStep === "Business Profile" ? "business-progress" : "user-progress"}.svg`}
              width="36"
              height="36"
              alt=""
            />
            <span>{profileStep}</span>
          </div>
        ) : (
          setup && (
            <ol className={styles.progress} aria-label="Account setup progress">
              {["Set-Up", "Verify", "Complete"].map((label, index) => (
                <li
                  key={label}
                  className={index <= step ? styles.activeStep : ""}
                  aria-current={index === step ? "step" : undefined}
                >
                  <span aria-hidden="true">
                    {index < step ? (
                      "✓"
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        {index === 0 ? (
                          <>
                            <rect x="6" y="3" width="12" height="16" rx="2" />
                            <circle cx="12" cy="8" r="2" />
                            <path d="M9 15a3 3 0 0 1 6 0m-5 4v3l2-1 2 1v-3" />
                          </>
                        ) : index === 1 ? (
                          <>
                            <rect x="3" y="5" width="18" height="14" rx="4" />
                            <path d="m6 8 6 5 6-5" />
                          </>
                        ) : (
                          <>
                            <rect x="8" y="3" width="13" height="14" rx="3" />
                            <rect x="3" y="8" width="13" height="14" rx="3" />
                            <path d="m6 14 3 3 4-5" />
                          </>
                        )}
                      </svg>
                    )}
                  </span>
                  {label}
                </li>
              ))}
            </ol>
          )
        )}
        <div className={styles.card}>
          {["forgot", "new-password", "reset-verify"].includes(mode) && (
            <div className={styles.iconBadge} aria-hidden="true">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                {mode === "reset-verify" ? (
                  <>
                    <rect x="3" y="5" width="18" height="14" rx="3" />
                    <path d="m3 7 9 6 9-6" />
                  </>
                ) : (
                  <>
                    <path d="m3 21 2-6 5-5a6 6 0 1 1 4 4l-2 2H9v3H6v2H3Z" />
                    <circle cx="16" cy="7" r="1" />
                  </>
                )}
              </svg>
            </div>
          )}
          {children}
        </div>
      </main>
      {login && <Artwork />}
      <footer className={styles.footer}>
        © CoreOne {new Date().getFullYear()}
        {setup && (
          <span>
            <a href={site.destinations.privacy}>Privacy Policy</a>
            <a href={site.destinations.terms}>Terms & Conditions</a>
          </span>
        )}
      </footer>
    </div>
  );
}
