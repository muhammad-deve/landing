import Link from "next/link";
import { ArrowRight, CircleCheck, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBackground } from "@/components/page-background";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

interface MarketingPageProps {
  children: React.ReactNode;
}

interface SubpageHeroProps {
  section: string;
  title: string;
  description: string;
  command: string;
  output: string;
  primaryLabel?: string;
  primaryHref?: string;
}

export function MarketingPage({ children }: MarketingPageProps) {
  return (
    <div className="relative z-0 flex min-h-screen flex-col">
      <PageBackground />
      <SiteNav />
      <main className="relative z-10 flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function SubpageHero({
  section,
  title,
  description,
  command,
  output,
  primaryLabel = "Create free account",
  primaryHref = "/signup",
}: SubpageHeroProps) {
  return (
    <header className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-12 pt-32 sm:px-7 sm:pt-36 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.78fr)] lg:items-center lg:gap-16 lg:pb-16 lg:pt-40">
      <div className="max-w-2xl">
        <p className="font-mono text-sm text-primary">goport.uz / {section}</p>
        <h1 className="mt-5 text-balance text-5xl font-semibold tracking-[-0.055em] text-foreground sm:text-6xl lg:text-7xl">
          {title}
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Button asChild size="lg" className="rounded-full bg-primary px-6 text-primary-foreground shadow-none hover:bg-primary/90">
            <Link href={primaryHref}>{primaryLabel}<ArrowRight className="size-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full border-border bg-transparent px-6 text-foreground shadow-none hover:bg-secondary">
            <Link href="/docs">Read the docs</Link>
          </Button>
        </div>
      </div>

      <div className="terminal-surface overflow-hidden rounded-[1.5rem] border border-border shadow-[0_30px_90px_-52px_rgba(8,17,19,0.75)]">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <span className="size-2.5 rounded-full bg-[#ff6b6b]" />
          <span className="size-2.5 rounded-full bg-[#f4c95d]" />
          <span className="size-2.5 rounded-full bg-primary" />
          <span className="ml-auto font-mono text-[11px] text-muted-foreground">tunnel trace</span>
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3 font-mono text-xs leading-6 sm:text-sm">
            <Terminal className="mt-1 size-4 shrink-0 text-primary" />
            <code className="break-all text-foreground">{command}</code>
          </div>
          <div className="mt-6 rounded-xl border border-primary/25 bg-primary/[0.07] p-4">
            <p className="flex items-center gap-2 text-xs font-medium text-primary">
              <CircleCheck className="size-4" /> Route active
            </p>
            <code className="mt-3 block break-words font-mono text-xs leading-6 text-muted-foreground">{output}</code>
          </div>
        </div>
      </div>
    </header>
  );
}
