import { Action } from "@/components/ui/Action/Action";
import { site } from "@/config/site";
import { footerNavigation } from "@/config/navigation";
import { QrArtwork } from "./QrArtwork";
import styles from "./SiteFooter.module.css";

const socialLinks = [
  { label: "X (Twitter)", file: "1ebeb.svg", href: site.destinations.twitter },
  { label: "Facebook", file: "821c3.svg", href: site.destinations.facebook },
  { label: "Instagram", file: "59717.svg", href: site.destinations.instagram },
  { label: "LinkedIn", file: "87049.svg", href: site.destinations.linkedin },
];
export function SiteFooter() {
  return <footer className={styles.footer}><div className={styles.container}>
    <div className={styles.top}><div className={styles.brand}><a href="#home" aria-label="CoreOne home"><img src="/assets/home/50-2839/14fbe.svg" width={147} height={29} alt="CoreOne" loading="lazy" /></a><p>Clearer books for modern businesses.</p></div>{footerNavigation.map(group => <nav key={group.title} aria-label={group.title}><h2>{group.title}</h2><ul>{group.links.map(link => <li key={link.label}><Action href={link.href} variant="text">{link.label}</Action></li>)}</ul></nav>)}</div>
    <div className={styles.middle}><address className={styles.contact}><a href={`mailto:${site.email}`}><img src="/assets/home/50-2839/c7459.svg" width={24} height={24} alt="" loading="lazy" />{site.email}</a><a href={site.phoneHref}><img src="/assets/home/50-2839/14968.svg" width={24} height={24} alt="" loading="lazy" /><span>{site.phone}</span></a></address><div className={styles.address}><h2>Address</h2><address>{site.address}</address></div><div className={styles.app}><QrArtwork /><div><p>Download the CoreOne App</p><span>Coming Soon</span></div></div></div>
    <div className={styles.bottom}><p>© 2026 CoreOne. All rights reserved.<br />CoreOne it registered trademarks of CoreOne Limited. Terms and conditions, features, support, pricing, and service options subject to change without notice.</p><div className={styles.socials}>{socialLinks.map(link => <Action key={link.label} href={link.href} variant="text" className={styles.social} label={link.label}><img src={`/assets/home/50-2839/${link.file}`} width={14} height={14} alt="" loading="lazy" /></Action>)}</div></div>
    <div className={styles.watermark} aria-hidden="true">CoreOne</div>
  </div></footer>;
}
