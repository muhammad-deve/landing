import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Minus } from "lucide-react";
import { MarketingPage, SubpageHero } from "@/components/marketing-page";
import { SectionHeader } from "@/components/section-header";
import { TerminalCommand } from "@/components/terminal-command";
import { Button } from "@/components/ui/button";
import { BENCHMARKS_SOURCE_URL, GITHUB_URL, jsonLd, LICENSE_URL, pageMetadata, SECURITY_MODEL_URL } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Open-Source ngrok Alternative You Can Self-Host",
  description:
    "GoPort is an MIT-licensed ngrok alternative: public HTTPS URLs for localhost, WebSockets, a request inspector with replay, and a server you can run yourself.",
  path: "/ngrok-alternative",
});

const CHECKED_ON = "20 October 2026";

const linkClass = "text-primary underline-offset-2 hover:underline";
const codeClass = "rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[0.85em] text-foreground";

const FACTS = [
  { label: "License", value: "MIT. Source for the CLI, the tunnel server and this website is public on GitHub." },
  { label: "Hosted or self-hosted", value: "Use goport.uz on the Free or Pro plan, or run the same server code on your own machine." },
  { label: "Public URL", value: "HTTPS on a subdomain such as abc123.goport.uz. TLS is handled on the server, so you need no certificate locally." },
  { label: "Protocols", value: "HTTP and WebSocket. Raw TCP and UDP tunnels are not supported." },
  { label: "Request inspector", value: "A local web UI at 127.0.0.1:4040 that shows each request and response, replays a request, and copies it as cURL." },
  { label: "Subdomains", value: "Random by default and reused when you restart. Custom names such as myapp.goport.uz are a Pro feature." },
  { label: "Reconnects", value: "Since 0.1.8 the CLI reconnects by itself after Wi-Fi drops or sleep and keeps the same URL." },
  { label: "Platforms", value: "Windows x64, macOS (Intel and Apple Silicon) and Linux x64. Other targets can build from source." },
];

type Cell = { text: string; yes?: boolean; no?: boolean };

const TOOLS = ["GoPort", "ngrok", "frp", "LocalTunnel", "zrok", "Cloudflare Tunnel"] as const;

const COMPARISON: Array<{ row: string; cells: Cell[] }> = [
  {
    row: "Source license",
    cells: [
      { text: "MIT" },
      { text: "Closed-source agent. The old v1 was Apache-2.0 and is archived." },
      { text: "Apache-2.0" },
      { text: "MIT (client and server)" },
      { text: "Apache-2.0" },
      { text: "cloudflared is Apache-2.0. The network side is Cloudflare's." },
    ],
  },
  {
    row: "Run the server yourself",
    cells: [
      { text: "Yes, with Docker Compose", yes: true },
      { text: "No", no: true },
      { text: "Yes (frps). This is the only way to use it.", yes: true },
      { text: "Yes (localtunnel/server)", yes: true },
      { text: "Yes, a Docker Compose stack built on OpenZiti", yes: true },
      { text: "No", no: true },
    ],
  },
  {
    row: "Hosted service",
    cells: [
      { text: "goport.uz, Free and Pro plans" },
      { text: "Yes, including a free plan with limits" },
      { text: "No official service" },
      { text: "Free public server (loca.lt)" },
      { text: "zrok.io free plan, run by NetFoundry" },
      { text: "Yes, on all Cloudflare plans" },
    ],
  },
  {
    row: "Account for the hosted service",
    cells: [
      { text: "Yes (CLI token)" },
      { text: "Yes (authtoken)" },
      { text: "Not applicable" },
      { text: "No" },
      { text: "Yes" },
      { text: "Quick Tunnels: no. Named tunnels: yes." },
    ],
  },
  {
    row: "HTTPS without your own certificate",
    cells: [
      { text: "Hosted: yes. Self-hosted: you supply a wildcard certificate." },
      { text: "Yes", yes: true },
      { text: "No. Bring certificates or use the https2http plugin.", no: true },
      { text: "Hosted: yes. Self-hosted: put a TLS proxy in front." },
      { text: "Self-hosted: optional Caddy TLS setup" },
      { text: "Yes", yes: true },
    ],
  },
  {
    row: "WebSocket",
    cells: [
      { text: "Yes", yes: true },
      { text: "Yes", yes: true },
      { text: "Yes, through HTTP or TCP proxies", yes: true },
      { text: "Yes", yes: true },
      { text: "Yes", yes: true },
      { text: "Yes", yes: true },
    ],
  },
  {
    row: "Request inspector with replay",
    cells: [
      { text: "Yes, local at 127.0.0.1:4040", yes: true },
      { text: "Yes, local at localhost:4040, with edit before replay", yes: true },
      { text: "No. The dashboard shows per-proxy statistics.", no: true },
      { text: "No", no: true },
      { text: "None documented", no: true },
      { text: "None documented", no: true },
    ],
  },
  {
    row: "Raw TCP or UDP",
    cells: [
      { text: "No. HTTP and WebSocket only.", no: true },
      { text: "TCP and TLS endpoints (TCP on Free needs a verified card). No UDP endpoint is documented." },
      { text: "TCP and UDP", yes: true },
      { text: "No", no: true },
      { text: "Private shares only, not public" },
      { text: "TCP with cloudflared on the client side too. UDP through WARP private networking." },
    ],
  },
  {
    row: "Your own name or domain",
    cells: [
      { text: "Custom goport.uz subdomain on Pro. Any domain when self-hosted." },
      { text: "One assigned dev domain on Free. Your own domain from the Pay-as-you-go plan." },
      { text: "Any domain, on your server and DNS" },
      { text: "You can request a subdomain, but it is not reserved" },
      { text: "Reserved shares with a custom name" },
      { text: "Your domain, managed in Cloudflare" },
    ],
  },
];

const SOURCES = [
  { label: "ngrok FAQ (agent source)", href: "https://ngrok.com/docs/faq" },
  { label: "ngrok pricing", href: "https://ngrok.com/pricing" },
  { label: "ngrok web inspection interface", href: "https://ngrok.com/docs/agent/web-inspection-interface/" },
  { label: "frp README", href: "https://github.com/fatedier/frp" },
  { label: "LocalTunnel client", href: "https://github.com/localtunnel/localtunnel" },
  { label: "LocalTunnel server", href: "https://github.com/localtunnel/server" },
  { label: "zrok repository", href: "https://github.com/openziti/zrok" },
  { label: "zrok.io pricing", href: "https://zrok.io/pricing" },
  { label: "Cloudflare Tunnel docs", href: "https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/" },
  { label: "cloudflared repository", href: "https://github.com/cloudflare/cloudflared" },
];

const GOOD_FIT = [
  "You want to read, audit or fork both the client and the tunnel server, under the MIT license.",
  "You test webhooks locally and want to see and replay each delivery on your own machine.",
  "Your dev server uses WebSockets. Next.js hot reload works through the tunnel.",
  "You want the same URL after a restart or a dropped connection, without paying for a reserved domain.",
  "You want a low-cost hosted plan (Pro is $2.99 a month) or would rather run the server yourself.",
];

const NOT_A_FIT = [
  "You need raw TCP or UDP, for example SSH, a database or a game server. GoPort forwards HTTP and WebSocket only.",
  "Your tunneled traffic is sensitive. The link between the GoPort server and the CLI is plain TCP today, not TLS, so anyone on that network path can read tunneled requests and your token.",
  "You or your visitors are far from Europe. The hosted service runs in one region, in France, and every request goes there and back to your machine.",
  "You need SSO, IP allow-lists or an authentication layer in front of the tunnel. GoPort has none of these.",
  "You need Linux on ARM, such as a Raspberry Pi. Releases cover Linux x64 only, so you would build from source.",
  "You need an uptime SLA. GoPort is a young project; its first release was in June 2026.",
];

const INSTALL = [
  { os: "macOS (Homebrew)", command: "brew install muhammad-deve/goport/goport" },
  { os: "Windows (Chocolatey)", command: "choco install goport" },
  {
    os: "Windows (Scoop)",
    command: "scoop bucket add goport https://github.com/muhammad-deve/scoop-goport\nscoop install goport",
  },
  {
    os: "Linux x64",
    command:
      "sudo curl -fsSL -o /usr/local/bin/goport https://github.com/muhammad-deve/GoPort/releases/latest/download/goport-linux-amd64\nsudo chmod +x /usr/local/bin/goport",
  },
];

const FAQ = [
  {
    q: "Is GoPort a free ngrok alternative?",
    a: "The hosted Free plan costs nothing and needs no card: 1 active tunnel, 5 GB of traffic a month and a random goport.uz subdomain. Pro costs $2.99 a month or $19.99 a year. The software is MIT licensed, so running your own server costs only the server.",
  },
  {
    q: "Is GoPort open source?",
    a: "Yes. The project is released under the MIT license, and the CLI, the tunnel server and the website are public repositories on GitHub.",
  },
  {
    q: "Can I self-host GoPort?",
    a: "Yes. You need a server with a public IP, a domain with a wildcard DNS record, a wildcard TLS certificate and Docker Compose. Point the CLI at it with GOPORT_SERVER_ADDR, GOPORT_DOMAIN and GOPORT_API_URL. The server code applies the Free and Pro plan limits to every account, including on your own server, and you can change them in the backend source before you build.",
  },
  {
    q: "Does GoPort support WebSockets?",
    a: "Yes. Upgrade requests pass through the tunnel, so WebSocket apps and Next.js hot reload work.",
  },
  {
    q: "Can GoPort tunnel TCP or UDP?",
    a: "No. GoPort forwards HTTP and WebSocket traffic only. For SSH, databases or UDP services, use a tool with TCP or UDP tunnels such as frp.",
  },
  {
    q: "Can I inspect and replay webhook requests?",
    a: "Yes. While a tunnel runs, open http://127.0.0.1:4040 to see each request and response, replay a request against your local app, or copy it as a cURL command. The inspector keeps the last 500 requests in memory on your machine and stores bodies up to 256 KiB each.",
  },
  {
    q: "Is traffic encrypted end to end?",
    a: "No. Visitors connect to the GoPort server over HTTPS, and TLS ends there. The connection between the server and your CLI is currently plain TCP, so the server can read tunneled traffic, and so can anyone on the network path between the server and your machine.",
  },
  {
    q: "Which operating systems are supported?",
    a: "Release builds exist for Windows x64, macOS on Intel and Apple Silicon, and Linux x64. You can install with Homebrew, Chocolatey, Scoop, the Windows installer or a direct download.",
  },
  {
    q: "Do I need an account?",
    a: "Yes. The CLI needs a token, which you create in the dashboard and save once with goport auth <token>. A self-hosted server works the same way, with accounts on your own server.",
  },
];

const RELATED = [
  { label: "Quickstart", href: "/quickstart", body: "Install, authenticate and open a tunnel in four steps." },
  { label: "Documentation", href: "/docs", body: "How a request travels from the public URL to localhost." },
  { label: "Self-hosting guide", href: "/self-hosting", body: "Run the tunnel server on your own domain." },
  { label: "Pricing", href: "/pricing", body: "What the Free and Pro plans include." },
  {
    label: "Benchmarks",
    href: BENCHMARKS_SOURCE_URL,
    body: "Scripts to measure latency and throughput yourself, with the method and raw results.",
    external: true,
  },
  { label: "Use cases", href: "/use-cases", body: "Webhooks, OAuth callbacks, mobile testing and client previews." },
  { label: "Source on GitHub", href: GITHUB_URL, body: "The CLI, the tunnel server and this website.", external: true },
  { label: "Security model", href: SECURITY_MODEL_URL, body: "What is encrypted, what the server sees and what to watch for.", external: true },
];

function CellContent({ cell }: { cell: Cell }) {
  return (
    <span className="flex items-start gap-2">
      {cell.yes && <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />}
      {cell.no && <Minus className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />}
      <span>{cell.text}</span>
    </span>
  );
}

export default function NgrokAlternativePage() {
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <MarketingPage>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqStructuredData) }} />

      <SubpageHero
        section="ngrok-alternative"
        title="GoPort: Open-Source ngrok Alternative You Can Self-Host"
        description="GoPort gives an app on your machine a public HTTPS URL with one command. It is MIT licensed, has a local request inspector with replay, and runs on goport.uz or on your own server."
        command="$ goport http 8080"
        output="https://abc123.goport.uz  →  localhost:8080"
      />

      <section className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-7 lg:py-18">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <SectionHeader eyebrow="What GoPort is" title="A localhost tunnel with nothing hidden." align="left" />
            <div className="mt-6 space-y-4 text-base leading-7 text-muted-foreground">
              <p>
                Run <code className={codeClass}>goport http 8080</code> and the app on port 8080 becomes reachable at a
                link like <code className={codeClass}>https://abc123.goport.uz</code>. You need no public IP, port
                forwarding or router settings, because the CLI makes the connection outward.
              </p>
              <p>
                The CLI opens one TCP connection to the GoPort server on port 7000 and keeps it open. When a request
                arrives for your subdomain, the server opens a new{" "}
                <a href="https://github.com/hashicorp/yamux" target="_blank" rel="noreferrer noopener" className={linkClass}>
                  yamux
                </a>{" "}
                stream on that connection. The CLI passes it to your local port and sends the response back the same
                way. The original <code className={codeClass}>Host</code> header is kept.
              </p>
              <p>
                The code is released under the{" "}
                <a href={LICENSE_URL} target="_blank" rel="noreferrer noopener" className={linkClass}>
                  MIT license
                </a>
                , and the hosted service runs the same server code you can deploy yourself.
              </p>
            </div>
          </div>

          <dl className="grid gap-px overflow-hidden rounded-[1.5rem] border border-border bg-border sm:grid-cols-2">
            {FACTS.map((fact) => (
              <div key={fact.label} className="bg-card p-5 sm:p-6">
                <dt className="font-mono text-xs text-primary">{fact.label}</dt>
                <dd className="mt-2 text-sm leading-6 text-muted-foreground">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="comparison" className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-7 lg:py-18">
        <SectionHeader
          eyebrow="Comparison"
          title="GoPort, ngrok, frp, LocalTunnel, zrok and Cloudflare Tunnel."
          description={`Facts only, checked on ${CHECKED_ON} against each project's official documentation, pricing page or source code. Products change, so follow the sources before you decide.`}
          align="left"
          className="max-w-3xl"
        />

        <div className="mt-10 overflow-x-auto rounded-[1.5rem] border border-border bg-card/60">
          <table className="w-full min-w-[60rem] border-collapse text-left text-sm">
            <caption className="sr-only">Feature comparison of GoPort and other tunneling tools</caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="w-44 p-4 font-medium text-muted-foreground">
                  Feature
                </th>
                {TOOLS.map((tool) => (
                  <th
                    key={tool}
                    scope="col"
                    className={`p-4 font-semibold ${tool === "GoPort" ? "bg-primary/[0.07] text-primary" : "text-foreground"}`}
                  >
                    {tool}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((item) => (
                <tr key={item.row} className="border-b border-border align-top last:border-b-0">
                  <th scope="row" className="p-4 font-medium text-foreground">
                    {item.row}
                  </th>
                  {item.cells.map((cell, index) => (
                    <td
                      key={TOOLS[index]}
                      className={`p-4 leading-6 text-muted-foreground ${index === 0 ? "bg-primary/[0.07] text-foreground" : ""}`}
                    >
                      <CellContent cell={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <p className="text-xs font-medium text-muted-foreground">Sources</p>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs">
            {SOURCES.map((source) => (
              <li key={source.href}>
                <a href={source.href} target="_blank" rel="noreferrer noopener" className={linkClass}>
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-7 lg:py-18">
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-2xl border border-primary/25 bg-primary/[0.05] p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-[-0.035em] text-foreground">When GoPort is a good choice</h2>
            <ul className="mt-6 space-y-4">
              {GOOD_FIT.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold tracking-[-0.035em] text-foreground">When it may not be the best choice</h2>
            <ul className="mt-6 space-y-4">
              {NOT_A_FIT.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                  <Minus className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm leading-6 text-muted-foreground">
              Read the{" "}
              <a href={SECURITY_MODEL_URL} target="_blank" rel="noreferrer noopener" className={linkClass}>
                security model
              </a>{" "}
              for what each hop protects and what the server can see.
            </p>
          </article>
        </div>
      </section>

      <section id="install" className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-7 lg:py-18">
        <SectionHeader
          eyebrow="Install"
          title="Install the CLI, then open a tunnel."
          description="Pick the line for your system. The Windows installer from the latest release also works and adds goport to your PATH."
          align="left"
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {INSTALL.map((item) => (
            <article key={item.os} className="min-w-0 rounded-2xl border border-border bg-card/60 p-6">
              <h3 className="text-base font-semibold text-foreground">{item.os}</h3>
              <TerminalCommand command={item.command} />
            </article>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-border bg-card/60 p-6">
          <h3 className="text-base font-semibold text-foreground">Connect your account and start a tunnel</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Copy a token from the Tokens page of your dashboard. The token is saved on your machine, so you do this once.
            Then pass the port your app listens on.
          </p>
          <TerminalCommand command={"goport auth <token>\ngoport http 8080"} />
        </div>
      </section>

      <section id="webhooks" className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-7 lg:py-18">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <SectionHeader
            eyebrow="Example"
            title="Test a webhook against local code."
            description="Payment providers, GitHub and Telegram deliver events to a public URL, and most require HTTPS. Give them your GoPort URL while the handler still runs on your machine."
            align="left"
          />
          <ol className="overflow-hidden rounded-[1.5rem] border border-border bg-card/60">
            <li className="border-b border-border p-6">
              <h3 className="text-base font-semibold text-foreground">1. Start your app and the tunnel</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                With your handler listening on port 3000, start a tunnel to that port.
              </p>
              <TerminalCommand command="goport http 3000" />
            </li>
            <li className="border-b border-border p-6">
              <h3 className="text-base font-semibold text-foreground">2. Register the public URL with the provider</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Use the printed link plus your route as the webhook endpoint, for example{" "}
                <code className={codeClass}>https://abc123.goport.uz/webhooks/payments</code>. You can send a test
                delivery yourself first:
              </p>
              <TerminalCommand
                command={`curl -X POST https://abc123.goport.uz/webhooks/payments -H "Content-Type: application/json" -d '{"event":"ping"}'`}
              />
            </li>
            <li className="p-6">
              <h3 className="text-base font-semibold text-foreground">3. Inspect and replay</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Open <code className={codeClass}>http://127.0.0.1:4040</code> to see the headers and body of each
                delivery and your app&apos;s response. After you fix the handler, replay the delivery instead of
                triggering a new event. A replay goes straight to your local app, not through the public URL, and uses
                the stored body, which is cut off at 256 KiB.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section id="self-hosting" className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-7 lg:py-18">
        <div className="grid gap-8 rounded-[1.5rem] border border-border bg-card/60 p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">Self-hosting</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
              Run the tunnel server on your own domain.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              The server is a Go application built on PocketBase. It listens on TCP 7000 for CLI connections and serves
              the API and the tunneled requests over HTTP behind a reverse proxy such as nginx, which holds your
              wildcard certificate. Docker Compose starts the server and the dashboard.
            </p>
            <ul className="mt-5 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground marker:text-primary">
              <li>A server with a public IP</li>
              <li>A domain with a wildcard DNS record, such as *.example.com</li>
              <li>A wildcard TLS certificate (certbot with a DNS-01 challenge)</li>
              <li>Docker Compose and a reverse proxy in front of the server</li>
              <li>A Resend API key for sign-up emails, or accounts created in the PocketBase admin UI</li>
            </ul>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              The server code applies the Free and Pro plan limits to every account, including on your own server. Change
              them in <code className={codeClass}>backend/app/internal/model/billing.go</code> before you build. Until
              the CLI link supports TLS, allow port 7000 only from networks you trust, or reach it over a VPN.
            </p>
          </div>
          <div className="flex min-w-0 flex-col">
            <p className="text-sm leading-6 text-muted-foreground">
              Then point the CLI at your server. Only these environment variables change, so the commands stay the same.
            </p>
            <TerminalCommand
              command={
                "export GOPORT_SERVER_ADDR=tunnel.example.com:7000\nexport GOPORT_DOMAIN=example.com\nexport GOPORT_API_URL=https://back.example.com"
              }
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full bg-primary px-6 text-primary-foreground shadow-none hover:bg-primary/90">
                <Link href="/self-hosting">
                  Self-hosting guide <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-border bg-transparent px-6 text-foreground shadow-none hover:bg-secondary">
                <a href={GITHUB_URL} target="_blank" rel="noreferrer noopener">
                  Source on GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-14 sm:px-7 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)] lg:py-18">
        <SectionHeader
          eyebrow="FAQ"
          title="Questions about switching from ngrok."
          align="left"
          className="lg:sticky lg:top-28 lg:self-start"
        />
        <dl className="border-y border-border">
          {FAQ.map((item) => (
            <div key={item.q} className="border-b border-border py-5 last:border-b-0">
              <dt className="text-base font-medium text-foreground">{item.q}</dt>
              <dd className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-20 pt-6 sm:px-7">
        <h2 className="text-sm font-medium text-primary">Read next</h2>
        <ul className="mt-5 grid gap-px overflow-hidden rounded-[1.5rem] border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {RELATED.map((item) => (
            <li key={item.href} className="bg-card">
              <a
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noreferrer noopener" : undefined}
                className="group block h-full p-6 transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <span className="flex items-center gap-1.5 text-base font-semibold text-foreground group-hover:text-primary">
                  {item.label}
                  {item.external && <ArrowUpRight className="size-3.5 opacity-50" aria-hidden />}
                </span>
                <span className="mt-2 block text-sm leading-6 text-muted-foreground">{item.body}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </MarketingPage>
  );
}
