"use client";
import { useEffect, useState } from "react";
import styles from "./LegalPage.module.css";

export function LegalContents({
  sections,
}: {
  sections: { id: string; title: string }[];
}) {
  const [active, setActive] = useState(sections[0]?.id);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-5% 0px -60% 0px" },
    );
    for (const { id } of sections) {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [sections]);
  return (
    <nav className={styles.contents} aria-label="On this page">
      <ol>
        {sections.map(({ id, title }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={() => setActive(id)}
              aria-current={active === id ? "location" : undefined}
            >
              {title.trim()}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
