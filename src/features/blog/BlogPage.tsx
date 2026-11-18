import { MarketingPage } from "@/components/layout/MarketingPage/MarketingPage";
import { Action } from "@/components/ui/Action/Action";
import { site } from "@/config/site";
import article from "./data/article.json";
import { CopyLink, NewsletterForm } from "./ArticleActions";
import styles from "./BlogPage.module.css";

export function BlogPage() {
  return (
    <MarketingPage tone="cyan">
      <article>
        <header className={styles.hero}>
          <div className={styles.intro}>
            <p className={styles.published}>{article.published}</p>
            <h1>{article.title}</h1>
            <p className={styles.description}>
              How do you create compelling presentations that wow your
              colleagues and impress your managers?
              <span className={styles.desktopDescription}>
                {" "}
                Find out with our in-depth guide on UX presentations.
              </span>
            </p>
            <ul className={styles.tags} aria-label="Article topics">
              <li>Design</li>
              <li>Research</li>
              <li>Presentation</li>
            </ul>
            <div className={styles.mobileAuthor}>
              <img
                src={article.avatar}
                width={56}
                height={56}
                alt="Olivia Rhye"
              />
              <div>
                <strong>Olivia Rhye</strong>
                <p>20 Jan 2026</p>
              </div>
            </div>
          </div>
          <img
            className={styles.heroImage}
            src={article.hero}
            width={1216}
            height={640}
            alt="Designer reviewing her work at a computer"
            fetchPriority="high"
          />
        </header>
        <div className={styles.articleBody}>
          {article.blocks.map((block) => {
            if (block.kind === "image" && "src" in block)
              return (
                <img
                  className={styles.bodyImage}
                  key={block.sourceId}
                  src={block.src}
                  width={block.width}
                  height={block.height}
                  alt={
                    block.width === 720 && block.height === 480
                      ? "Colleagues collaborating around a table"
                      : "Designer drawing on a tablet at her desk"
                  }
                  loading="lazy"
                />
              );
            const text = "text" in block ? block.text : "";
            if (block.kind === "heading")
              return (
                <h2
                  className={
                    text === "Conclusion"
                      ? styles.conclusionTitle
                      : styles.heading
                  }
                  key={block.sourceId}
                >
                  {text}
                </h2>
              );
            if (block.kind === "quote")
              return <blockquote key={block.sourceId}>{text}</blockquote>;
            if (block.kind === "attribution")
              return (
                <p key={block.sourceId} className={styles.attribution}>
                  {text}
                </p>
              );
            if (block.kind === "caption")
              return (
                <p key={block.sourceId} className={styles.caption}>
                  {text}
                </p>
              );
            return (
              <div key={block.sourceId} className={styles.paragraph}>
                {text?.split("\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            );
          })}
          <div className={styles.author}>
            <div className={styles.authorDetails}>
              <img
                src={article.avatar}
                width={56}
                height={56}
                alt="Olivia Rhye"
              />
              <div>
                <strong>Olivia Rhye</strong>
                <p>Product Designer, Untitled</p>
              </div>
            </div>
            <div className={styles.authorActions}>
              <CopyLink />
              {[
                {
                  file: "1121_236647.svg",
                  label: "Share on X",
                  href: site.destinations.twitter,
                },
                {
                  file: "1121_236648.svg",
                  label: "Share on Facebook",
                  href: site.destinations.facebook,
                },
                {
                  file: "1121_236649.svg",
                  label: "Share on LinkedIn",
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
                    width={40}
                    height={40}
                    alt=""
                  />
                </Action>
              ))}
            </div>
          </div>
        </div>
      </article>
      <section
        id="more-posts"
        className={styles.related}
        aria-labelledby="related-title"
      >
        <div className={styles.container}>
          <h2 id="related-title">From the blog</h2>
          <p className={styles.relatedDescription}>
            The latest industry news, interviews, technologies, and resources.
          </p>
          <div className={styles.cards}>
            {article.related.map((post, i) => (
              <article key={post.sourceId}>
                <div className={styles.cardVisual}>
                  <img
                    className={styles.cardImage}
                    src={post.image}
                    width={592}
                    height={280}
                    alt={post.title}
                    loading="lazy"
                  />
                  <div className={styles.cardOverlay}>
                    <p className={styles.byline}>
                      {post.author}
                      <br />
                      {post.date}
                    </p>
                    <span className={styles.category}>{post.category}</span>
                  </div>
                </div>
                <h3>{post.title}</h3>
                <p className={styles.cardDescription}>{post.description}</p>
                <Action
                  variant="text"
                  href={i === 0 ? site.destinations.blogArticle : null}
                >
                  Read post <span aria-hidden="true">↗</span>
                </Action>
              </article>
            ))}
          </div>
          <div className={styles.viewAll}>
            <Action
              variant="secondary"
              className={styles.viewAllButton}
              href={site.destinations.blog}
            >
              View all posts
            </Action>
          </div>
        </div>
      </section>
      <div className={styles.newsletterStage}>
        <section
          className={styles.newsletter}
          aria-labelledby="newsletter-title"
        >
          <div>
            <h2 id="newsletter-title">Join our newsletter</h2>
            <p>Sign up for the very best tutorials and the latest news.</p>
          </div>
          <NewsletterForm />
        </section>
      </div>
    </MarketingPage>
  );
}
