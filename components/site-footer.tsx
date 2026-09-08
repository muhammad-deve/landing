import { GoPortLogo } from "@/components/goport-logo";

const GITHUB_URL = "https://github.com/muhammad-deve/GoPort";
const LICENSE_URL = "https://github.com/muhammad-deve/GoPort/blob/main/LICENSE";

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Use Cases", href: "#use-cases" },
      { label: "Quickstart", href: "#quickstart" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Docs", href: "#docs" },
      { label: "GitHub", href: GITHUB_URL, external: true },
      { label: "Status", href: "mailto:hello@goport.uz?subject=GoPort%20status" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Contact", href: "mailto:hello@goport.uz" },
      { label: "Privacy", href: "mailto:hello@goport.uz?subject=GoPort%20privacy" },
      { label: "Terms", href: LICENSE_URL, external: true },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-14 sm:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="flex flex-col gap-2">
          <GoPortLogo className="h-6 w-auto text-foreground" />
          <p className="font-mono text-xs leading-relaxed text-muted-foreground">
            Public URLs for local development.
            <br />
            Open source and self-hostable.
          </p>
        </div>

        {FOOTER_LINKS.map((group) => (
          <div key={group.title}>
            <h2 className="mb-4 text-sm font-semibold text-foreground">{group.title}</h2>
            <ul className="space-y-3">
              {group.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noreferrer noopener" : undefined}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border/40 py-5 text-center font-mono text-xs text-muted-foreground/60">
        © {new Date().getFullYear()} GoPort. {" "}
        <a href={LICENSE_URL} target="_blank" rel="noreferrer noopener" className="underline-offset-2 transition-colors hover:text-primary hover:underline">MIT Licensed</a>.
      </div>
    </footer>
  );
}
