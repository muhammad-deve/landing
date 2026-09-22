import Link from "next/link";
import { ArrowRight, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstallCommandCompact } from "@/components/install-command";
import { TerminalPreview } from "@/components/terminal-preview";

interface HeroProps {
  /** Live GitHub star count, or null when the API was unreachable at build time. */
  stars?: number | null;
}

const GITHUB_URL = "https://github.com/muhammad-deve/GoPort";

export function Hero({ stars = null }: HeroProps) {
  return (
    // `overflow-x-clip` contains the decorative glow below, which is inset by
    // -2rem and would otherwise widen the document on narrow viewports. `clip`
    // rather than `hidden` so it does not become a scroll container (which
    // would break `position: sticky` in sections further down).
    <section id="product" className="mx-auto w-full max-w-7xl overflow-x-clip px-5 pb-14 pt-28 sm:px-7 sm:pt-32 lg:pb-16 lg:pt-36">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-10 xl:gap-12">
        <div className="max-w-xl text-left">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
              <span className="size-2 rounded-full bg-primary" />
              Open-source localhost tunnel
            </span>
            {stars !== null && (
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground"
              >
                <Star className="size-3.5 text-primary" />
                {stars.toLocaleString()} on GitHub
              </a>
            )}
          </div>

          <h1 className="text-balance text-4xl font-semibold leading-[1.04] tracking-[-0.05em] text-foreground sm:text-5xl lg:text-[3.75rem]">
            Expose localhost to the internet with one command.
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            GoPort gives your local app, API, or webhook handler a public HTTPS URL. No deployment, public IP, or router changes required.
          </p>

          <InstallCommandCompact className="mt-7 max-w-lg" />

          <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-11 rounded-full bg-primary px-5 text-sm text-primary-foreground shadow-[0_10px_30px_-16px] shadow-primary hover:bg-primary/90 sm:text-base">
              <Link href="/signup">Create free account <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 rounded-full border-border bg-card/70 px-5 text-sm text-foreground shadow-none hover:bg-secondary sm:text-base">
              <Link href="/self-hosting">Self-host in 5 minutes</Link>
            </Button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {["Automatic HTTPS", "WebSocket support", "Local request inspector"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-primary" />{item}</span>
            ))}
          </div>
        </div>

        <div className="relative min-w-0">
          <div aria-hidden className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] bg-primary/[0.07] blur-3xl" />
          <TerminalPreview />
        </div>
      </div>
    </section>
  );
}
