import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import { CookieBanner } from "@/components/cookie-banner";
import Logo from "@/components/logo";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "ByteTips — Practical Developer How-To Guides",
    template: "%s · ByteTips",
  },
  description:
    "Short, practical how-to guides for developers: JSON, JWT, images, CSS, and privacy. Every post points at a free tool that does the job in your browser.",
  applicationName: "ByteTips",
  metadataBase: new URL(siteUrl),
  keywords: [
    "developer tutorials",
    "how to format JSON",
    "JWT decoder",
    "HEIC converter",
    "PX to REM",
    "EXIF remover",
    "developer how-to guides",
  ],
  authors: [{ name: "Shayan" }],
  creator: "Shayan",
  publisher: "ByteTips",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    siteName: "ByteTips",
    title: "ByteTips — Practical Developer How-To Guides",
    description:
      "Short, practical how-to guides for developers: JSON, JWT, images, CSS, and privacy.",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "ByteTips — Practical developer how-to guides",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ByteTips — Practical Developer How-To Guides",
    description:
      "Short, practical how-to guides for developers: JSON, JWT, images, CSS, and privacy.",
    images: [`${siteUrl}/og-image.png`],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-[100dvh] bg-canvas font-sans text-ink antialiased`}>
        <header className="border-b border-line bg-canvas">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
            <Link href="/" aria-label="ByteTips home">
              <Logo />
            </Link>
            <nav className="flex items-center gap-5 text-sm font-medium text-muted">
              <Link href="/" className="transition-colors hover:text-ink">
                Guides
              </Link>
              <a
                href="https://byte-kit.dev"
                className="transition-colors hover:text-ink"
              >
                Tools
              </a>
              <Link href="/about" className="transition-colors hover:text-ink">
                About
              </Link>
            </nav>
          </div>
        </header>
        {children}
        <CookieBanner />
        <footer className="border-t border-line bg-canvas">
          <div className="mx-auto flex max-w-3xl flex-col gap-3 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex">
              <Logo size={22} />
            </span>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <a href="https://byte-kit.dev" className="transition-colors hover:text-ink">
                Free tools
              </a>
              <Link href="/about" className="transition-colors hover:text-ink">
                About
              </Link>
              <Link href="/contact" className="transition-colors hover:text-ink">
                Contact
              </Link>
              <Link href="/privacy" className="transition-colors hover:text-ink">
                Privacy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-ink">
                Terms
              </Link>
              <Link href="/cookie-policy" className="transition-colors hover:text-ink">
                Cookies
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
