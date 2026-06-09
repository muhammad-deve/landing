import { ArrowRight } from "lucide-react";
import { InstallCommand } from "@/components/install-command";

const GITHUB_RELEASES = "https://github.com/muhammad-deve/GoPort#installation";

export function InstallSection() {
  return (
    <section className="relative mx-auto w-full max-w-3xl px-6 py-24">
      <div className="flex flex-col items-center text-center">
        <h2 className="text-balance text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
          Try GoPort by sharing a local app.{" "}
          <span className="bg-gradient-to-r from-primary to-emerald-300 bg-clip-text italic text-transparent">
            Right now.
          </span>
        </h2>

        {/* Centered install command */}
        <div className="mt-12 flex w-full justify-center">
          <InstallCommand />
        </div>

        <a
          href={GITHUB_RELEASES}
          target="_blank"
          rel="noreferrer noopener"
          className="group mt-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-primary"
        >
          Download &amp; setup instructions
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </section>
  );
}
