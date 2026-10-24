import React from "react";
import type { Block } from "@/lib/posts";
import { slugifyHeading } from "@/lib/posts";
import { CodeBlock } from "@/components/code-block";

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
  const seen = new Map<string, number>();
  function headingId(text: string): string {
    const base = slugifyHeading(text);
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n > 1 ? `${base}-${n}` : base;
  }
  return (
    <div>
      {blocks.map((block, index) => {
        if (block.type === "h2") {
          return (
            <h2
              key={index}
              id={headingId(block.text)}
              className="mt-10 scroll-mt-20 text-2xl font-bold leading-snug tracking-tight text-ink [overflow-wrap:anywhere]"
            >
              {block.text}
            </h2>
          );
        }
        if (block.type === "p") {
          return (
            <p key={index} className="mt-5 text-[16px] leading-relaxed text-slate-700 [overflow-wrap:anywhere]">
              {renderInline(block.text, `p${index}`)}
            </p>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={index} className="mt-5 list-disc space-y-2 pl-6 text-[16px] leading-relaxed text-slate-700 [overflow-wrap:anywhere]">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item, `li${index}-${itemIndex}`)}</li>
              ))}
            </ul>
          );
        }
        return <CodeBlock key={index} code={block.code} />;
      })}
    </div>
  );
}
