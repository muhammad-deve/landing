import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GitFork, Globe, Server, ShieldCheck } from "lucide-react";
import { MarketingPage, SubpageHero } from "@/components/marketing-page";
import { SectionHeader } from "@/components/section-header";
import { TerminalCommand } from "@/components/terminal-command";
import { Button } from "@/components/ui/button";

const GITHUB_URL = "https://github.com/muhammad-deve/GoPort";

export const metadata: Metadata = {
  title: "Self-Hosting",
  description:
    "Run the GoPort tunnel server on your own infrastructure. MIT licensed, Docker Compose deployment, your own wildcard domain, and no plan limits.",
  alternates: { canonical: "/self-hosting" },
  openGraph: { url: "/self-hosting" },
};

const REQUIREMENTS = [
  {
    icon: Server,
    title: "A server with a public IP",
    body: "Any small VPS is enough. The tunnel server listens on TCP 7000 for CLI connections and 8090 for the API.",
  },
  {
    icon: Globe,
    title: "A domain and a wildcard DNS record",
    body: "Point example.com and *.example.com at the server. Each tunnel becomes a subdomain of that domain.",
  },
  {
    icon: ShieldCheck,
    title: "A wildcard TLS certificate",
    body: "Wildcard certificates need a DNS-01 challenge. The repository ships an init-ssl.sh script that walks through it with certbot.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Clone the repository",
    body: "The tunnel server, the backend, and this website all live in the same MIT-licensed repository.",
    command: "git clone https://github.com/muhammad-deve/GoPort.git && cd GoPort",
  },
  {
    step: "02",
    title: "Configure the backend",
    body: "Copy backend/app/.env.example and fill in your own secrets. Billing variables are optional: leave them empty and every account on your server is unlimited.",
    command: "cp backend/app/.env.example backend/app/.env",
  },
  {
    step: "03",
    title: "Issue a wildcard certificate",
    body: "Run the helper script and add the TXT record it prints to your DNS panel, then let certbot finish the challenge.",
    command: "./init-ssl.sh",
  },
  {
    step: "04",
    title: "Start the stack",
    body: "Docker Compose brings up the backend, the dashboard, and the tunnel listener. Put your nginx config in front of them using nginx/goport.conf as the template.",
    command: "docker compose up -d",
  },
  {
    step: "05",
    title: "Point the CLI at your server",
    body: "The CLI reads its target from the environment. Set these once in your shell profile and every goport command uses your server instead of goport.uz.",
    command: "export GOPORT_SERVER_ADDR=tunnel.example.com:7000\nexport GOPORT_DOMAIN=example.com\nexport GOPORT_API_URL=https://back.example.com",
  },
];

export default function SelfHostingPage() {
  return (
    <MarketingPage>
      <SubpageHero
        section="self-hosting"
        title="Run the whole tunnel on your own server."
        description="GoPort is MIT licensed end to end. The same code that runs goport.uz runs on your infrastructure, with your domain, your certificates, and no plan limits."
        command="$ export GOPORT_SERVER_ADDR=tunnel.example.com:7000"
        output="goport http 8080  →  https://myapp.example.com"
        primaryLabel="Read the source"
        primaryHref={GITHUB_URL}
      />

      <section className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-7 lg:py-18">
        <SectionHeader
          eyebrow="Why self-host"
          title="No vendor lock-in, no traffic ceiling."
          description="Hosted plans exist so you do not have to run a server. If you would rather run it, nothing is held back: self-hosting is the full product, not a stripped-down edition."
          align="left"
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {REQUIREMENTS.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-2xl border border-border bg-card/60 p-6">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-7 lg:py-18">
        <SectionHeader
          eyebrow="Setup"
          title="Five steps from clone to first tunnel."
          description="Budget about five minutes, plus however long your DNS provider takes to propagate the wildcard record."
        />

        <ol className="mt-10 overflow-hidden rounded-[1.5rem] border border-border bg-card/60">
          {STEPS.map((item) => (
            <li
              key={item.step}
              className="grid gap-5 border-b border-border p-6 last:border-b-0 sm:p-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-10"
            >
              <div>
                <span className="font-mono text-sm text-primary">{item.step}</span>
                <h3 className="mt-3 text-xl font-semibold tracking-[-0.025em] text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </div>
              <TerminalCommand command={item.command} />
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-7 lg:py-18">
        <div className="grid gap-8 rounded-[1.5rem] border border-border bg-card/60 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold tracking-[-0.035em] text-foreground sm:text-3xl">
              Not sure you want to run a server?
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              The hosted Free plan gives you one tunnel and 5 GB a month with no card. You can move to your own server
              later without changing a single command, since only the environment variables differ.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-primary px-6 text-primary-foreground shadow-none hover:bg-primary/90">
              <Link href="/signup">
                Use the hosted plan <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-border bg-transparent px-6 text-foreground shadow-none hover:bg-secondary">
              <a href={GITHUB_URL} target="_blank" rel="noreferrer noopener">
                <GitFork className="size-4" /> Fork on GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
