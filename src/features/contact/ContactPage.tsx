import { MarketingPage } from "@/components/layout/MarketingPage/MarketingPage";
import { Action } from "@/components/ui/Action/Action";
import { site } from "@/config/site";
import { ContactForm } from "./ContactForm";
import styles from "./ContactPage.module.css";

export function ContactPage() {
  return (
    <MarketingPage tone="cyan">
      <section className={styles.hero} aria-labelledby="contact-title">
        <div className={styles.heroGrid}>
          <div>
            <span className={styles.badge}>Our Support system</span>
            <h1 id="contact-title">Real People, Real Support</h1>
            <img
              className={styles.underline}
              src="/assets/website/30_14654.svg"
              width={709}
              height={16}
              alt=""
            />
            <p className={styles.support}>
              Whether you have a question, need help with our platform, or want
              to explore partnership opportunities, our team is here to help.
              Reach out through your preferred channel and we&apos;ll make sure
              you get the support you need.
            </p>
            <dl className={styles.stats}>
              <div>
                <dt>24/7</dt>
                <dd>Resources</dd>
              </div>
              <div>
                <dt>Global</dt>
                <dd>Support</dd>
              </div>
              <div>
                <dt>Fast</dt>
                <dd>Response</dd>
              </div>
            </dl>
          </div>
          <div className={styles.photo}>
            <img
              src="/assets/website/dbc515b644c1229963ab4f330b9c8d63490bd668.jpg"
              width={1264}
              height={848}
              alt="A support specialist wearing a headset"
              fetchPriority="high"
            />
            <div className={styles.review}>
              <span>Issue Resolved</span>
              <strong>Bankole</strong>
              <p>Thank you! That was much faster than I expected.</p>
              <img
                src="/assets/website/39_7196.svg"
                width={116}
                height={20}
                alt="Five stars"
              />
            </div>
          </div>
        </div>
      </section>
      <section
        className={styles.formSection}
        aria-labelledby="contact-form-title"
      >
        <h2 id="contact-form-title">Contact form</h2>
        <p>We’d love to hear from you. Please fill out this form.</p>
        <ContactForm />
      </section>
      <section
        className={styles.channels}
        aria-label="Other ways to contact CoreOne"
      >
        <div className={styles.channelGrid}>
          <article>
            <p className={styles.eyebrow}>Email Support</p>
            <h2>support@coreoneng.com</h2>
            <p>Questions? Email us and we’ll get back to you within an hour.</p>
            <Action href="mailto:support@coreoneng.com" variant="text">
              Open Email <span aria-hidden="true">↗</span>
            </Action>
          </article>
          <article>
            <p className={styles.eyebrow}>Live Chat</p>
            <h2>Chat with our team</h2>
            <p>
              Get instant help from a support specialist.
              <br />
              Availability: Monday – Friday • 8:00 AM – 8:00 PM (WAT)
            </p>
            <Action href={site.destinations.liveChat} variant="text">
              Start Chat <span aria-hidden="true">↗</span>
            </Action>
          </article>
          <article>
            <p className={styles.eyebrow}>Phone Support</p>
            <h2>{site.phone}</h2>
            <p>
              Prefer speaking with someone? Our support team is available during
              business hours.
            </p>
            <Action href={site.phoneHref} variant="text">
              Call Us <span aria-hidden="true">↗</span>
            </Action>
          </article>
          <article>
            <p className={styles.eyebrow}>Social MEDIA</p>
            <h2>Follow CoreOne</h2>
            <p>
              Stay connected for product updates, new features, and community
              stories.
            </p>
            <div className={styles.socials}>
              {[
                {
                  label: "X (Twitter)",
                  file: "39_7302.svg",
                  href: site.destinations.twitter,
                },
                {
                  label: "Facebook",
                  file: "39_7305.svg",
                  href: site.destinations.facebook,
                },
                {
                  label: "Instagram",
                  file: "39_7307.svg",
                  href: site.destinations.instagram,
                },
                {
                  label: "LinkedIn",
                  file: "39_7309.svg",
                  href: site.destinations.linkedin,
                },
              ].map((social) => (
                <Action
                  key={social.label}
                  href={social.href}
                  label={social.label}
                  variant="text"
                >
                  <img
                    src={`/assets/website/${social.file}`}
                    width={36}
                    height={36}
                    alt=""
                  />
                </Action>
              ))}
            </div>
          </article>
        </div>
      </section>
    </MarketingPage>
  );
}
