"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { AppleIcon, LinuxIcon, WindowsIcon } from "@/components/icons";

const PLATFORMS = [
  { id: "macos", label: "macOS", icon: AppleIcon, prompt: "$", command: "brew tap muhammad-deve/goport && brew install goport" },
  { id: "windows", label: "Windows", icon: WindowsIcon, prompt: ">", command: "choco install goport" },
  { id: "linux", label: "Linux", icon: LinuxIcon, prompt: "$", command: "curl -fsSL https://github.com/muhammad-deve/GoPort/releases/latest/download/goport-linux-amd64 -o /usr/local/bin/goport && chmod +x /usr/local/bin/goport" },
];

export function InstallCommand() {
  const [activeId, setActiveId] = useState("macos");
  const [copied, setCopied] = useState(false);
  const platform = PLATFORMS.find((item) => item.id === activeId) ?? PLATFORMS[0];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(platform.command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex w-fit items-center gap-1 rounded-full border border-border bg-secondary/70 p-1">
        {PLATFORMS.map((item) => {
          const Icon = item.icon;
          const active = item.id === platform.id;
          return (
            <button key={item.id} type="button" onClick={() => setActiveId(item.id)} aria-pressed={active} className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <Icon className="size-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex min-h-24 items-start gap-3 rounded-2xl border border-border bg-card/90 p-5 font-mono text-sm shadow-sm">
        <span className="select-none text-primary">{platform.prompt}</span>
        <code className="min-w-0 flex-1 whitespace-pre-wrap break-all leading-6 text-foreground">{platform.command}</code>
        <button type="button" onClick={copy} aria-label="Copy installation command" className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
        </button>
      </div>
    </div>
  );
}
