"use client";

import Link from "next/link";
import { Check, CircleCheck, Copy, Download, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppleIcon, LinuxIcon, WindowsIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { copyText } from "@/lib/clipboard";
import { detectMacArch, detectPlatform, RELEASE_DOWNLOAD_URL, type MacArch, type PlatformId } from "@/lib/platform";

// Phones, tablets, and anything undetected get the page listing every build.
const FALLBACK_HREF = "/quickstart#quickstart";
const BREW_COMMAND = "brew install muhammad-deve/goport/goport";

// Installers/Windows/goport.iss puts goport on PATH, and its last screen shows
// the next commands, so Windows gets a plain download with no popover.
const WINDOWS_INSTALLER = "goport-windows-setup.exe";

function getBuild(platform: Exclude<PlatformId, "windows">, macArch: MacArch) {
  if (platform === "macos") {
    const file = `goport-darwin-${macArch}`;
    return {
      label: macArch === "arm64" ? "Mac with Apple Silicon" : "Intel Mac",
      file,
      icon: AppleIcon,
      intro: "When it finishes, run GoPort from Terminal:",
      prompt: "$",
      // Browsers drop the executable bit and macOS quarantines downloads, so a
      // fresh binary needs both fixed before Gatekeeper will let it run.
      steps: ["cd ~/Downloads", `chmod +x ${file}`, `xattr -c ${file}`, `./${file} auth <token>`, `./${file} http 8080`],
    };
  }

  const file = "goport-linux-amd64";
  return {
    label: "Linux",
    file,
    icon: LinuxIcon,
    intro: "When it finishes, run GoPort from a terminal:",
    prompt: "$",
    steps: ["cd ~/Downloads", `chmod +x ${file}`, `./${file} auth <token>`, `./${file} http 8080`],
  };
}

/**
 * Nav call to action. On desktop it downloads the CLI build for the visitor's
 * OS in place, so nobody is sent to another page just to find a file. The
 * macOS and Linux binaries need a few terminal commands before they run, so
 * those downloads also open a popover listing them.
 */
export function DownloadButton() {
  const [platform, setPlatform] = useState<PlatformId | null>(null);
  const [macArch, setMacArch] = useState<MacArch>("arm64");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const anchorRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const detected = detectPlatform();
    setPlatform(detected);
    if (detected === "macos") detectMacArch().then(setMacArch);
  }, []);

  const buttonClassName = "h-9 rounded-full bg-primary px-4 text-primary-foreground shadow-none hover:bg-primary/90";

  if (!platform) {
    return (
      <Button asChild className={buttonClassName}>
        <Link href={FALLBACK_HREF}>
          <Download className="size-4" />
          Download
        </Link>
      </Button>
    );
  }

  if (platform === "windows") {
    return (
      <Button asChild className={buttonClassName}>
        <a
          href={`${RELEASE_DOWNLOAD_URL}/${WINDOWS_INSTALLER}`}
          aria-label="Download the GoPort installer for Windows"
          title={`${WINDOWS_INSTALLER} · latest release`}
        >
          <WindowsIcon className="size-3.5" />
          Download
        </a>
      </Button>
    );
  }

  const build = getBuild(platform, macArch);
  const Icon = build.icon;
  const otherMacArch: MacArch = macArch === "arm64" ? "amd64" : "arm64";

  const copySteps = async () => {
    if (await copyText(build.steps.join("\n"))) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Button asChild className={buttonClassName}>
          <a
            ref={anchorRef}
            href={`${RELEASE_DOWNLOAD_URL}/${build.file}`}
            onClick={() => setOpen(true)}
            aria-label={`Download GoPort for ${build.label}`}
            title={`${build.file} · latest release`}
          >
            <Icon className="size-3.5" />
            Download
          </a>
        </Button>
      </PopoverAnchor>

      <PopoverContent
        align="end"
        sideOffset={10}
        // Clicking the button again downloads again; keep the popover open
        // instead of letting the outside-click close it and reopen it.
        onInteractOutside={(event) => {
          if (anchorRef.current?.contains(event.target as Node)) event.preventDefault();
        }}
        className="w-[min(25rem,calc(100vw-2rem))] rounded-2xl border-border p-0 shadow-[0_24px_70px_-30px_rgba(8,17,19,0.55)]"
      >
        <div className="flex items-start gap-3 border-b border-border p-4">
          <CircleCheck className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Your download has started</p>
            <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
              {build.file} · {build.label}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="-mr-1 -mt-1 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm text-muted-foreground">{build.intro}</p>
          <div className="relative mt-3 rounded-xl border border-border bg-secondary/40 py-3 pl-3 pr-11">
            <div className="overflow-x-auto font-mono text-[11px] leading-5 [scrollbar-width:none]">
              {build.steps.map((line) => (
                <div key={line} className="flex gap-2 whitespace-nowrap">
                  <span className="select-none text-primary">{build.prompt}</span>
                  <code className="text-foreground/85">{line}</code>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={copySteps}
              aria-label="Copy commands"
              className="absolute right-2 top-2 flex size-7 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-[color,background-color,transform] hover:bg-secondary hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
            </button>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Replace <code className="font-mono text-foreground">&lt;token&gt;</code> with a CLI token from your{" "}
            <Link href="/dashboard#tokens" onClick={() => setOpen(false)} className="text-foreground underline decoration-border underline-offset-4 hover:decoration-primary">
              dashboard
            </Link>
            .
          </p>
          {platform === "macos" && (
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Prefer Homebrew? <code className="whitespace-nowrap font-mono text-foreground">{BREW_COMMAND}</code>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <a href={`${RELEASE_DOWNLOAD_URL}/${build.file}`} className="hover:text-foreground">
            Didn’t start? Download again
          </a>
          {platform === "macos" && (
            <a
              href={`${RELEASE_DOWNLOAD_URL}/goport-darwin-${otherMacArch}`}
              onClick={() => setMacArch(otherMacArch)}
              className="hover:text-foreground"
            >
              {otherMacArch === "amd64" ? "Intel Mac?" : "Apple Silicon?"}
            </a>
          )}
          <Link href={FALLBACK_HREF} onClick={() => setOpen(false)} className="ml-auto font-medium text-foreground hover:text-primary">
            All platforms
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
