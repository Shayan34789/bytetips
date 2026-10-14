"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "bytetips-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Intentional: read localStorage after mount to avoid a hydration mismatch.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(!window.localStorage.getItem(CONSENT_KEY));
    } catch {
      setVisible(false);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      window.localStorage.setItem(CONSENT_KEY, "accepted");
    } catch {
      // Storage unavailable — just hide the banner for this visit.
    }
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 shadow-[0_-4px_24px_rgba(15,23,42,0.08)] backdrop-blur"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-slate-700">
          We use cookies for analytics and advertising (including Google AdSense). See our{" "}
          <Link
            href="/cookie-policy"
            className="font-medium text-accent underline decoration-accent-mid underline-offset-2 hover:text-accent"
          >
            Cookie Policy
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
