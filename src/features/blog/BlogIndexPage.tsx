import { MarketingPage } from "@/components/layout/MarketingPage/MarketingPage";
import { Action } from "@/components/ui/Action/Action";
import { FinalCtaSection } from "@/features/home/components/FinalCtaSection/FinalCtaSection";
import { NewsletterForm } from "./ArticleActions";
import posts from "./data/index.json";
import styles from "./BlogIndexPage.module.css";

function PostCard({
  post,
  compact = false,
}: {
  post: (typeof posts)[number];
  compact?: boolean;
}) {
  return (
    <article className={`${styles.post} ${compact ? styles.compact : ""}`}>
      <img
        className={styles.image}
        src={post.image}
        width={compact ? 320 : 592}
        height={compact ? 200 : 248}
        alt=""
        loading="lazy"
      />
      <div className={styles.postBody}>
        <p className={styles.byline}>{post.byline}</p>
        <h3>
          <Action variant="text" href={post.href} className={styles.postLink}>
            {post.title}
            {!compact && (
              <img
                src="/assets/website/I1121_236110_1390_363.svg"
                width={24}
                height={24}
                alt=""
              />
            )}
          </Action>
        </h3>
        <p className={styles.description}>{post.description}</p>
        <ul className={styles.tags} aria-label="Post topics">
          {post.tags.map((tag) => (
            <li key={tag.text} style={tag.style}>
              {tag.text}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
export function BlogIndexPage() {
  return (
    <MarketingPage tone="cyan">
      <header className={styles.hero}>
        <div className={styles.intro}>
          <span className={styles.badge}>Our Blog</span>
          <h1>Stories and interviews</h1>
          <p>
            Subscribe to learn about new product features, the latest in
            technology, solutions, and updates.
          </p>
        </div>
        <div className={styles.subscribe}>
          <NewsletterForm buttonLabel="Submit" tone="brand" />
        </div>
      </header>
      <div className={styles.container}>
        <section aria-labelledby="recent-posts-title">
          <h2 id="recent-posts-title">Recent blog posts</h2>
          <div className={styles.recent}>
            <PostCard post={posts[0]} />
            <div className={styles.stack}>
              {posts.slice(1, 3).map((post) => (
                <PostCard key={post.sourceId} post={post} compact />
              ))}
            </div>
          </div>
        </section>
        <section
          className={styles.allPosts}
          id="all-posts"
          aria-labelledby="all-posts-title"
        >
          <h2 id="all-posts-title">All blog posts</h2>
          <div className={styles.allGrid}>
            {posts.slice(3).map((post) => (
              <PostCard key={post.sourceId} post={post} />
            ))}
          </div>
          <nav className={styles.pagination} aria-label="Blog pagination">
            <button
              type="button"
              disabled
              title="Only the first page has been supplied"
            >
              ← Previous
            </button>
            <ol>
              {[1, 2, 3, "…", 8, 9, 10].map((page) => (
                <li key={page}>
                  {page === "…" ? (
                    <span aria-hidden="true">…</span>
                  ) : (
                    <button
                      type="button"
                      aria-current={page === 1 ? "page" : undefined}
                      disabled={page !== 1}
                      title={
                        page === 1
                          ? "Current page"
                          : "Additional blog pages are not available yet"
                      }
                    >
                      {page}
                    </button>
                  )}
                </li>
              ))}
            </ol>
            <button
              type="button"
              disabled
              title="Additional blog pages are not available yet"
            >
              Next →
            </button>
          </nav>
        </section>
      </div>
      <FinalCtaSection />
    </MarketingPage>
  );
}
