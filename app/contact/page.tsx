import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact ByteTips — questions, corrections, or suggestions.",
  alternates: { canonical: `${siteUrl}/contact` },
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-ink">Contact</h1>
      <p className="mt-5 text-[16px] leading-relaxed text-slate-700">
        Questions about a guide, a correction, or a topic you want covered? Email me:
      </p>
      <p className="mt-5 text-[16px] leading-relaxed text-slate-700">
        <a
          href="mailto:shayan34890@gmail.com"
          className="font-medium text-accent underline decoration-accent-mid underline-offset-2 hover:text-accent"
        >
          shayan34890@gmail.com
        </a>
      </p>
      <p className="mt-5 text-[16px] leading-relaxed text-slate-700">
        I read every message and aim to reply within a few days. For issues with the tools
        linked from the guides, mention which tool and what you pasted (never send secrets,
        tokens, or passwords).
      </p>
    </main>
  );
}
