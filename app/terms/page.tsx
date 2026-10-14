import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: "ByteTips terms of service.",
  alternates: { canonical: `${siteUrl}/terms` },
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-ink">Terms of Service</h1>
      <p className="mt-5 text-[16px] leading-relaxed text-slate-700">
        By using ByteTips (bytetips.tech), you agree to these terms. If you do not agree, please
        do not use the site.
      </p>

      <h2 className="mt-8 text-xl font-bold tracking-tight text-ink">Content</h2>
      <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
        All guides on this site are written by ByteTips and are provided for educational purposes.
        Code examples are provided as-is, without warranty of any kind. You are free to use the
        code in your own projects, but you do so at your own risk — always test before using it
        in production.
      </p>

      <h2 className="mt-8 text-xl font-bold tracking-tight text-ink">Third-party links</h2>
      <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
        Guides link to third-party sites, including Byte-Kit (byte-kit.dev) and external
        documentation. We are not responsible for the content, privacy practices, or availability
        of those sites.
      </p>

      <h2 className="mt-8 text-xl font-bold tracking-tight text-ink">No warranties</h2>
      <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
        This site is provided &quot;as is&quot; without warranties of any kind, express or
        implied, including accuracy, completeness, or fitness for a particular purpose.
      </p>

      <h2 className="mt-8 text-xl font-bold tracking-tight text-ink">Changes</h2>
      <p className="mt-3 text-[16px] leading-relaxed text-slate-700">
        We may update these terms at any time. Continued use of the site after changes means you
        accept the updated terms. Last updated: October 2026.
      </p>
    </main>
  );
}
