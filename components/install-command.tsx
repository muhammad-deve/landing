"use client";

import { useState } from "react";
import { Copy, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppleIcon, WindowsIcon, LinuxIcon } from "@/components/icons";

type Platform = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  command: string;
  prompt: string;
};

const PLATFORMS: Platform[] = [
  { id: "macos", label: "macOS", icon: AppleIcon, prompt: "$", command: "brew tap muhammad-deve/goport && brew install goport" },
  { id: "windows", label: "Windows", icon: WindowsIcon, prompt: ">", command: "scoop bucket add goport https://github.com/muhammad-deve/scoop-goport && scoop install goport" },
  {
    id: "linux",
    label: "Linux",
    icon: LinuxIcon,
    prompt: "$",
    command: "curl -fsSL https://github.com/muhammad-deve/GoPort/releases/latest/download/goport-linux-amd64 -o /usr/local/bin/goport && chmod +x /usr/local/bin/goport",
  },
  {
    id: "ai",
    label: "Ask an AI assistant",
    icon: Sparkles,
    prompt: "✦",
    command: "How to install goport cli from goport.uz (https://github.com/muhammad-deve/GoPort) and help me get authenticated so I can get my service online.",
  },
];

export function InstallCommand() {
  const [active, setActive] = useState(1); // default to Windows (choco)
  const [copied, setCopied] = useState(false);

  const platform = PLATFORMS[active];
  const isAi = platform.id === "ai";

  const copy = async () => {
    const text = platform.command;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopy(text);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can fail in non-secure contexts — fall back to execCommand.
      if (fallbackCopy(text)) {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }
    }
  };

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-5">
      {/* Platform selector */}
      <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/40 p-1.5 backdrop-blur">
        {PLATFORMS.map((p, i) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={p.label}
              aria-pressed={i === active}
              title={p.label}
              className={cn(
                "group relative flex size-11 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 active:scale-95",
                i === active
                  ? "border-primary/50 bg-primary/20 text-primary shadow-[0_0_22px_-4px] shadow-primary/50"
                  : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-white/5 hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
            </button>
          );
        })}
      </div>

      {/* Command box */}
      <div className="group flex w-full items-center gap-3 rounded-xl border border-border/70 bg-[#0a0a0a]/90 px-5 py-4 font-mono text-sm shadow-2xl shadow-black/40 transition-colors hover:border-primary/40">
        <span className={cn("select-none", isAi ? "text-primary" : "text-primary/90")}>
          {platform.prompt}
        </span>
        <code
          className={cn(
            "flex-1 text-left",
            isAi ? "whitespace-normal text-foreground/80 italic" : "truncate text-foreground/90",
          )}
        >
          {isAi ? platform.command : renderCommand(platform.command)}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label={isAi ? "Copy prompt" : "Copy command"}
          title={copied ? "Copied!" : "Copy to clipboard"}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center self-start rounded-md text-muted-foreground transition-colors duration-200 hover:bg-white/10 hover:text-foreground"
        >
          <span
            key={copied ? "check" : "copy"}
            className="flex items-center justify-center animate-in fade-in zoom-in-50 duration-150"
          >
            {copied ? (
              <Check className="size-4 text-primary" />
            ) : (
              <Copy className="size-4" />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}

/** Copies text without the async Clipboard API (works in non-secure contexts). */
function fallbackCopy(text: string): boolean {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/** Lightweight syntax coloring for the install command. */
function renderCommand(command: string) {
  const parts = command.split(" ");
  return parts.map((word, i) => {
    let className = "text-foreground/90";
    if (i === 0) className = "text-primary";
    else if (["install", "run", "tap", "bucket", "add"].includes(word)) className = "text-sky-400";
    else if (["goport", "goport/goport"].includes(word)) className = "text-fuchsia-400";
    return (
      <span key={`${word}-${i}`} className={className}>
        {word}
        {i < parts.length - 1 ? " " : ""}
      </span>
    );
  });
}
