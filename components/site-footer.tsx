import Link from "next/link";
import { GoPortLogo } from "@/components/goport-logo";
import { GitHubIcon } from "@/components/icons";

const GITHUB_URL = "https://github.com/muhammad-deve/GoPort";
const LICENSE_URL = "https://github.com/muhammad-deve/GoPort/blob/main/LICENSE";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <GoPortLogo className="h-6 w-auto text-foreground" />
          <p className="font-mono text-xs leading-relaxed text-muted-foreground">
            Expose localhost. Instantly.
            <br />
            Free &amp; open source.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="#features"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </a>
          <a
            href="#faq"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            FAQ
          </a>
          <Link
            href="/signup"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign up
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GoPort on GitHub"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <GitHubIcon className="size-5" />
          </a>
        </div>
      </div>

      <div className="border-t border-border/40 py-5 text-center font-mono text-xs text-muted-foreground/60">
        © {new Date().getFullYear()} GoPort.{" "}
        <a
          href={LICENSE_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="underline-offset-2 transition-colors hover:text-primary hover:underline"
        >
          MIT Licensed
        </a>
        .
      </div>
    </footer>
  );
}
