"use client";
import { useId, useState } from "react";
import { filterFaqs } from "./search";
import entries from "./data/faqs.json";
import styles from "./FaqSection.module.css";

export function FaqSection({
  query = "",
  pricing = false,
}: {
  query?: string;
  pricing?: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(entries[0].id);
  const prefix = useId();
  const matches = filterFaqs(entries, query);
  return (
    <section
      id="faq-answers"
      className={styles.section}
      aria-labelledby={`${prefix}-title`}
    >
      <div className={styles.grid}>
        <div className={styles.intro}>
          <span className={styles.badge}>Good questions</span>
          <h2
            id={`${prefix}-title`}
            className={pricing ? styles.title : "sr-only"}
          >
            {pricing
              ? "Before you choose."
              : "Frequently asked questions and answers"}
          </h2>
          <p>Plain answers to the things businesses ask first.</p>
          <img
            src="/assets/website/e9807aefab52e7350f1bf1f2dbe26ebed413f651.png"
            width={246}
            height={365.25}
            alt=""
            loading="lazy"
          />
        </div>
        <div className={styles.list}>
          {query.trim() && (
            <p role="status" className={styles.resultCount}>
              {matches.length} {matches.length === 1 ? "question" : "questions"}{" "}
              found.
            </p>
          )}
          {!matches.length && (
            <p className={styles.empty}>
              No questions match your search. Try another term or{" "}
              <a href="/contact">contact CoreOne</a>.
            </p>
          )}
          {matches.map((entry, index) => {
            const open = entry.id === openId;
            const answerId = `${prefix}-${entry.id}-answer`;
            const buttonId = `${prefix}-${entry.id}-question`;
            return (
              <div
                className={`${styles.item} ${index === 0 ? styles.first : ""}`}
                key={entry.id}
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={open}
                    aria-controls={answerId}
                    onClick={() => setOpenId(open ? null : entry.id)}
                  >
                    {entry.question}
                    <span className={styles.toggle} aria-hidden="true">
                      <img
                        src={
                          open
                            ? "/assets/website/I39_5360_36_4718.svg"
                            : "/assets/website/I39_5360_36_4730.svg"
                        }
                        width={21}
                        height={open ? 2 : 21}
                        alt=""
                      />
                    </span>
                  </button>
                </h3>
                <div
                  id={answerId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!open}
                  className={styles.answer}
                >
                  <p>{entry.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
