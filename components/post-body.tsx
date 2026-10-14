import React from "react";
import type { Block } from "@/lib/posts";

// Renders [label](url) inline links inside plain text blocks.
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(/\[([^\]]+)\]\(([^)]+)\)/g);
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i]) nodes.push(<React.Fragment key={`${keyPrefix}-t${i}`}>{parts[i]}</React.Fragment>);
    if (parts[i + 1] && parts[i + 2]) {
      const href = parts[i + 2];
      nodes.push(
        <a
          key={`${keyPrefix}-l${i}`}
          href={href}
          className="font-medium text-accent underline decoration-accent-mid underline-offset-2 hover:text-accent"
        >
          {parts[i + 1]}
        </a>,
      );
    }
  }
  return nodes;
}

export function PostBody({ blocks }: { blocks: Block[] }) {
  return (
    <div>
      {blocks.map((block, index) => {
        if (block.type === "h2") {
          return (
            <h2 key={index} className="mt-10 text-2xl font-bold leading-snug tracking-tight text-ink">
              {block.text}
            </h2>
          );
        }
        if (block.type === "p") {
          return (
            <p key={index} className="mt-5 text-[16px] leading-relaxed text-slate-700">
              {renderInline(block.text, `p${index}`)}
            </p>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={index} className="mt-5 list-disc space-y-2 pl-6 text-[16px] leading-relaxed text-slate-700">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item, `li${index}-${itemIndex}`)}</li>
              ))}
            </ul>
          );
        }
        return (
          <pre
            key={index}
            className="mt-5 overflow-x-auto rounded-lg border border-slate-800 bg-slate-900 p-4 text-[13.5px] leading-relaxed text-slate-100"
          >
            <code className="font-mono">{block.code}</code>
          </pre>
        );
      })}
    </div>
  );
}
