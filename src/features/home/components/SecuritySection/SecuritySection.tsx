import Image from "next/image";
import { Container } from "@/components/ui/Container/Container";
import {
  Eyebrow,
  SectionHeading,
} from "@/components/ui/SectionHeading/SectionHeading";
import { Action } from "@/components/ui/Action/Action";
import { site } from "@/config/site";
import styles from "./SecuritySection.module.css";

const photos = [
  { file: "a3056.png", alt: "Two business owners reviewing their phone" },
  { file: "bce62.png", alt: "A professional checking business records" },
  { file: "9ff4c.png", alt: "Business partners meeting over coffee" },
  {
    file: "93e00.png",
    alt: "A shop owner using her phone in her clothing store",
  },
];
export function SecuritySection() {
  return (
    <section
      id="security"
      className={styles.section}
      aria-labelledby="security-title"
    >
      <Container>
        <Eyebrow>Your data, protected</Eyebrow>
        <SectionHeading id="security-title">
          Built to be trusted
          <br />
          with your numbers.
        </SectionHeading>
        <p className={styles.body}>
          Bank-level encryption, secure file storage, and a full audit trail of
          every important change — so you always know your books are safe, and
          can see exactly who touched what.
        </p>
        <Action href={site.destinations.security} arrow>
          Learn More
        </Action>
        <div className={styles.photos}>
          {photos.map((photo, index) => (
            <div
              key={photo.file}
              className={`${styles.photo} ${index === 3 ? styles.shop : ""}`}
            >
              <Image
                src={`/assets/home/25-784/${photo.file}`}
                sizes="(max-width: 600px) 45vw, (max-width: 1250px) 23vw, 273px"
                alt={photo.alt}
                width={273}
                height={326}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
