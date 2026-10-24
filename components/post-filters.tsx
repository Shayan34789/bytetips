"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/posts";

export type PostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readingTime: string;
  author: string;
  category: string;
};

const PAGE_SIZE = 12;

function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function PostFilters({ posts }: { posts: PostSummary[] }) {
  const [category, setCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const [featured, ...rest] = posts;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rest.filter((post) => {
      if (category !== "All" && post.category !== category) return false;
      if (q && !`${post.title} ${post.excerpt}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rest, category, query]);

  const shown = filtered.slice(0, visible);

  return (
    <>
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
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisible(PAGE_SIZE);
          }}
          placeholder="Search guides..."
          aria-label="Search guides"
          className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-[15px] text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {["All", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setCategory(cat);
                setVisible(PAGE_SIZE);
              }}
              aria-pressed={category === cat}
              className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                category === cat
                  ? "border-accent bg-accent text-white"
                  : "border-line bg-white text-muted hover:border-accent hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {shown.length === 0 ? (
          <p className="border-t border-line py-10 text-[15px] text-muted">
            No guides match that search yet — try a different keyword or category.
          </p>
        ) : (
          shown.map((post) => (
            <article
              key={post.slug}
              className="border-b border-line py-7 first:pt-0 last:border-b-0"
            >
              <h2 className="text-xl font-bold leading-snug tracking-tight text-ink">
                <Link href={`/posts/${post.slug}`} className="transition-colors hover:text-accent">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{post.excerpt}</p>
              <p className="mt-3 text-[13px] text-muted">
                {formatDate(post.date)} · {post.readingTime} · {post.author} · {post.category}
              </p>
            </article>
          ))
        )}
      </div>

      {visible < filtered.length && (
        <button
          type="button"
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="mt-8 w-full rounded-lg border border-line bg-white px-4 py-3 text-[15px] font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
        >
          Load more guides ({filtered.length - visible} remaining)
        </button>
      )}
    </>
  );
}
