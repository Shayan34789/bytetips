import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostBody } from "@/components/post-body";
import { getPost, posts } from "@/lib/posts";
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

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const postUrl = `${siteUrl}/posts/${post.slug}`;
  const related = posts.filter((candidate) => candidate.slug !== post.slug).slice(0, 3);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-[13px] text-muted">
        <Link href="/" className="transition-colors hover:text-ink">
          Guides
        </Link>
        <span>/</span>
        <span className="text-ink">{post.title}</span>
      </nav>

      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Guide</p>
      <h1 className="mt-3 text-4xl font-bold leading-[1.12] tracking-tight text-ink sm:text-5xl">
        {post.title}
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-muted">{post.excerpt}</p>
      <p className="mt-6 border-y border-line py-3 text-[13px] text-muted">
        {formatDate(post.date)} · {post.readingTime} · {post.author}
      </p>

      <article className="mt-10">
        <PostBody blocks={post.content} />
      </article>

      <section className="mt-14 border-t border-line pt-8">
        <h2 className="text-2xl font-bold tracking-tight text-ink">More guides</h2>
        <ul className="mt-4 space-y-3">
          {related.map((item) => (
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
    </main>
  );
}
