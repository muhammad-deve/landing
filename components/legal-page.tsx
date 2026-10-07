import Link from "next/link";
import { ChevronDown, Hash, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalToc } from "@/components/legal-toc";
import { MarketingPage } from "@/components/marketing-page";
import { CONTACT_EMAIL } from "@/components/site-footer";
import { cn } from "@/lib/utils";

// Legal pages link here for abuse reports, privacy requests, and questions.
export const LEGAL_CONTACT_EMAIL = CONTACT_EMAIL;

const LEGAL_DOCUMENTS = [
  { key: "terms", label: "Terms of Service", href: "/terms" },
  { key: "privacy", label: "Privacy Policy", href: "/privacy" },
] as const;

export interface LegalClause {
  id: string;
  title: string;
  body: React.ReactNode;
}

export interface LegalSummaryItem {
  title: string;
  text: string;
}

interface LegalPageProps {
  current: (typeof LEGAL_DOCUMENTS)[number]["key"];
  title: string;
  /** ISO date, e.g. "2026-09-23". Bump it whenever the text changes. */
  effectiveDate: string;
  intro: React.ReactNode;
  summary: LegalSummaryItem[];
  clauses: LegalClause[];
  /** Closing prompt above the contact button, e.g. "Questions about these terms?" */
  contactPrompt: string;
}

export function LegalPage({ current, title, effectiveDate, intro, summary, clauses, contactPrompt }: LegalPageProps) {
  const effectiveLabel = new Date(`${effectiveDate}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  const tocItems = clauses.map(({ id, title }) => ({ id, title }));

  return (
    <MarketingPage>
      <div className="mx-auto w-full max-w-7xl px-5 pb-20 pt-28 sm:px-7 sm:pt-32 lg:pt-36">
        <header className="max-w-3xl">
          <nav aria-label="Legal documents" className="inline-flex rounded-full border border-border bg-card/70 p-1 text-sm">
            {LEGAL_DOCUMENTS.map((doc) => (
              <Link
                key={doc.key}
                href={doc.href}
                aria-current={doc.key === current ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  doc.key === current ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {doc.label}
              </Link>
            ))}
          </nav>

          <h1 className="mt-8 text-balance text-4xl font-semibold tracking-[-0.045em] text-foreground sm:text-5xl">
            {title}
          </h1>
          <div className="legal-prose mt-4 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {intro}
          </div>
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Effective</dt>
              <dd className="font-medium text-foreground">
                <time dateTime={effectiveDate}>{effectiveLabel}</time>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Contact</dt>
              <dd>
                <a
                  href={`mailto:${LEGAL_CONTACT_EMAIL}`}
                  className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:decoration-primary focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {LEGAL_CONTACT_EMAIL}
                </a>
              </dd>
            </div>
          </dl>
        </header>

        <section aria-labelledby="summary-heading" className="mt-12 overflow-hidden rounded-2xl border border-border bg-card/60">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-border px-6 py-4">
            <h2 id="summary-heading" className="text-sm font-semibold text-foreground">At a glance</h2>
            <p className="text-xs text-muted-foreground">A summary only. The full text below is what applies.</p>
          </div>
          {/* Each cell draws its own right and bottom edge; the negative margins
              tuck the outermost ones under the rounded container's border. */}
          <ul className="-mb-px -mr-px grid sm:grid-cols-2 lg:grid-cols-4">
            {summary.map((item) => (
              <li key={item.title} className="border-b border-r border-border px-6 py-5">
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
          <aside className="hidden lg:block">
            <nav aria-label="On this page" className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">On this page</p>
              <LegalToc items={tocItems} />
            </nav>
          </aside>

          <details className="group rounded-2xl border border-border bg-card/60 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
              <span>
                On this page <span className="font-normal text-muted-foreground">· {clauses.length} sections</span>
              </span>
              <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <ol className="grid gap-x-6 border-t border-border px-5 py-3 text-[13px] leading-5 sm:grid-cols-2">
              {clauses.map((clause, index) => (
                <li key={clause.id}>
                  <a href={`#${clause.id}`} className="flex gap-3 py-1.5 text-muted-foreground transition-colors hover:text-foreground">
                    <span className="w-4 shrink-0 font-mono text-[11px] leading-5 tabular-nums text-muted-foreground/70">{index + 1}</span>
                    {clause.title}
                  </a>
                </li>
              ))}
            </ol>
          </details>

          <div className="min-w-0">
            <article className="rounded-2xl border border-border bg-card/70 shadow-[0_28px_90px_-60px_rgba(8,17,19,0.5)]">
              {clauses.map((clause, index) => (
                <section
                  key={clause.id}
                  id={clause.id}
                  aria-labelledby={`${clause.id}-heading`}
                  className="border-t border-border px-5 py-8 first:border-t-0 sm:grid sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:px-8 sm:py-10 lg:px-10"
                >
                  <span aria-hidden className="block font-mono text-sm leading-7 tabular-nums text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h2 id={`${clause.id}-heading`} className="text-lg font-semibold leading-7 tracking-[-0.02em] text-foreground sm:text-xl">
                      <a href={`#${clause.id}`} className="group inline-flex items-center gap-2 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {clause.title}
                        <Hash aria-hidden className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                      </a>
                    </h2>
                    <div className="legal-prose mt-3 max-w-[68ch] space-y-4 text-[15px] leading-7 text-muted-foreground">
                      {clause.body}
                    </div>
                  </div>
                </section>
              ))}
            </article>

            <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <p className="font-semibold text-foreground">{contactPrompt}</p>
                <p className="mt-1 text-sm text-muted-foreground">Write to us and we’ll get back to you.</p>
              </div>
              <Button asChild className="h-10 shrink-0 rounded-full bg-primary px-5 text-primary-foreground shadow-none hover:bg-primary/90">
                <a href={`mailto:${LEGAL_CONTACT_EMAIL}`}>
                  <Mail className="size-4" />
                  {LEGAL_CONTACT_EMAIL}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MarketingPage>
  );
}
