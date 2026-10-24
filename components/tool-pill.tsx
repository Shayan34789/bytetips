"use client";

import { useState } from "react";

export function ToolPill({ label, url }: { label: string; url: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[60] hidden items-center gap-2 rounded-full border border-line bg-white py-2 pl-4 pr-2 shadow-lg md:flex">
      <a href={url} className="text-sm font-semibold text-accent hover:text-accent">
        Open {label} →
      </a>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="rounded-full px-2 py-0.5 text-sm text-muted hover:bg-surface hover:text-ink"
      >
        ×
      </button>
    </div>
  );
}
