import { MarketingPage } from "@/components/layout/MarketingPage/MarketingPage";
import styles from "./AboutPage.module.css";

const base = "/assets/website/";
const values = [
  {
    title: "Accurate by Design",
    description: "Every figure traces back to a balanced ledger.",
    icon: "59_12606.svg",
  },
  {
    title: "Open to all",
    description: "Tax-ready records, built in from the start.",
    icon: "59_12618.svg",
  },
  {
    title: "Clear for Everyone",
    description: "Your numbers, in plain language.",
    icon: "59_12624.svg",
  },
  {
    title: "Smarter Over Time",
    description: "Automation added on top of clean, verified data.",
    icon: "59_12630.svg",
  },
];
const principles = [
  [
    "Accounting-first",
    "Every feature connects to a real double-entry ledger, not a disconnected dashboard.",
  ],
  [
    "Compliance by design",
    "Tax and e-invoicing requirements are considered from the foundation of how we structure financial data.",
  ],
  [
    "Human-friendly",
    "You shouldn't need an accounting degree to understand your own numbers.",
  ],
  [
    "Progressively intelligent",
    "We layer automation and AI onto verified financial data, not in place of it.",
  ],
  [
    "Built to scale",
    "From a single Nigerian business to multi-entity and multi-country operations, Coreone is designed to grow with the business.",
  ],
];
const approachImages = [
  "57c53b63ec8c48d367efb0a6592d25089226242f.png",
  "fc4fc76649f1cdb22cac9a1f8844ea5f55884598.png",
  "7ff63c9617f04814886aec99b7c9e09539c7b530.png",
  "59197b632d24d41e0cb0db15b7f69cb7771aaf9e.png",
];
const communityImages = [
  "df964c345b3f0cd335c27c1209d705a4b75c3450.jpg",
  "b8bebef4670d96dfb59099a5932db3e1dcbf1bc6.jpg",
  "a65c037522134b92b9b276911e8bfdada93ed581.jpg",
  "f0420085d1cdbc1e0deb089733450f4e14390b1e.jpg",
];

export function AboutPage() {
  return (
    <MarketingPage tone="cyan">
      <section className={styles.hero} aria-labelledby="about-title">
        <div className={styles.heroGrid}>
          <div>
            <span className={styles.badge}>
              A clearer view changes everything
            </span>
            <h1 id="about-title">
              We&apos;re building the financial operating system for modern
              businesses.
            </h1>
            <img
              className={styles.underline}
              src={`${base}30_14654.svg`}
              width={709}
              height={16}
              alt=""
            />
            <p>
              Coreone started with a simple observation: businesses don&apos;t
              fail because they don&apos;t work hard, they fail because they
              can&apos;t see their numbers clearly.
            </p>
          </div>
          <img
            className={styles.heroPhoto}
            src={`${base}ca7e0533f2addfe1febabcad01a1012d8763efbe.jpg`}
            width={1264}
            height={848}
            alt="A smiling support professional in a bright office"
            fetchPriority="high"
          />
        </div>
      </section>
      <section className={styles.story} aria-labelledby="story-title">
        <div className={styles.container}>
          <p className={styles.eyebrow}>Our Story</p>
          <h2 id="story-title">
            Too much financial activity. Not enough clarity.
          </h2>
          <p className={styles.storyCopy}>
            Too many Nigerian businesses run their finances across bank apps,
            spreadsheets, invoices, receipts and chat messages that never quite
            add up. We built Coreone to bring it all into one place, starting
            with a dependable, correct accounting foundation, and growing into a
            full financial operating system.
          </p>
        </div>
      </section>
      <section className={styles.values} aria-labelledby="values-title">
        <div className={styles.container}>
          <p className={styles.eyebrow}>Our Values</p>
          <h2 id="values-title">
            What every number stands on.{" "}
            <span>The principles behind every figure.</span>
          </h2>
          <p className={styles.valuesCopy}>
            Coreone starts with a dependable ledger. Everything else, from
            invoices to insights, is built on top of it.
          </p>
          <div className={styles.cards}>
            {values.map((value) => (
              <article key={value.title}>
                <img
                  src={base + value.icon}
                  width={44}
                  height={44}
                  alt=""
                  loading="lazy"
                />
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className={styles.approach} aria-labelledby="approach-title">
        <div className={styles.container}>
          <p className={styles.eyebrow}>Our Approach</p>
          <h2 id="approach-title">Five principles. One reliable foundation.</h2>
          <ol className={styles.principles}>
            {principles.map(([title, description], i) => (
              <li key={title}>
                <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className={styles.photos}>
            {approachImages.map((file, i) => (
              <img
                key={file}
                src={base + file}
                width={305}
                height={326}
                alt={
                  [
                    "Business professional using his phone outdoors",
                    "Entrepreneur working with her phone and laptop",
                    "Business owner checking her phone at a desk",
                    "Shop owner using a phone",
                  ][i]
                }
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>
      <section className={styles.community} aria-labelledby="community-title">
        <div className={styles.container}>
          <p className={styles.eyebrow}>
            Join us in building something better for African businesses.
          </p>
          <h2 id="community-title">
            Join us in building something better for African businesses.
          </h2>
          <div className={styles.photos}>
            {communityImages.map((file, i) => (
              <img
                key={file}
                src={base + file}
                width={273}
                height={326}
                alt={
                  [
                    "Two entrepreneurs sharing a phone",
                    "Business professional at his desk",
                    "Colleagues working together in a café",
                    "Shop owner reviewing her phone",
                  ][i]
                }
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </section>
      <section className={styles.vision} aria-labelledby="vision-title">
        <div className={styles.visionPanel}>
          <img
            className={styles.pattern}
            src={`${base}30_16881.svg`}
            width={1499}
            height={1476}
            alt=""
            loading="lazy"
          />
          <img
            className={styles.swoosh}
            src={`${base}30_16911.svg`}
            width={852}
            height={299}
            alt=""
            loading="lazy"
          />
          <div className={styles.visionCopy}>
            <p className={styles.eyebrow}>Our Vision</p>
            <h2 id="vision-title">
              To make business finance{" "}
              <span>
                simpler, connected, compliant and increasingly intelligent.
              </span>
            </h2>
          </div>
          <img
            className={styles.phone}
            src={`${base}2c875fce8fafbc19f3319e1d79d89b275ec79710.png`}
            width={354}
            height={733}
            alt="CoreOne mobile app showing business quick actions"
            loading="lazy"
          />
          <img
            className={styles.seal}
            src={`${base}350_60011.svg`}
            width={96}
            height={96}
            alt=""
            loading="lazy"
          />
        </div>
      </section>
    </MarketingPage>
  );
}
