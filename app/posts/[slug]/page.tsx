import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostBody } from "@/components/post-body";
import { TableOfContents } from "@/components/table-of-contents";
import { ReadingProgress } from "@/components/reading-progress";
import { ToolPill } from "@/components/tool-pill";
import { PxRemMini, HexRgbMini } from "@/components/mini-converters";
import { getPost, getPostTool, posts, slugifyHeading } from "@/lib/posts";
import { siteUrl } from "@/lib/site";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };
  const url = `${siteUrl}/posts/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: `${post.title} · ByteTips`,
      description: post.excerpt,
      url,
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: "summary",
      title: `${post.title} · ByteTips`,
      description: post.excerpt,
    },
  };
}

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function stripMarkdownLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const postUrl = `${siteUrl}/posts/${post.slug}`;
  const tool = getPostTool(post);

  // Table of contents: every h2 except the closing "Try it" section.
  const seen = new Map<string, number>();
  const headings = post.content
    .filter((block) => block.type === "h2" && block.text !== "Try it")
    .map((block) => {
      if (block.type !== "h2") return null;
      const base = slugifyHeading(block.text);
      const n = (seen.get(base) ?? 0) + 1;
      seen.set(base, n);
      return { id: n > 1 ? `${base}-${n}` : base, text: block.text };
    })
    .filter((h): h is { id: string; text: string } => h !== null);

  const readingMinutes = parseInt(post.readingTime, 10) || 0;
  const showToc = readingMinutes > 4 && headings.length >= 2;

  // FAQ pairs: an h2 phrased as a question, answered by the paragraph after it.
  const faqPairs: { question: string; answer: string }[] = [];
  for (let i = 0; i < post.content.length - 1; i++) {
    const block = post.content[i];
    const next = post.content[i + 1];
    if (block.type === "h2" && block.text.endsWith("?") && next.type === "p") {
      faqPairs.push({ question: block.text, answer: stripMarkdownLinks(next.text) });
    }
  }

  const index = posts.findIndex((candidate) => candidate.slug === post.slug);
  const previous = index > 0 ? posts[index - 1] : null;
  const next = index >= 0 && index < posts.length - 1 ? posts[index + 1] : null;
  const sameCategory = posts
    .filter((candidate) => candidate.slug !== post.slug && candidate.category === post.category)
    .slice(0, 3);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <ReadingProgress />
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-[13px] text-muted">
        <Link href="/" className="transition-colors hover:text-ink">
          Guides
        </Link>
        <span>/</span>
        <span className="min-w-0 text-ink [overflow-wrap:anywhere]">{post.title}</span>
      </nav>

      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Guide</p>
      <h1 className="mt-3 text-4xl font-bold leading-[1.12] tracking-tight text-ink [overflow-wrap:anywhere] sm:text-5xl">
        {post.title}
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-muted [overflow-wrap:anywhere]">{post.excerpt}</p>
      <p className="mt-6 border-y border-line py-3 text-[13px] text-muted">
        {formatDate(post.date)} · {post.readingTime} · {post.author} · {post.category}
      </p>

      {tool && (
        <section className="mt-8 rounded-2xl border border-accent-mid bg-surface p-5 sm:p-6">
          <p className="text-sm font-semibold text-ink">🛠️ Try it in your browser — no uploads</p>
          <p className="mt-1 text-[14px] leading-relaxed text-muted">
            Skip the manual work and run this on your own input with the free {tool.label}.
          </p>
          <a
            href={tool.url}
            className="mt-3 inline-block text-sm font-semibold text-accent hover:text-accent"
          >
            Open free {tool.label} on Byte-Kit →
          </a>
        </section>
      )}

      {post.slug === "px-to-rem-why-it-matters" && (
        <div className="mt-8">
          <PxRemMini />
        </div>
      )}
      {post.slug === "hex-to-rgb-how-conversion-works" && (
        <div className="mt-8">
          <HexRgbMini />
        </div>
      )}

      {showToc && (
        <div className="mt-10">
          <TableOfContents headings={headings} />
        </div>
      )}

      <article className="mt-10" data-article-body>
        <PostBody blocks={post.content} />
      </article>

      <section className="mt-14 rounded-2xl border border-line bg-surface p-6">
        <p className="text-[15px] leading-relaxed text-muted">
          Written by <span className="font-semibold text-ink">Shayan</span> — Creator of{" "}
          <a href="https://byte-kit.dev" className="font-medium text-accent hover:text-accent">
            Byte-Kit
          </a>{" "}
          &amp;{" "}
          <a href="https://bytetips.tech" className="font-medium text-accent hover:text-accent">
            ByteTips
          </a>
          . Building private developer tools.
        </p>
      </section>

      {(previous || next) && (
        <nav
          aria-label="Previous and next guides"
          className="mt-10 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:justify-between"
        >
          {previous ? (
            <Link href={`/posts/${previous.slug}`} className="group max-w-md">
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                ← Previous guide
              </span>
              <span className="mt-1 block text-[15px] font-semibold text-accent group-hover:text-accent">
                {previous.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/posts/${next.slug}`} className="group max-w-md text-left sm:text-right">
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                Next guide →
              </span>
              <span className="mt-1 block text-[15px] font-semibold text-accent group-hover:text-accent">
                {next.title}
              </span>
            </Link>
          )}
        </nav>
      )}

      {sameCategory.length > 0 && (
        <section className="mt-10 border-t border-line pt-8">
          <h2 className="text-2xl font-bold tracking-tight text-ink">More {post.category} guides</h2>
          <ul className="mt-4 space-y-3">
            {sameCategory.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/posts/${item.slug}`}
                  className="text-[16px] font-semibold text-accent hover:text-accent"
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tool && <ToolPill label={tool.label} url={tool.url} />}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            url: postUrl,
            datePublished: post.date,
            author: { "@type": "Person", name: post.author },
            publisher: { "@type": "Organization", name: "ByteTips", url: siteUrl },
          }),
        }}
      />
      {faqPairs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqPairs.map((pair) => ({
                "@type": "Question",
                name: pair.question,
                acceptedAnswer: { "@type": "Answer", text: pair.answer },
              })),
            }),
          }}
        />
      )}
    </main>
  );
}
