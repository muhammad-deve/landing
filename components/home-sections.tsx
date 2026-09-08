import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  GitBranch,
  Globe2,
  LockKeyhole,
  MessagesSquare,
  RadioTower,
  Server,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/icons";
import { SectionHeader } from "@/components/section-header";
import { TunnelDiagram } from "@/components/tunnel-diagram";
import { UseCaseWorkbench } from "@/components/use-case-workbench";

const GITHUB_URL = "https://github.com/muhammad-deve/GoPort";

const INTEGRATIONS = [
  { name: "Click", mark: "C" },
  { name: "payme", mark: "p" },
  { name: "MultiCard", mark: "M" },
  { name: "Higgsfield", mark: "H" },
  { name: "Telegram", mark: "T" },
  { name: "GitHub", mark: "G" },
  { name: "Stripe", mark: "S" },
  { name: "Twilio", mark: "T" },
];

const FEATURES = [
  { icon: ShieldCheck, title: "HTTPS on every route", text: "Give a local app a public HTTPS address without opening your network to inbound traffic." },
  { icon: Globe2, title: "Names that stay put", text: "Request a memorable GoPort subdomain when an integration needs a stable callback URL." },
  { icon: MessagesSquare, title: "Requests you can inspect", text: "See the requests, payloads, and responses that arrive at your local application." },
  { icon: RadioTower, title: "Realtime stays realtime", text: "WebSocket and streaming connections travel over the same tunnel." },
];

const PLANS = [
  { name: "Free", price: "$0", description: "For trying a route with a local project.", items: ["Up to 2 active tunnels", "Random GoPort subdomain", "Automatic HTTPS", "WebSocket support", "Basic request inspector", "Community support"], action: "Start free" },
  { name: "Pro", price: "$2.99", suffix: "/ month", description: "For projects that need names and history to persist.", items: ["More simultaneous tunnels", "Persistent subdomains", "Custom domains", "Longer request history", "Higher traffic limits", "Tunnel access controls"], action: "Get Pro", popular: true },
  { name: "Team", price: "$7.99", suffix: "/ month", description: "For developers sharing routes and domains.", items: ["Everything in Pro", "Shared tunnels and domains", "Team member access", "Central route ownership", "Higher team limits", "Priority support"], action: "Get Team" },
];

export function CompatibleServices() {
  return (
    <section id="integrations" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-7 lg:py-28">
      <SectionHeader title="Bring real webhook traffic to your local app." description="If a service can send an HTTPS request, you can point it at GoPort and receive it on localhost." />

      <div className="mt-12 overflow-hidden rounded-[1.75rem] border border-border bg-card/75 shadow-[0_28px_90px_-55px_rgba(8,17,19,0.55)]">
        <div className="grid grid-cols-2 border-b border-border sm:grid-cols-4 lg:grid-cols-8">
          {INTEGRATIONS.map((integration) => (
            <div key={integration.name} className="flex min-h-28 flex-col items-center justify-center gap-3 border-b border-r border-border px-3 last:border-r-0 sm:[&:nth-child(n+5)]:border-b-0 lg:border-b-0">
              <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-background font-semibold text-primary shadow-sm" aria-hidden>{integration.mark}</span>
              <span className="text-sm font-semibold tracking-[-0.02em] text-foreground">{integration.name}</span>
            </div>
          ))}
        </div>

        <div className="grid gap-10 p-6 sm:p-9 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:p-12">
          <div>
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
              <span className="rounded-lg border border-border bg-background px-3 py-2 text-foreground">Payme callback</span>
              <ArrowRight className="size-4 text-primary" />
              <span className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-primary">shop.goport.uz</span>
            </div>
            <div className="ml-5 h-8 border-l border-dashed border-primary/50" />
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
              <span className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-primary">GoPort tunnel</span>
              <ArrowRight className="size-4 text-primary" />
              <span className="rounded-lg border border-border bg-background px-3 py-2 text-foreground">localhost:3000/api/payment</span>
            </div>
          </div>

          <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
            {["Receive payment callbacks without a staging deploy", "Inspect request headers and JSON payloads", "Test OAuth redirects from a real provider", "Connect mobile apps and remote devices", "Keep WebSocket connections open through the tunnel"].map((item) => (
              <li key={item} className="flex items-start gap-2"><CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />{item}</li>
            ))}
          </ul>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">Service names indicate technical compatibility with public HTTPS endpoints; no partnership or endorsement is implied.</p>
    </section>
  );
}

export function MainFeatures() {
  return (
    <section id="features" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-7 lg:py-28">
      <SectionHeader eyebrow="Built for daily development" title="A small surface area. The right tools inside it." description="GoPort stays focused on the work between localhost and a real public route." />
      <div className="mt-14 grid divide-y divide-border border-y border-border sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <article key={title} className="px-0 py-7 sm:px-6 sm:first:pl-0 sm:last:pr-0 lg:px-7 lg:first:pl-0 lg:last:pr-0">
            <Icon className="size-5 text-primary" />
            <h3 className="mt-6 text-lg font-semibold tracking-[-0.025em] text-foreground">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
          </article>
        ))}
      </div>
      <a href="#product" className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-foreground underline decoration-primary/60 underline-offset-4 hover:decoration-primary">See the product in action <ArrowRight className="size-4" /></a>
    </section>
  );
}

export function UseCases() {
  return (
    <section id="use-cases" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-7 lg:py-28">
      <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:items-start">
        <SectionHeader eyebrow="Routes for real work" title="Use GoPort before your code reaches staging." description="Select a common developer task to see how a public route fits into it." align="left" />
        <UseCaseWorkbench />
      </div>
    </section>
  );
}

export function Quickstart() {
  const steps = [
    { title: "Authenticate", text: "Copy your token from the GoPort dashboard and connect the CLI.", code: "goport auth YOUR_TOKEN" },
    { title: "Open a route", text: "Tell GoPort which local port to reach.", code: "goport http 3000" },
    { title: "Use the URL", text: "Send the HTTPS route to an integration, device, or person.", code: "https://project.goport.uz" },
  ];

  return (
    <section id="quickstart" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-7 lg:py-28">
      <SectionHeader eyebrow="Quickstart" title="Your first public URL is three steps away." description="No port forwarding. No public IP. No deployment step." />
      <ol className="mt-14 grid gap-4 lg:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="route-surface rounded-2xl border border-border p-6 sm:p-7">
            <span className="font-mono text-sm text-primary">0{index + 1}</span>
            <h3 className="mt-7 text-xl font-semibold tracking-[-0.025em] text-foreground">{step.title}</h3>
            <p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">{step.text}</p>
            <code className="mt-7 block overflow-x-auto border-t border-border pt-4 font-mono text-xs text-primary">{step.code}</code>
          </li>
        ))}
      </ol>
      <div className="mt-10"><TunnelDiagram /></div>
    </section>
  );
}

export function DeveloperSignals() {
  const signals = ["Open-source CLI", "MIT licensed", "Self-hostable infrastructure"];
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-7 lg:py-16">
      <div className="flex flex-col gap-5 border-y border-border py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-xl font-medium tracking-[-0.025em] text-foreground">Built for developers who want to see how their route works.</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">{signals.map((signal) => <span key={signal} className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary" />{signal}</span>)}</div>
      </div>
    </section>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-7 lg:py-28">
      <SectionHeader eyebrow="Pricing" title="Start with a route. Grow when routes become infrastructure." description="Three straightforward plans. No enterprise maze." />
      <div className="mt-14 grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <article key={plan.name} className={`relative rounded-2xl border p-7 ${plan.popular ? "border-primary bg-primary/[0.07]" : "border-border bg-card/60"}`}>
            {plan.popular && <span className="absolute right-6 top-6 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">Most popular</span>}
            <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
            <p className="mt-3 max-w-[16rem] text-sm leading-6 text-muted-foreground">{plan.description}</p>
            <div className="mt-8 flex items-end gap-1"><span className="text-5xl font-semibold tracking-[-0.05em] text-foreground">{plan.price}</span>{plan.suffix && <span className="mb-1 text-sm text-muted-foreground">{plan.suffix}</span>}</div>
            <ul className="my-8 space-y-3 border-y border-border py-6">
              {plan.items.map((item) => <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{item}</li>)}
            </ul>
            <Button asChild variant={plan.popular ? "default" : "outline"} className={`w-full rounded-full ${plan.popular ? "bg-primary text-primary-foreground shadow-none hover:bg-primary/90" : "border-border bg-transparent text-foreground shadow-none hover:bg-secondary"}`}><Link href="/signup">{plan.action}</Link></Button>
          </article>
        ))}
      </div>
    </section>
  );
}

export function TrustSignals() {
  const signals = [
    { icon: GitBranch, title: "Open-source CLI", text: "Inspect the code that opens the connection from your machine." },
    { icon: Server, title: "Self-hostable", text: "Run the tunnel infrastructure in an environment you control." },
    { icon: LockKeyhole, title: "Clear boundaries", text: "Routes begin with an outbound connection from your local machine." },
  ];
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-7 lg:py-28">
      <div className="route-surface rounded-[1.5rem] border border-border px-6 py-12 sm:px-10 lg:px-14">
        <SectionHeader eyebrow="Trust" title="Open source where your tunnel begins." description="A transparent developer tool: inspect the CLI, follow releases, and self-host when you need to." />
        <div className="mt-12 grid gap-8 border-t border-border pt-8 md:grid-cols-3">
          {signals.map(({ icon: Icon, title, text }) => <article key={title}><Icon className="size-5 text-primary" /><h3 className="mt-5 font-semibold text-foreground">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></article>)}
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline" className="rounded-full border-border bg-background/60 text-foreground shadow-none hover:bg-secondary"><a href={GITHUB_URL} target="_blank" rel="noreferrer noopener"><GitHubIcon className="size-4" />View source</a></Button>
          <Button asChild variant="ghost" className="rounded-full text-foreground hover:bg-secondary"><a href={`${GITHUB_URL}#readme`} target="_blank" rel="noreferrer noopener">Read docs</a></Button>
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-7 lg:py-28">
      <div className="border-l-2 border-primary py-4 pl-6 sm:pl-8">
        <p className="text-sm font-medium text-primary">Ready when your local app is.</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-6xl">Give your localhost a route worth sharing.</h2>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="h-11 rounded-full bg-primary px-5 text-primary-foreground shadow-none hover:bg-primary/90"><Link href="/signup">Start free <ArrowRight className="size-4" /></Link></Button>
          <Button asChild size="lg" variant="outline" className="h-11 rounded-full border-border bg-card/60 px-5 text-foreground shadow-none hover:bg-secondary"><a href="#quickstart">View quickstart</a></Button>
        </div>
      </div>
    </section>
  );
}
