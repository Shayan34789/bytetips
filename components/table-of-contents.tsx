"use client";

import { useEffect, useState } from "react";

export type TocHeading = { id: string; text: string };

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [active, setActive] = useState<string>(headings[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="Table of contents" className="mb-10 rounded-2xl border border-line bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
        In this guide
      </p>
      <ul className="mt-3 space-y-2">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`text-[14px] leading-snug transition-colors hover:text-accent ${
                active === h.id ? "font-semibold text-accent" : "text-muted"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
