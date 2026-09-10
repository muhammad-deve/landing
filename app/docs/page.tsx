import type { Metadata } from "next";
import { BookOpen, Download, GitFork, Network } from "lucide-react";
import { DocsOverview, Quickstart } from "@/components/home-sections";
import { MarketingPage, SubpageHero } from "@/components/marketing-page";

const GITHUB_URL = "https://github.com/muhammad-deve/GoPort";

const DOC_LINKS = [
  { title: "Installation", description: "Install GoPort on macOS, Windows, or Linux.", href: `${GITHUB_URL}#installation`, icon: Download },
  { title: "How it works", description: "Follow the tunnel connection from public HTTPS to your machine.", href: `${GITHUB_URL}#how-it-works`, icon: Network },
  { title: "Technical details", description: "Understand the TCP and yamux architecture behind GoPort.", href: `${GITHUB_URL}#technical-details`, icon: BookOpen },
  { title: "Source and license", description: "Inspect, fork, and self-host the MIT-licensed project.", href: GITHUB_URL, icon: GitFork },
];

export const metadata: Metadata = {
  title: "Documentation",
  description: "Read GoPort installation instructions, tunnel architecture, CLI quickstart, technical details, and self-hosting resources.",
  alternates: { canonical: "/docs" },
  openGraph: { url: "/docs" },
};

export default function DocsPage() {
  return (
    <MarketingPage>
      <SubpageHero
        section="docs"
        title="Understand every hop through the tunnel."
        description="Start with the four-step setup, then inspect how GoPort connects the public route, tunnel server, CLI, and your local process."
        command="$ goport http 3000"
        output="internet  →  goport.uz  →  GoPort CLI  →  localhost:3000"
        primaryLabel="Open quickstart"
        primaryHref="/quickstart"
      />

      <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-7 lg:py-20">
        <div className="grid overflow-hidden rounded-[1.5rem] border border-border bg-card/60 sm:grid-cols-2">
          {DOC_LINKS.map((item, index) => {
            const Icon = item.icon;
            return (
              <a
                key={item.title}
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                className={`group p-6 transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:p-8 ${index % 2 === 0 ? "sm:border-r sm:border-border" : ""} ${index < 2 ? "border-b border-border" : ""}`}
              >
                <Icon className="size-5 text-primary" />
                <h2 className="mt-5 text-xl font-semibold tracking-[-0.025em] text-foreground group-hover:text-primary">{item.title}</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{item.description}</p>
              </a>
            );
          })}
        </div>
      </section>

      <Quickstart />
      <DocsOverview />
    </MarketingPage>
  );
}
