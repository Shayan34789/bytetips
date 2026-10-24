"use client";

import { useState } from "react";

export function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="group relative mt-5">
      <pre className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-900 p-4 text-[13.5px] leading-relaxed text-slate-100">
        <code className="font-mono">{code}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="absolute right-2 top-2 rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 opacity-0 transition-opacity hover:bg-slate-700 focus:opacity-100 group-hover:opacity-100"
      >
        {copied ? "✓ Copied!" : "Copy"}
      </button>
    </div>
  );
}
