"use client";

import { Check, Copy, Terminal } from "lucide-react";
import { useState } from "react";
import { copyText } from "@/lib/clipboard";

interface TerminalCommandProps {
  command: string;
}

export function TerminalCommand({ command }: TerminalCommandProps) {
  const [copied, setCopied] = useState(false);
  const lines = command.split("\n");

  const copyCommand = async () => {
    if (await copyText(command)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } else {
      setCopied(false);
    }
  };

  return (
    <div className="mt-6">
      <p className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Terminal className="size-3.5" />
        Run this in your terminal
      </p>
      <div className="flex items-start gap-3 rounded-xl border border-border bg-background/75 px-4 py-3 font-mono text-xs">
        <span className="mt-px select-none text-primary" aria-hidden>
          {lines.map((_, index) => (
            <span key={index} className="block leading-5">
              $
            </span>
          ))}
        </span>
        <code className="min-w-0 flex-1 overflow-x-auto text-primary">
          {lines.map((line, index) => (
            <span key={index} className="block whitespace-nowrap leading-5">
              {line}
            </span>
          ))}
        </code>
        <button
          type="button"
          onClick={copyCommand}
          aria-label="Copy command"
          title={copied ? "Copied" : "Copy command"}
          className="flex size-7 shrink-0 items-center justify-center self-start rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
        </button>
      </div>
    </div>
  );
}
