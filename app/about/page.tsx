import type { Metadata } from "next";
import Link from "next/link";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "About ByteTips — short, practical how-to guides for developers.",
  alternates: { canonical: `${siteUrl}/about` },
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-ink">About</h1>
      <figure className="mt-6">
        {/* Plain img: next/image optimization is incompatible with static export. */}
        <img
          src="/about-workspace.jpg"
          alt="Minimal developer workspace with a laptop and headphones"
          width={1200}
          height={627}
          className="w-full rounded-xl border border-line"
          loading="lazy"
        />
        <figcaption className="mt-2 text-xs text-muted">
          Photo: Pexels
        </figcaption>
      </figure>
      <p className="mt-5 text-[16px] leading-relaxed text-slate-700">
        ByteTips is a small blog of short, practical how-to guides for developers — JSON, JWT,
        images, CSS, and everyday privacy. Each post gives you the answer, a code example, and a
        link to a free tool that does the job in your browser.
      </p>
      <p className="mt-5 text-[16px] leading-relaxed text-slate-700">
        The tools live on{" "}
        <Link
          href="https://byte-kit.dev"
          className="font-medium text-accent underline decoration-accent-mid underline-offset-2 hover:text-accent"
        >
          Byte-Kit
        </Link>
        , a collection of 24 free developer utilities that run entirely in your browser — nothing
        you paste ever leaves your device.
      </p>
      <p className="mt-5 text-[16px] leading-relaxed text-slate-700">
        Written by Shayan. Questions or corrections? Reach me on the{" "}
        <Link
          href="/contact"
          className="font-medium text-accent underline decoration-accent-mid underline-offset-2 hover:text-accent"
        >
          Contact page
        </Link>
        .
      </p>
    </main>
  );
}
