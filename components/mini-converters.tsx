"use client";

import { useState } from "react";

function Shell({ title, children, toolUrl, toolLabel }: {
  title: string;
  children: React.ReactNode;
  toolUrl: string;
  toolLabel: string;
}) {
  return (
    <section className="mb-10 rounded-2xl border border-line bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Try it now</p>
      <h2 className="mt-2 text-lg font-bold tracking-tight text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
      <a href={toolUrl} className="mt-4 inline-block text-sm font-semibold text-accent hover:text-accent">
        Open full {toolLabel} on Byte-Kit →
      </a>
    </section>
  );
}

export function PxRemMini() {
  const [px, setPx] = useState("16");
  const [base, setBase] = useState("16");
  const pxNum = Number(px);
  const baseNum = Number(base) || 16;
  const rem = Number.isFinite(pxNum) ? (pxNum / baseNum).toFixed(4).replace(/\.?0+$/, "") : "";
  return (
    <Shell title="PX ↔ REM converter" toolUrl="https://byte-kit.dev/tools/px-to-rem" toolLabel="PX to REM Converter">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-muted">
          Pixels
          <input
            type="number"
            value={px}
            onChange={(e) => setPx(e.target.value)}
            className="ml-2 w-24 rounded-md border border-line bg-white px-2.5 py-1.5 text-[15px] text-ink focus:border-accent focus:outline-none"
          />
        </label>
        <label className="text-sm text-muted">
          Root size (px)
          <input
            type="number"
            value={base}
            onChange={(e) => setBase(e.target.value)}
            className="ml-2 w-20 rounded-md border border-line bg-white px-2.5 py-1.5 text-[15px] text-ink focus:border-accent focus:outline-none"
          />
        </label>
        <p className="text-[15px] font-semibold text-ink">
          = {rem === "" ? "—" : `${rem}rem`}
        </p>
      </div>
    </Shell>
  );
}

export function HexRgbMini() {
  const [hex, setHex] = useState("#FF5733");
  const clean = hex.replace("#", "").trim();
  const expanded = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const valid = /^[0-9a-fA-F]{6}$/.test(expanded);
  const r = valid ? parseInt(expanded.slice(0, 2), 16) : null;
  const g = valid ? parseInt(expanded.slice(2, 4), 16) : null;
  const b = valid ? parseInt(expanded.slice(4, 6), 16) : null;
  return (
    <Shell title="HEX ↔ RGB converter" toolUrl="https://byte-kit.dev/tools/color-converter" toolLabel="Color Converter">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-muted">
          Hex
          <input
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="ml-2 w-28 rounded-md border border-line bg-white px-2.5 py-1.5 font-mono text-[15px] text-ink focus:border-accent focus:outline-none"
          />
        </label>
        <span
          className="inline-block h-8 w-8 rounded-md border border-line"
          style={{ backgroundColor: valid ? `#${expanded}` : "transparent" }}
          aria-hidden="true"
        />
        <p className="text-[15px] font-semibold text-ink">
          {valid ? `rgb(${r}, ${g}, ${b})` : "Enter a valid hex color"}
        </p>
      </div>
    </Shell>
  );
}
