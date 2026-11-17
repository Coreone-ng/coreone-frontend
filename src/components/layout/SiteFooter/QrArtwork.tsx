import layers from "./qr-layers.json";
import styles from "./QrArtwork.module.css";
/** Original Figma QR artwork; app download remains marked Coming Soon. */
export function QrArtwork() {
  return (
    <div className={styles.qr} aria-hidden="true">
      <img
        src="/assets/home/50-2839/ea182.svg"
        width={115}
        height={115}
        alt=""
        loading="lazy"
      />
      {layers.map((layer, index) => (
        <span key={index} style={{ inset: layer.inset }}>
          <img src={layer.src} alt="" loading="lazy" />
        </span>
      ))}
    </div>
  );
}
