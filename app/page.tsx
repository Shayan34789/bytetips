import Link from "next/link";
import { posts } from "@/lib/posts";

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function HomePage() {
  const [featured, ...rest] = posts;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        Practical guides for developers
      </p>
      <h1 className="mt-3 text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl">
        Short guides. Real answers.
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
        No fluff — just the answer, a code example, and a free tool that does the job in your
        browser.
      </p>

      {featured && (
        <article className="mt-12 rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Latest guide
          </p>
          <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl">
            <Link href={`/posts/${featured.slug}`} className="transition-colors hover:text-accent">
              {featured.title}
            </Link>
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{featured.excerpt}</p>
          <p className="mt-4 text-[13px] text-muted">
            {formatDate(featured.date)} · {featured.readingTime} · {featured.author}
          </p>
          <Link
            href={`/posts/${featured.slug}`}
            className="mt-5 inline-block text-sm font-semibold text-accent hover:text-accent"
          >
            Read guide →
          </Link>
        </article>
      )}

      <div className="mt-10">
        {rest.map((post) => (
          <article key={post.slug} className="border-b border-line py-7 first:pt-0 last:border-b-0">
            <h2 className="text-xl font-bold leading-snug tracking-tight text-ink">
              <Link href={`/posts/${post.slug}`} className="transition-colors hover:text-accent">
                {post.title}
              </Link>
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted">{post.excerpt}</p>
            <p className="mt-3 text-[13px] text-muted">
              {formatDate(post.date)} · {post.readingTime} · {post.author}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
