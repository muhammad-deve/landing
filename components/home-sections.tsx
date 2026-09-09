import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ExternalLink,
  KeyRound,
  LogIn,
  Server,
  TerminalSquare,
} from "lucide-react";
import { GoPortFavicon } from "@/components/goport-logo";
import { Button } from "@/components/ui/button";
import { InstallCommand } from "@/components/install-command";
import { SectionHeader } from "@/components/section-header";
import { TerminalCommand } from "@/components/terminal-command";
import { TunnelDiagram } from "@/components/tunnel-diagram";
import { UseCaseWorkbench } from "@/components/use-case-workbench";

const GITHUB_URL = "https://github.com/muhammad-deve/GoPort";

const INTEGRATIONS = [
  { name: "Stripe", icon: "https://cdn.simpleicons.org/stripe/635BFF" },
  { name: "GitHub", icon: "https://cdn.simpleicons.org/github/181717" },
  { name: "Shopify", icon: "https://cdn.simpleicons.org/shopify/7AB55C" },
  { name: "Slack", icon: "https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png" },
  { name: "Discord", icon: "https://cdn.simpleicons.org/discord/5865F2" },
  { name: "GitLab", icon: "https://cdn.simpleicons.org/gitlab/FC6D26" },
  { name: "Telegram", icon: "https://cdn.simpleicons.org/telegram/26A5E4" },
  { name: "Twilio", icon: "https://www.twilio.com/favicon.ico" },
  {
    name: "Click",
    icon: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/6a/8e/e5/6a8ee507-4aee-5c09-d357-6111d7f8c7ea/AppIcon-0-0-1x_U007epad-0-11-0-sRGB-85-220.png/256x256bb.png",
    appIcon: true,
  },
  {
    name: "payme",
    icon: "https://cdn.payme.uz/payme-logos/ico/p/1/apple-touch-icon.png",
    appIcon: true,
  },
  {
    name: "MultiCard",
    icon: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/c7/b1/47/c7b14703-7e64-60e3-2ad9-a098cfc777f9/AppIcon-0-0-1x_U007emarketing-0-11-0-85-220.png/256x256bb.png",
    appIcon: true,
  },
  { name: "Higgsfield", icon: "https://higgsfield.ai/icon.png", appIcon: true },
];

const PLANS = [
  { name: "Free", price: "$0", description: "Run a local project through public HTTPS at no cost.", billingNote: "No credit card required", items: ["Up to 2 active tunnels", "Random GoPort subdomain", "Automatic HTTPS", "WebSocket support", "Local request inspector", "Community support"], action: "Create free account" },
  { name: "Pro monthly", price: "$2.99", suffix: "/ month", description: "Use every Pro feature without a yearly commitment.", billingNote: "Billed monthly. Cancel anytime.", items: ["Everything in Free", "More simultaneous tunnels", "Persistent GoPort subdomains", "Longer request history", "Higher traffic limits", "Request replay"], action: "Start 7-day free trial" },
  { name: "Pro yearly", price: "$19.99", originalPrice: "$35.88", suffix: "/ year", description: "Keep Pro for a full year at the lowest monthly price.", billingNote: "Billed yearly. Cancel anytime. Save 44%.", items: ["Everything in Free", "More simultaneous tunnels", "Persistent GoPort subdomains", "Longer request history", "Higher traffic limits", "Request replay"], action: "Choose yearly", popular: true, badge: "Best value" },
];

export function CompatibleServices() {
  const outcomes = [
    "Receive live webhook deliveries on localhost",
    "Inspect headers, bodies, and responses",
    "Replay a request after each code change",
  ];

  return (
    <section id="integrations" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-7 lg:py-28">
      <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-16">
        <SectionHeader
          eyebrow="Webhook testing"
          title="Debug real webhooks on localhost."
          description="Use a GoPort URL as the provider endpoint. Deliveries reach your local handler, and the built-in inspector records each request and response for replay."
          align="left"
        />

        <div className="route-surface overflow-hidden rounded-[1.5rem] border border-border shadow-[0_24px_70px_-45px_rgba(8,17,19,0.5)]">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5 text-xs sm:px-6">
            <span className="inline-flex items-center gap-2 font-medium text-foreground"><span className="size-2 rounded-full bg-primary" />Webhook delivery</span>
            <span className="font-mono text-primary">200 OK</span>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-stretch">
              <div className="min-w-0 rounded-xl border border-border bg-background/75 p-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-white p-1.5"><img src="https://cdn.simpleicons.org/stripe/635BFF" alt="" width={20} height={20} className="size-full" /></span>
                  <span className="text-sm font-semibold text-foreground">Stripe event</span>
                </div>
                <code className="mt-3 block truncate text-[11px] text-muted-foreground">checkout.session.completed</code>
              </div>

              <ArrowRight className="mx-auto size-4 rotate-90 self-center text-primary sm:rotate-0" />

              <div className="min-w-0 rounded-xl border border-primary/30 bg-primary/[0.08] p-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-card p-1 text-foreground shadow-sm">
                    <GoPortFavicon className="size-full" />
                  </span>
                  <span className="text-sm font-semibold text-foreground">Public GoPort URL</span>
                </div>
                <code className="mt-3 block truncate text-[11px] text-primary">checkout.goport.uz</code>
              </div>

              <ArrowRight className="mx-auto size-4 rotate-90 self-center text-primary sm:rotate-0" />

              <div className="min-w-0 rounded-xl border border-border bg-background/75 p-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-card"><Server className="size-4 text-foreground" /></span>
                  <span className="text-sm font-semibold text-foreground">Local endpoint</span>
                </div>
                <code className="mt-3 block truncate text-[11px] text-muted-foreground">localhost:3000/webhooks</code>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-border bg-background/55 px-4 py-3 font-mono text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">POST /api/webhooks/stripe</span>
              <span>captured locally</span>
              <span className="ml-auto text-primary">48 ms</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 overflow-hidden rounded-[1.5rem] border border-border bg-card/70 shadow-[0_28px_90px_-60px_rgba(8,17,19,0.5)]">
        <div className="-mb-px -mr-px grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6">
          {INTEGRATIONS.map((integration) => (
            <div key={integration.name} className="flex min-h-24 flex-col items-center justify-center gap-2.5 border-b border-r border-border px-3 py-4">
              <span
                className={`flex size-10 items-center justify-center overflow-hidden border border-border bg-white shadow-sm ${integration.appIcon ? "rounded-xl" : "rounded-lg p-2"}`}
                aria-hidden
              >
                <img
                  src={integration.icon}
                  alt=""
                  width={44}
                  height={44}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="size-full object-contain"
                />
              </span>
              <span className="text-sm font-semibold tracking-[-0.02em] text-foreground">{integration.name}</span>
            </div>
          ))}
        </div>
        <div className="grid border-t border-border sm:grid-cols-3 sm:divide-x sm:divide-border">
          {outcomes.map((item) => (
            <div key={item} className="flex items-start gap-2.5 border-b border-border px-5 py-4 text-sm leading-6 text-muted-foreground last:border-b-0 sm:border-b-0">
              <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" />
              {item}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">These services can send callbacks to standard public HTTPS endpoints. Their names are examples, not partnership claims.</p>
    </section>
  );
}

export function UseCases() {
  return (
    <section id="use-cases" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-7 lg:py-28">
      <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:items-start">
        <SectionHeader eyebrow="Use cases" title="A public URL for work that still runs locally." description="See how a localhost tunnel fits into webhook development, payment testing, OAuth, mobile apps, and client reviews." align="left" />
        <UseCaseWorkbench />
      </div>
    </section>
  );
}

export function Quickstart() {
  return (
    <section id="quickstart" className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-7 lg:py-20">
      <SectionHeader eyebrow="Get started" title="Open your first localhost tunnel." description="Install the CLI, authenticate once, and point GoPort at the port your application already uses." />

      <div className="mt-10 overflow-hidden rounded-[1.5rem] border border-border bg-card/60 shadow-[0_30px_90px_-60px_rgba(8,17,19,0.5)]">
        <div className="grid gap-6 border-b border-border p-5 sm:p-6 lg:grid-cols-[minmax(14rem,0.62fr)_minmax(0,1.38fr)] lg:items-center lg:gap-8 lg:p-8">
          <div className="max-w-sm">
            <span className="font-mono text-sm text-primary">01</span>
            <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-foreground sm:text-2xl">Install the GoPort CLI</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Choose the command for macOS, Windows, or Linux, then verify that GoPort is available in your terminal.</p>
          </div>
          <InstallCommand />
        </div>

        <ol className="grid lg:grid-cols-3 lg:divide-x lg:divide-border">
          <li className="border-b border-border p-6 sm:p-8 lg:border-b-0">
            <div className="flex items-center justify-between"><span className="font-mono text-sm text-primary">02</span><LogIn className="size-5 text-muted-foreground" /></div>
            <h3 className="mt-6 text-xl font-semibold tracking-[-0.025em] text-foreground">Create a CLI token</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Log in to your GoPort account—or create one first—then generate a named CLI token in the dashboard.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild size="sm" className="rounded-full bg-primary text-primary-foreground shadow-none hover:bg-primary/90"><Link href="/login">Log in</Link></Button>
              <Button asChild size="sm" variant="outline" className="rounded-full border-border bg-transparent text-foreground shadow-none hover:bg-secondary"><Link href="/signup">Create account</Link></Button>
            </div>
            <Link href="/dashboard#tokens" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-primary/60 underline-offset-4 hover:decoration-primary">Create a CLI token <ArrowRight className="size-3.5" /></Link>
          </li>

          <li className="border-b border-border p-6 sm:p-8 lg:border-b-0">
            <div className="flex items-center justify-between"><span className="font-mono text-sm text-primary">03</span><KeyRound className="size-5 text-muted-foreground" /></div>
            <h3 className="mt-6 text-xl font-semibold tracking-[-0.025em] text-foreground">Authenticate your machine</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Pass the token to the CLI once. GoPort reuses the authenticated session for future tunnels.</p>
            <TerminalCommand command="goport auth <token>" />
          </li>

          <li className="p-6 sm:p-8">
            <div className="flex items-center justify-between"><span className="font-mono text-sm text-primary">04</span><TerminalSquare className="size-5 text-muted-foreground" /></div>
            <h3 className="mt-6 text-xl font-semibold tracking-[-0.025em] text-foreground">Expose your local port</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Run the command with your app's port. GoPort prints the public HTTPS URL when the tunnel is ready.</p>
            <TerminalCommand command="goport http 8080" />
          </li>
        </ol>
      </div>
    </section>
  );
}

export function DocsOverview() {
  return (
    <section id="docs" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-7 lg:py-28">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,34rem)] lg:items-center lg:gap-16">
        <SectionHeader eyebrow="How it works" title="Follow every hop from the public URL to localhost." description="A request reaches GoPort, travels through the CLI's outbound tunnel, and arrives at the local port where your application is listening." align="left" />
        <a
          href={`${GITHUB_URL}#readme`}
          target="_blank"
          rel="noreferrer noopener"
          className="group flex w-full items-center gap-4 rounded-2xl border border-border bg-card/60 p-5 text-left transition-colors hover:border-primary/50 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:max-w-[34rem] lg:justify-self-end"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">Read the GoPort docs</span>
            <span className="mt-1 block text-sm leading-5 text-muted-foreground">Installation, CLI commands, custom subdomains, self-hosting, and architecture.</span>
          </span>
          <ExternalLink className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
        </a>
      </div>
      <div className="mt-10"><TunnelDiagram /></div>
    </section>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-7 lg:py-28">
      <SectionHeader eyebrow="Pricing" title="Start free. Upgrade when the work demands it." description="Use the Free plan for local development, or choose monthly or yearly Pro. Cancel any paid plan at any time." />
      <div className="mt-14 grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <article key={plan.name} className={`relative flex h-full flex-col rounded-2xl border p-7 ${plan.popular ? "border-primary bg-primary/[0.07]" : "border-border bg-card/60"}`}>
            {plan.popular && <span className="absolute right-6 top-6 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">{plan.badge}</span>}
            <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
            <p className="mt-3 max-w-[16rem] text-sm leading-6 text-muted-foreground">{plan.description}</p>
            <div className="relative mt-8 flex items-end gap-1">
              {plan.originalPrice && (
                <p className="absolute bottom-full left-0 mb-1 whitespace-nowrap text-sm text-muted-foreground">
                  Regular price <s className="font-medium decoration-muted-foreground/80 decoration-2">{plan.originalPrice} / year</s>
                </p>
              )}
              <span className="text-5xl font-semibold tracking-[-0.05em] text-foreground">{plan.price}</span>
              {plan.suffix && <span className="mb-1 text-sm text-muted-foreground">{plan.suffix}</span>}
            </div>
            <p className={`mt-4 inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-medium ${plan.popular ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>{plan.billingNote}</p>
            <ul className="my-7 space-y-3 border-y border-border py-6">
              {plan.items.map((item) => <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{item}</li>)}
            </ul>
            <Button asChild variant={plan.popular ? "default" : "outline"} className={`mt-auto w-full rounded-full ${plan.popular ? "bg-primary text-primary-foreground shadow-none hover:bg-primary/90" : "border-border bg-transparent text-foreground shadow-none hover:bg-secondary"}`}><Link href="/signup">{plan.action}</Link></Button>
          </article>
        ))}
      </div>
    </section>
  );
}
