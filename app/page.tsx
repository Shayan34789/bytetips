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

      <section className="mt-14 border-t border-line pt-10">
        <h2 className="text-2xl font-bold leading-tight tracking-tight text-ink">
          What is ByteTips?
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          ByteTips is a blog of short, practical how-to guides for developers. Each guide answers
          one real question — how to format JSON in JavaScript, how to decode a JWT safely, how to
          convert HEIC photos to JPG — and gives you the answer up front, a code example you can
          copy, and a free tool that does the job in your browser. No long intros, no filler, no
          sign-up. The guides are written for working developers who need a real answer fast,
          whether you are debugging a broken fetch call at midnight or learning a new API for the
          first time.
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Every post links to a free tool on Byte-Kit that runs entirely in your browser, so
          nothing you paste ever leaves your device. That privacy-first approach is the whole
          point: your tokens, your photos, and your data stay on your machine. ByteTips covers
          the everyday tasks developers actually search for — JSON, encoding, images, CSS units,
          regex, and more — with practical steps you can follow in minutes. A new practical guide
          lands here every week, each one short enough to read in five minutes and complete
          enough to solve the problem the same day.
        </p>
        <h2 className="mt-10 text-2xl font-bold leading-tight tracking-tight text-ink">
          How to use these guides
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-muted">
          Start with the guide that matches your problem. Read the short answer at the top, copy
          the code example, and try the linked tool to see the result on your own input. If the
          guide mentions a second tool, that is the natural next step — for example, the JSON
          formatter pairs with the JSON guide, and the URL encoder pairs with the encoding guide.
          Each guide takes about five minutes to read, and the tools are free to use without an
          account. If a guide helped you, bookmark ByteTips and come back the next time a real
          question pops up.
        </p>
      </section>
    </main>
  );
}
