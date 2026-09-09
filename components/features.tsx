import { GitFork, Globe2, LayoutDashboard, RadioTower } from "lucide-react";
import { SectionHeader } from "@/components/section-header";

const FEATURES = [
  {
    icon: Globe2,
    title: "A public HTTPS URL without router setup",
    description:
      "The CLI connects outward from your machine, so your local server can receive internet traffic without port forwarding or a public IP.",
  },
  {
    icon: LayoutDashboard,
    title: "Request inspection beside your app",
    description:
      "Review request and response headers, bodies, status codes, and latency in the local dashboard. Replay a captured request after each fix.",
  },
  {
    icon: RadioTower,
    title: "HTTP and WebSocket traffic",
    description:
      "Use the same localhost tunnel for ordinary HTTP requests and connections that upgrade to WebSockets.",
  },
  {
    icon: GitFork,
    title: "Open source and self-hostable",
    description:
      "Inspect the MIT-licensed code, run GoPort on your own infrastructure, and manage the domain used for your tunnels.",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-7 lg:py-28">
      <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:items-start">
        <SectionHeader
          eyebrow="Product"
          title="A localhost tunnel built for the development loop."
          description="GoPort handles the public route while you keep coding, debugging, and testing on your own machine."
          align="left"
        />

        <div className="border-y border-border">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="grid gap-4 border-b border-border py-6 last:border-b-0 sm:grid-cols-[3rem_minmax(12rem,0.8fr)_1.2fr] sm:items-start sm:gap-5">
                <span className="flex size-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <h3 className="text-lg font-semibold leading-7 tracking-[-0.02em] text-foreground">{feature.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
