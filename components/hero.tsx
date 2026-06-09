import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TerminalPreview } from "@/components/terminal-preview";
import { GitHubIcon } from "@/components/icons";

const GITHUB_URL = "https://github.com/muhammad-deve/GoPort";

export function Hero() {
  return (
    <section className="relative mx-auto flex w-full max-w-5xl flex-col items-center px-6 pt-36 pb-20 text-center sm:pt-44">
      {/* badge */}
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer noopener"
        className="group mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <span className="flex size-2 items-center justify-center">
          <span className="absolute size-2 animate-ping rounded-full bg-primary/60" />
          <span className="size-2 rounded-full bg-primary" />
        </span>
        Free &amp; open source — star us on GitHub
        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
      </a>

      <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-7xl">
        Expose localhost.
        <br />
        <span className="bg-gradient-to-r from-primary via-primary to-emerald-300 bg-clip-text text-transparent">
          Instantly.
        </span>
      </h1>

      <p className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
        Turn your computer into a server in seconds. Get a secure public URL for any local
        port — self-hosted, free, and open source.
      </p>

      {/* CTAs */}
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
        <Button
          asChild
          size="lg"
          className="group h-12 bg-primary px-7 text-base font-medium text-primary-foreground shadow-[0_0_30px_-6px] shadow-primary/50 transition-all hover:bg-primary/90 hover:shadow-primary/70"
        >
          <Link href="/signup">
            Start for free
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="h-12 border-border/70 bg-transparent px-7 text-base font-medium text-foreground hover:bg-white/5"
        >
          <a href={GITHUB_URL} target="_blank" rel="noreferrer noopener">
            <GitHubIcon className="size-4" />
            Source code
          </a>
        </Button>
      </div>

      {/* terminal */}
      <div className="mt-20 flex w-full justify-center">
        <TerminalPreview />
      </div>
    </section>
  );
}
