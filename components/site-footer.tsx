import { ArrowUpRight, Github, Radio } from "lucide-react";
import { GoPortLogo } from "@/components/goport-logo";

const GITHUB_URL = "https://github.com/muhammad-deve/GoPort";
const LICENSE_URL = `${GITHUB_URL}/blob/main/LICENSE`;

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Use cases", href: "#use-cases" },
      { label: "Quickstart", href: "#quickstart" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "#docs" },
      { label: "Source code", href: GITHUB_URL, external: true },
      { label: "MIT license", href: LICENSE_URL, external: true },
    ],
  },
  {
    title: "GoPort",
    links: [
      { label: "FAQ", href: "#faq" },
      { label: "Contact", href: "mailto:muhammadgo.deve@gmail.com" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_18%_0%,color-mix(in_srgb,var(--primary)_9%,transparent),transparent_45%)]"
      />

      <div className="relative mx-auto w-full max-w-7xl px-5 sm:px-7">
        <div className="grid gap-9 py-10 lg:grid-cols-[minmax(15rem,1.35fr)_minmax(0,1.65fr)] lg:gap-16 lg:py-12">
          <div className="max-w-sm">
            <GoPortLogo className="h-7 w-auto text-foreground" />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Open-source tunneling for webhooks, APIs, mobile testing, and client previews.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-xs text-muted-foreground">
              <Radio className="size-3.5 text-primary" />
              <span className="size-1.5 rounded-full bg-primary shadow-[0_0_10px_color-mix(in_srgb,var(--primary)_70%,transparent)]" />
              GoPort network operational
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-9 sm:grid-cols-3">
            {FOOTER_LINKS.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-foreground">{group.title}</h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noreferrer noopener" : undefined}
                        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {link.label}
                        {link.external && <ArrowUpRight className="size-3 opacity-45 transition-opacity group-hover:opacity-100" />}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono">© {new Date().getFullYear()} GoPort</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href={LICENSE_URL} target="_blank" rel="noreferrer noopener" className="transition-colors hover:text-foreground">MIT licensed</a>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"><Github className="size-3.5" />GitHub</a>
            <a href="mailto:muhammadgo.deve@gmail.com" className="transition-colors hover:text-foreground">muhammadgo.deve@gmail.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
