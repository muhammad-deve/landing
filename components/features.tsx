import {
  Globe,
  Gift,
  GitFork,
  ServerCog,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    icon: Globe,
    title: "Custom domains",
    description:
      "Bring your own subdomain like myapp.goport.uz, or wire up a fully custom domain. Memorable URLs, no extra config.",
  },
  {
    icon: Gift,
    title: "Completely free",
    description:
      "No metered tunnels, no paywalled features, no surprise bills. Run as many tunnels as you need at zero cost.",
  },
  {
    icon: GitFork,
    title: "Open source",
    description:
      "MIT licensed and self-hostable. Audit the code, fork it, and keep your tunnels and infrastructure fully under your control.",
  },
  {
    icon: ServerCog,
    title: "Your computer, a server",
    description:
      "Turn any local machine into a publicly reachable server in seconds — no port forwarding, firewall changes, or public IP.",
  },
  {
    icon: LayoutDashboard,
    title: "Clean dashboard",
    description:
      "Inspect live requests, responses, latency, and tunnel status from a clean dashboard and admin panel on localhost.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    description:
      "Encrypted, outbound-only connections multiplexed over a single TCP stream. WebSockets and streaming just work.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative mx-auto w-full max-w-6xl px-6 py-24">
      <div className="mx-auto mb-16 max-w-3xl text-center">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
          Why GoPort
        </span>
        <h2 className="mt-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Everything you need to ship from localhost
        </h2>
        <p className="mt-5 text-pretty text-lg text-muted-foreground">
          The power of a hosted tunneling service, without the lock-in or the bill.
        </p>
      </div>

      <div className="grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/40 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className="group relative bg-card/40 p-8 transition-colors duration-300 hover:bg-card/80"
            >
              <div className="mb-5 flex size-11 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_24px_-6px] group-hover:shadow-primary/50">
                <Icon className="size-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-primary to-transparent transition-transform duration-300 group-hover:scale-x-100" />
            </div>
          );
        })}
      </div>
    </section>
  );
}
