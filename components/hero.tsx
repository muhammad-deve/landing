import Link from "next/link";
import { ArrowRight, Check, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TerminalPreview } from "@/components/terminal-preview";

const GITHUB_URL = "https://github.com/muhammad-deve/GoPort";

export function Hero() {
  return (
    <section id="product" className="mx-auto w-full max-w-7xl px-5 pb-24 pt-32 sm:px-7 sm:pt-40 lg:pb-28 lg:pt-44">
      <div className="grid gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-12 xl:gap-16">
        <div className="max-w-xl text-left">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
            <span className="size-2 rounded-full bg-primary" />
            Public HTTPS tunnels for localhost
          </div>

          <h1 className="text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-[4.4rem]">
            Give localhost a public URL.
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
            Run one command. GoPort creates a secure URL for your local app, API, or webhook handler—without deploying it first.
          </p>

          <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full bg-primary px-6 text-base text-primary-foreground shadow-[0_10px_30px_-16px] shadow-primary hover:bg-primary/90">
              <Link href="/signup">Start free <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-border bg-card/70 px-6 text-base text-foreground shadow-none hover:bg-secondary">
              <a href={`${GITHUB_URL}#readme`} target="_blank" rel="noreferrer noopener">Read quickstart</a>
            </Button>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {["HTTPS included", "WebSockets supported", "Request inspection"].map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5"><Check className="size-3.5 text-primary" />{item}</span>
            ))}
            <a href={GITHUB_URL} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 text-foreground hover:text-primary"><Github className="size-3.5" />Open-source CLI</a>
          </div>
        </div>

        <div className="relative min-w-0">
          <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-primary/[0.07] blur-3xl" />
          <TerminalPreview />
        </div>
      </div>
    </section>
  );
}
