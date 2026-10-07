"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LegalTocProps {
  items: { id: string; title: string }[];
}

export function LegalToc({ items }: LegalTocProps) {
  const [activeId, setActiveId] = useState(items[0]?.id);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section !== null);

    // A section becomes active when it crosses a band just below the fixed nav,
    // so the highlight follows the heading being read rather than the last
    // section to peek in at the bottom of the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-96px 0px -60% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return (
    <ol className="border-l border-border">
      {items.map((item, index) => {
        const active = item.id === activeId;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active ? "location" : undefined}
              className={cn(
                "-ml-px flex gap-3 border-l py-1 pl-4 text-[13px] leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground",
              )}
            >
              <span className="w-4 shrink-0 font-mono text-[11px] leading-5 tabular-nums text-muted-foreground/70">
                {index + 1}
              </span>
              {item.title}
            </a>
          </li>
        );
      })}
    </ol>
  );
}
