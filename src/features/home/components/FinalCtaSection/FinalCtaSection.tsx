import { Action } from "@/components/ui/Action/Action";
import { Eyebrow } from "@/components/ui/SectionHeading/SectionHeading";
import { site } from "@/config/site";
import { CtaArtwork } from "./CtaArtwork";
import styles from "./FinalCtaSection.module.css";

export function FinalCtaSection() {
  return <section className={styles.section} aria-labelledby="cta-title"><div className={styles.card}>
    <CtaArtwork />
    <div className={styles.copy}><Eyebrow>A clearer picture starts here</Eyebrow><h2 id="cta-title">Ready to get your<br />books in order?</h2><Action href={site.destinations.signup} arrow>Create Your Free Account</Action></div>
    <div className={styles.phone}><img src="/assets/home/26-1726/27209.png" width={354} height={733} alt="CoreOne dashboard on an iPhone" loading="lazy" /></div>
  </div></section>;
}
