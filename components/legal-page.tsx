import Link from "next/link";
import { MarketingPage } from "@/components/marketing-page";

// Legal pages link here for abuse reports, privacy requests, and questions.
export const LEGAL_CONTACT_EMAIL = "muhammadgo.deve@gmail.com";

export interface LegalClause {
  id: string;
  title: string;
  body: React.ReactNode;
}

interface LegalPageProps {
  title: string;
  /** ISO date, e.g. "2026-09-23". Bump it whenever the text changes. */
  effectiveDate: string;
  intro: React.ReactNode;
  summary: string[];
  clauses: LegalClause[];
  related: { label: string; href: string };
}

export function LegalPage({ title, effectiveDate, intro, summary, clauses, related }: LegalPageProps) {
  const effectiveLabel = new Date(`${effectiveDate}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <MarketingPage>
      <div className="mx-auto w-full max-w-7xl px-5 pb-20 pt-32 sm:px-7 sm:pt-36 lg:pt-40">
        <header className="max-w-3xl">
          <h1 className="text-balance text-5xl font-semibold tracking-[-0.055em] text-foreground sm:text-6xl">
            {title}
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Effective <time dateTime={effectiveDate}>{effectiveLabel}</time>
          </p>
          <div className="legal-prose mt-5 text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {intro}
          </div>
        </header>

        <section
          aria-labelledby="summary-heading"
          className="mt-10 rounded-2xl border border-primary/25 bg-primary/[0.06] p-6 sm:p-7"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 id="summary-heading" className="text-base font-semibold text-foreground">
              The short version
            </h2>
            <p className="text-xs text-muted-foreground">The full text below is what applies.</p>
          </div>
          <ul className="mt-5 grid gap-x-10 gap-y-4 text-sm leading-6 text-muted-foreground md:grid-cols-2">
            {summary.map((line) => (
              <li key={line} className="flex gap-3">
                <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-primary" />
                {line}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-14 grid gap-12 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-16">
          <nav aria-label="Sections" className="lg:sticky lg:top-28 lg:self-start">
            <ol className="grid gap-x-6 gap-y-0.5 text-[13px] leading-5 sm:grid-cols-2 lg:grid-cols-1">
              {clauses.map((clause, index) => (
                <li key={clause.id}>
                  <a
                    href={`#${clause.id}`}
                    className="flex gap-2.5 rounded-sm py-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="w-5 shrink-0 font-mono text-[11px] leading-5 text-primary">{index + 1}</span>
                    {clause.title}
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-5 border-t border-border pt-4 text-[13px]">
              <Link
                href={related.href}
                className="text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {related.label}
              </Link>
            </p>
          </nav>

          <div className="max-w-3xl">
            {clauses.map((clause, index) => (
              <section
                key={clause.id}
                id={clause.id}
                aria-labelledby={`${clause.id}-heading`}
                className="scroll-mt-28 border-t border-border py-8 first:border-t-0 first:pt-0"
              >
                <h2
                  id={`${clause.id}-heading`}
                  className="flex items-baseline gap-3 text-xl font-semibold tracking-[-0.025em] text-foreground"
                >
                  <span className="font-mono text-sm font-normal text-primary">{index + 1}.</span>
                  {clause.title}
                </h2>
                <div className="legal-prose mt-4 space-y-4 text-base leading-7 text-muted-foreground">
                  {clause.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </MarketingPage>
  );
}
