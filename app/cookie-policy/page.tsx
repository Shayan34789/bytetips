import type { Metadata } from "next";
import Link from "next/link";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "ByteTips cookie policy — what cookies this site uses and how to control them.",
  alternates: { canonical: `${siteUrl}/cookie-policy` },
};

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-ink">Cookie Policy</h1>
      <p className="mt-5 text-[16px] leading-relaxed text-slate-700">
        This page explains what cookies ByteTips uses and how you can control them. For the
        broader picture of what data is involved, see our{" "}
        <Link
          href="/privacy"
          className="font-medium text-accent underline decoration-accent-mid underline-offset-2 hover:text-accent"
        >
          Privacy Policy
        </Link>
        .
      </p>

      <h2 className="mt-8 text-xl font-bold tracking-tight text-ink">What cookies are</h2>
      <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
        Cookies are small text files stored on your device by your browser. They help sites
        remember preferences, measure traffic, and show relevant advertising.
      </p>

      <h2 className="mt-8 text-xl font-bold tracking-tight text-ink">Cookies this site uses</h2>
      <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
        <strong>Strictly necessary cookies.</strong> The cookie-consent banner stores your choice
        (accepted or dismissed) in your browser so we do not keep asking you.
      </p>
      <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
        <strong>Analytics cookies.</strong> We may use analytics (for example, Google Analytics)
        to understand which guides are read. These cookies measure aggregate visits and do not
        identify you personally.
      </p>
      <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
        <strong>Advertising cookies.</strong> This site may show ads served by Google AdSense.
        Google, as a third-party vendor, uses cookies — including the DART cookie — to serve ads
        based on your visits to this and other sites. You can opt out of personalized advertising
        by visiting{" "}
        <a
          href="https://adssettings.google.com"
          className="font-medium text-accent underline decoration-accent-mid underline-offset-2 hover:text-accent"
        >
          Google Ads Settings
        </a>
        .
      </p>

      <h2 className="mt-8 text-xl font-bold tracking-tight text-ink">How to control cookies</h2>
      <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
        You can block or delete cookies in your browser settings. You can also opt out of
        interest-based advertising across many networks at{" "}
        <a
          href="https://optout.aboutads.info"
          className="font-medium text-accent underline decoration-accent-mid underline-offset-2 hover:text-accent"
        >
          optout.aboutads.info
        </a>
        . Blocking cookies may affect how some parts of the site behave.
      </p>
      <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
        Last updated: October 2026.
      </p>
    </main>
  );
}
