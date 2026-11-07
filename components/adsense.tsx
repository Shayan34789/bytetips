import Script from "next/script";

const publisherId = "ca-pub-2166178232991943";

export function AdSense() {
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
      strategy="beforeInteractive"
    />
  );
}
