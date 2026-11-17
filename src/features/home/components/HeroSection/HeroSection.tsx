import { Action } from "@/components/ui/Action/Action";
import { site } from "@/config/site";
import { DeviceMockups } from "../DeviceMockups/DeviceMockups";
import styles from "./HeroSection.module.css";

export function HeroSection() {
  return <section className={styles.hero} aria-labelledby="hero-title">
    <div className={styles.stage}><div className={styles.content}>
      <div className={styles.copy}>
        <div className={styles.badge}><span>Accounting</span><span>Made clearer</span></div>
        <div className={styles.title}><h1 id="hero-title">Smart, simple accounting for modern businesses.</h1><img src="/assets/home/5-10/f5dc1.svg" width={709} height={16.2521} alt="" /></div>
        <p className={styles.support}>Track invoices, manage expenses, connect your bank accounts and run reports, all from one place, built around proper double-entry accounting.</p>
        <div className={styles.actions}><Action href={site.destinations.signup} arrow>Start Free</Action><Action href={site.destinations.demoVideo ?? "#features"} variant="secondary"><img src="/assets/home/5-10/71096.svg" width={24} height={24} alt="" />See How It Works</Action></div>
      </div>
      <div className={styles.art}><DeviceMockups desktop="/assets/home/5-10/caf37.png" mobile="/assets/home/5-10/3ba8a.png" priority /></div>
    </div></div>
  </section>;
}
