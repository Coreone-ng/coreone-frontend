"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { features } from "../../data/features";
import { DeviceMockups } from "../DeviceMockups/DeviceMockups";
import { Action } from "@/components/ui/Action/Action";
import { site } from "@/config/site";
import styles from "./FeaturesSection.module.css";

export function FeatureTabs() {
  const [selected, setSelected] = useState(4);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const feature = features[selected];
  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % features.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index - 1 + features.length) % features.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = features.length - 1;
    else return;
    event.preventDefault(); setSelected(next); buttons.current[next]?.focus();
  }
  return <div className={styles.showcase}>
    <div className={styles.pattern} aria-hidden="true"><img src="/assets/home/1114-214981/da5e6.svg" width={1920} height={1440} alt="" loading="lazy" /><img src="/assets/home/1114-214981/f450c.svg" width={1920} height={1440} alt="" loading="lazy" /></div>
    <div className={styles.selection}>
      <div role="tablist" aria-label="Product features" aria-orientation="vertical" className={styles.tabs}>
        {features.map((item, index) => <div key={item.id} className={`${styles.tabRow} ${selected === index ? styles.activeRow : ""}`}>
          <button ref={node => { buttons.current[index] = node; }} type="button" role="tab" id={`tab-${item.id}`} aria-selected={selected === index} aria-controls={`panel-${item.id}`} tabIndex={selected === index ? 0 : -1} className={styles.tab} onKeyDown={event => navigate(event, index)} onClick={() => setSelected(index)}><img src={selected === index ? item.activeIcon ?? item.icon : item.icon} width={24} height={24} alt="" loading="lazy" />{item.label}</button>
        </div>)}
      </div>
      {/* The selected copy follows the active row visually, without nesting links in a tablist. */}
      <div className={styles.description} style={{ "--selected-row": selected } as React.CSSProperties}>
        <p>{feature.description ?? "Preview unavailable."}</p>
        <Action href={site.destinations.signup}>Try CoreOne Now</Action><div className={styles.progress} aria-hidden="true"><span /></div>
      </div>
    </div>
    {features.map((item, index) => <div key={item.id} className={styles.preview} role="tabpanel" id={`panel-${item.id}`} aria-labelledby={`tab-${item.id}`} hidden={selected !== index} tabIndex={0}>
      {selected === index && (item.desktop && item.mobile ? <div className={styles.devices}><DeviceMockups desktop={item.desktop} mobile={item.mobile} desktopCrop={item.desktopCrop} mobileCrop={item.mobileCrop} label={`CoreOne ${item.label}`} /></div> : <div className={styles.unavailable}><h3>{item.label}</h3><p>Preview unavailable.</p></div>)}
    </div>)}
  </div>;
}
