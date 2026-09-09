"use client";

import { Check, Copy, Download } from "lucide-react";
import { useState } from "react";
import { AppleIcon, LinuxIcon, WindowsIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";

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
    if (await copyText(command)) {
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } else {
      setCopiedId(null);
    }
  };

  return (
    <div className="space-y-2">
      {PLATFORMS.map((platform) => {
        const Icon = platform.icon;
        const copied = copiedId === platform.id;

        return (
          <div key={platform.id} className="grid gap-2 rounded-xl border border-border bg-card/75 p-2 sm:grid-cols-[12.75rem_minmax(0,1fr)] sm:items-center">
            <Button asChild variant="outline" className="h-11 w-full justify-start rounded-lg border-border bg-background/75 px-3.5 text-foreground shadow-none hover:bg-secondary">
              <a href={platform.download} target="_blank" rel="noreferrer noopener">
                <span className="inline-flex items-center gap-2"><Icon className="size-4" />Download {platform.label}</span>
                <Download className="ml-auto size-4 text-primary" />
              </a>
            </Button>

            <div className="flex min-h-11 min-w-0 items-start gap-2.5 rounded-lg border border-border bg-background/75 px-3.5 py-2.5 font-mono text-[11px] sm:text-xs">
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
