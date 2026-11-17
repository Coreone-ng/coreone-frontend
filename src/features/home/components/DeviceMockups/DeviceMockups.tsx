import Image from "next/image";
import { imageDimensions } from "../../data/image-dimensions";
import type { CSSProperties } from "react";
import styles from "./DeviceMockups.module.css";

export function DeviceMockups({
  desktop,
  mobile,
  desktopCrop = 188.89,
  mobileCrop = 415.93,
  priority = false,
  label = "CoreOne accounting dashboard",
}: {
  desktop: string;
  mobile: string;
  desktopCrop?: number;
  mobileCrop?: number;
  priority?: boolean;
  label?: string;
}) {
  return (
    <div className={styles.scene}>
      <div className={styles.desktop}>
        <div className={styles.desktopScreen}>
          <Image
            src={desktop}
            {...imageDimensions[desktop]}
            sizes="(max-width: 767px) 560px, 1024px"
            alt={`${label} on desktop`}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            style={{ "--crop-height": `${desktopCrop}%` } as CSSProperties}
          />
        </div>
      </div>
      <div className={styles.mobile}>
        <div className={styles.mobileScreen}>
          <Image
            src={mobile}
            {...imageDimensions[mobile]}
            sizes="(max-width: 767px) 154px, 280px"
            alt={`${label} on mobile`}
            loading={priority ? "eager" : "lazy"}
            style={{ "--crop-height": `${mobileCrop}%` } as CSSProperties}
          />
        </div>
      </div>
    </div>
  );
}
