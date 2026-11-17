"use client";

import { useId, useRef, useState } from "react";
import { navigation } from "@/config/navigation";
import { site } from "@/config/site";
import { Action } from "@/components/ui/Action/Action";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const toggle = useRef<HTMLButtonElement>(null);
  return <header className={styles.header} onKeyDown={event => { if (event.key === "Escape" && open) { setOpen(false); toggle.current?.focus(); } }}>
    <a className={styles.brand} href="#home" aria-label="CoreOne home" onClick={() => setOpen(false)}><img src="/assets/brand/coreone.svg" width={147} height={29} alt="CoreOne" /></a>
    <button ref={toggle} className={styles.toggle} type="button" aria-expanded={open} aria-controls={menuId} aria-label={open ? "Close navigation" : "Open navigation"} onClick={() => setOpen(!open)}><span /><span /><span /></button>
    <div id={menuId} className={`${styles.menu} ${open ? styles.open : ""}`}>
      <nav aria-label="Main navigation"><ul className={styles.links}>{navigation.map(item => <li key={item.label}><Action href={item.href} variant="text" className={item.label === "Home" ? styles.current : ""} onActivate={() => setOpen(false)}>{item.label}</Action></li>)}</ul></nav>
      <div className={styles.account}><Action href={site.destinations.login} variant="text" onActivate={() => setOpen(false)}>Sign In</Action><Action href={site.destinations.signup} arrow onActivate={() => setOpen(false)}>Sign Up</Action></div>
    </div>
  </header>;
}
