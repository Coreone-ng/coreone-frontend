import Image from "next/image";
import type { ReactNode } from "react";
import { Action } from "@/components/ui/Action/Action";
import { Eyebrow } from "@/components/ui/SectionHeading/SectionHeading";
import { site } from "@/config/site";
import { CtaArtwork } from "./CtaArtwork";
import styles from "./FinalCtaSection.module.css";

export function FinalCtaSection({
  eyebrow = "A clearer picture starts here",
  title = (
    <>
      Ready to get your
      <br />
      books in order?
    </>
  ),
  actionLabel = "Create Your Free Account",
  href = site.destinations.signup,
}: {
  eyebrow?: string;
  title?: ReactNode;
  actionLabel?: string;
  href?: string | null;
} = {}) {
  return (
    <section className={styles.section} aria-labelledby="cta-title">
      <div className={styles.card}>
        <CtaArtwork />
        <div className={styles.copy}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 id="cta-title">{title}</h2>
          <Action href={href} arrow>
            {actionLabel}
          </Action>
        </div>
        <div className={styles.phone}>
          <Image
            sizes="(max-width: 767px) 260px, 354px"
            src="/assets/home/26-1726/27209.png"
            width={354}
            height={733}
            alt="CoreOne dashboard on an iPhone"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
