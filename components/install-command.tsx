"use client";

import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";
import { AppleIcon, LinuxIcon, WindowsIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

const GITHUB_URL = "https://github.com/muhammad-deve/GoPort";

const PLATFORMS = [
  {
    id: "macos",
    label: "macOS",
    icon: AppleIcon,
    prompt: "$",
    command: "brew tap muhammad-deve/goport && brew install goport",
    download: `${GITHUB_URL}#installation`,
  },
  {
    id: "windows",
    label: "Windows",
    icon: WindowsIcon,
    prompt: ">",
    command: "choco install goport",
    download: "https://community.chocolatey.org/packages/goport",
  },
  {
    id: "linux",
    label: "Linux",
    icon: LinuxIcon,
    prompt: "$",
    command: "curl -fsSL https://github.com/muhammad-deve/GoPort/releases/latest/download/goport-linux-amd64 -o /usr/local/bin/goport && chmod +x /usr/local/bin/goport",
    download: `${GITHUB_URL}/releases/latest/download/goport-linux-amd64`,
  },
];

export function InstallCommand() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = async (id: string, command: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <div className="space-y-3">
      {PLATFORMS.map((platform) => {
        const Icon = platform.icon;
        const copied = copiedId === platform.id;

        return (
          <div key={platform.id} className="grid grid-cols-[auto_minmax(0,1fr)] items-stretch gap-3 rounded-2xl border border-border bg-card/75 p-3">
            <Button asChild variant="outline" className="h-auto min-h-12 w-[13.5rem] justify-start rounded-xl border-border bg-background/75 px-4 text-foreground shadow-none hover:bg-secondary">
              <a href={platform.download} target="_blank" rel="noreferrer noopener">
                <span className="inline-flex items-center gap-2"><Icon className="size-4" />Download {platform.label}</span>
                <Download className="size-4 text-primary" />
              </a>
            </Button>

            <div className="flex min-h-12 min-w-0 items-start gap-3 rounded-xl border border-border bg-background/75 px-4 py-3 font-mono text-xs">
              <span className="select-none text-primary">{platform.prompt}</span>
              <code className="min-w-0 flex-1 break-all leading-5 text-foreground">{platform.command}</code>
              <button
                type="button"
                onClick={() => copy(platform.id, platform.command)}
                aria-label={`Copy ${platform.label} installation command`}
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
