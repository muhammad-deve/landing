"use client";

import { Check, Copy, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { AppleIcon, LinuxIcon, WindowsIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
] as const;

type PlatformId = (typeof PLATFORMS)[number]["id"];

function detectPlatform(): PlatformId | null {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes("windows")) return "windows";
  if (userAgent.includes("macintosh") || userAgent.includes("mac os x")) return "macos";
  if (userAgent.includes("linux")) return "linux";
  return null;
}

export function InstallCommand() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [platformId, setPlatformId] = useState<PlatformId>("macos");

  useEffect(() => {
    const detected = detectPlatform();
    if (detected) setPlatformId(detected);
  }, []);

  const copy = async (id: string, command: string) => {
    if (await copyText(command)) {
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } else {
      setCopiedId(null);
    }
  };

  return (
    <Tabs
      value={platformId}
      onValueChange={(value) => setPlatformId(value as PlatformId)}
      className="gap-0 overflow-hidden rounded-2xl border border-border bg-white/85 shadow-[0_18px_45px_-32px_rgba(5,15,17,0.28)] dark:border-[#29423f] dark:bg-[#102124] dark:shadow-[0_18px_45px_-32px_rgba(5,15,17,0.9)]"
    >
      <div className="flex items-center gap-3 border-b border-border bg-secondary/20 p-3 sm:px-4 dark:border-white/10 dark:bg-transparent">
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-xl bg-secondary/80 p-1 sm:w-fit dark:bg-black/25">
          {PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            return (
              <TabsTrigger
                key={platform.id}
                value={platform.id}
                className="h-9 min-w-0 cursor-pointer rounded-lg border-0 px-3 text-muted-foreground shadow-none transition-[color,background-color,transform] duration-150 hover:bg-background/70 hover:text-foreground active:scale-[0.97] data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm dark:text-white/55 dark:hover:bg-white/[0.06] dark:hover:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-[#102124] dark:data-[state=active]:shadow-none"
              >
                <Icon className="size-4" />
                <span className="truncate">{platform.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        <span className="ml-auto hidden shrink-0 font-mono text-[11px] text-muted-foreground/70 sm:block dark:text-white/35">GoPort CLI</span>
      </div>

      {PLATFORMS.map((platform) => {
        const Icon = platform.icon;
        const copied = copiedId === platform.id;

        return (
          <TabsContent key={platform.id} value={platform.id} className="mt-0">
            <div className="grid gap-3 p-3 sm:grid-cols-[13.5rem_minmax(0,1fr)] sm:items-center sm:p-4">
              <Button asChild variant="outline" className="h-12 w-full justify-start rounded-xl border-border bg-background px-4 text-foreground shadow-none transition-[background-color,transform] hover:bg-secondary hover:text-foreground active:scale-[0.98] dark:border-white dark:bg-white dark:text-[#102124] dark:hover:bg-white/90 dark:hover:text-[#102124]">
                <a href={platform.download} target="_blank" rel="noreferrer noopener">
                  <span className="inline-flex min-w-0 items-center gap-2 font-semibold"><Icon className="size-4 shrink-0" /><span className="truncate">Download for {platform.label}</span></span>
                  <Download className="ml-auto size-4 shrink-0 text-primary dark:text-[#0b9f6e]" />
                </a>
              </Button>

              <div className="flex min-h-12 min-w-0 items-center gap-2.5 rounded-xl border border-border bg-secondary/30 px-4 py-3 font-mono text-[11px] text-foreground dark:border-white/10 dark:bg-black/30 dark:text-white sm:text-xs">
                <span className="select-none text-primary dark:text-[#38d996]">{platform.prompt}</span>
                <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap leading-5 text-foreground/85 [scrollbar-width:none] dark:text-white/85">{platform.command}</code>
                <button
                  type="button"
                  onClick={() => copy(platform.id, platform.command)}
                  aria-label={`Copy ${platform.label} installation command`}
                  className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-[color,background-color,transform] hover:bg-secondary hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-white/45 dark:hover:bg-white/10 dark:hover:text-white dark:focus-visible:ring-[#38d996]"
                >
                  {copied ? <Check className="size-4 text-primary dark:text-[#38d996]" /> : <Copy className="size-4" />}
                </button>
              </div>
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
