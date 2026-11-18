"use client";
import { useState } from "react";
import { ProductHero } from "@/components/layout/ProductHero/ProductHero";
import { FaqSection } from "./FaqSection";
import styles from "./FaqPage.module.css";
export function FaqContent() {
  const [query, setQuery] = useState("");
  return (
    <>
      <ProductHero
        badge="Room to grow, without the guesswork"
        title="Frequently Asked Questions"
        description="Everything you need to know about CoreOne, thoughtfully answered. If you need more, our support team is just a message away."
        variant="faq"
      >
        <div className={styles.search}>
          <label htmlFor="faq-search" className="sr-only">
            Search FAQ
          </label>
          <img
            src="/assets/website/36_4699.svg"
            width={20}
            height={20}
            alt=""
          />
          <input
            id="faq-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search FAQ"
            autoComplete="off"
            aria-controls="faq-answers"
          />
        </div>
      </ProductHero>
      <FaqSection query={query} />
    </>
  );
}
