import type { CSSProperties } from "react";
import styles from "./DeviceMockups.module.css";

export function DeviceMockups({ desktop, mobile, desktopCrop = 188.89, mobileCrop = 415.93, priority = false, label = "CoreOne accounting dashboard" }: { desktop: string; mobile: string; desktopCrop?: number; mobileCrop?: number; priority?: boolean; label?: string }) {
  return <div className={styles.scene}>
    <div className={styles.desktop}><div className={styles.desktopScreen}><img src={desktop} width={2160} height={2720} alt={`${label} on desktop`} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} style={{ "--crop-height": `${desktopCrop}%` } as CSSProperties} /></div></div>
    <div className={styles.mobile}><div className={styles.mobileScreen}><img src={mobile} width={455} height={4096} alt={`${label} on mobile`} loading={priority ? "eager" : "lazy"} style={{ "--crop-height": `${mobileCrop}%` } as CSSProperties} /></div></div>
  </div>;
}
