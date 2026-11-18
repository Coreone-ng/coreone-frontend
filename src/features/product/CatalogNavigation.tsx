"use client";
import { useEffect, useState } from "react";
import styles from "./FeatureCatalogPage.module.css";
export function CatalogNavigation({
  sections,
}: {
  sections: { id: string; navigation: string }[];
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
    <nav className={styles.navigation} aria-label="Feature categories">
      <ol>
        {sections.map(({ id, navigation }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={() => setActive(id)}
              aria-current={active === id ? "location" : undefined}
            >
              {navigation}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
