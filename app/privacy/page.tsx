import type { Metadata } from "next";
import Link from "next/link";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: "ByteTips privacy policy — what data this blog collects, and how advertising cookies work.",
  alternates: { canonical: `${siteUrl}/privacy` },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-ink">Privacy Policy</h1>
      <p className="mt-5 text-[16px] leading-relaxed text-slate-700">
        ByteTips is a static blog. We do not run accounts, and we do not ask you for personal
        information to read the guides. This page explains the limited data involved when you
        visit.
      </p>

      <h2 className="mt-8 text-xl font-bold tracking-tight text-ink">What we collect</h2>
      <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
        The blog itself collects no personal data from readers. If you email us from the{" "}
        <Link
          href="/contact"
          className="font-medium text-accent underline decoration-accent-mid underline-offset-2 hover:text-accent"
        >
          Contact page
        </Link>
        , we receive whatever you choose to send, and we use it only to reply.
      </p>

      <h2 className="mt-8 text-xl font-bold tracking-tight text-ink">Cookies and analytics</h2>
      <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
        The cookie-consent banner stores your choice in your browser. We may use analytics (for
        example, Google Analytics) to understand which guides are read. See our{" "}
        <Link
          href="/cookie-policy"
          className="font-medium text-accent underline decoration-accent-mid underline-offset-2 hover:text-accent"
        >
          Cookie Policy
        </Link>{" "}
        for details.
      </p>

      <h2 className="mt-8 text-xl font-bold tracking-tight text-ink">
        Advertising (Google AdSense)
      </h2>
      <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
        This site may display ads served by Google AdSense. Google, as a third-party vendor,
        uses cookies — including the DART cookie — to serve ads based on your visit to this site
        and other sites on the internet. You may opt out of personalized advertising by visiting{" "}
        <a
          href="https://adssettings.google.com"
          className="font-medium text-accent underline decoration-accent-mid underline-offset-2 hover:text-accent"
        >
          Google Ads Settings
        </a>
        .
      </p>

      <h2 className="mt-8 text-xl font-bold tracking-tight text-ink">Links to other sites</h2>
      <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
        Guides link to third-party sites, including Byte-Kit (byte-kit.dev). Those sites have
        their own privacy policies, and this policy does not cover them.
      </p>

      <h2 className="mt-8 text-xl font-bold tracking-tight text-ink">Changes</h2>
      <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
        We may update this policy as the site changes. Last updated: October 2026.
      </p>
    </main>
  );
}
