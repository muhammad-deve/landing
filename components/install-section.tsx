import { Check, ExternalLink } from "lucide-react";
import { InstallCommand } from "@/components/install-command";
import { SectionHeader } from "@/components/section-header";

const GITHUB_RELEASES = "https://github.com/muhammad-deve/GoPort#installation";

export function InstallSection() {
  return (
    <section id="install" className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-20 sm:px-7 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:py-28">
      <div>
        <SectionHeader align="left" title="Install GoPort on the machine where your app runs." description="Choose your platform, copy one command, then authenticate the CLI and open a route." />
        <ul className="mt-7 space-y-3 text-sm text-muted-foreground">
          {["Native commands for macOS, Windows, and Linux", "No router or firewall changes", "Updates and source published on GitHub"].map((item) => <li key={item} className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0 text-primary" />{item}</li>)}
        </ul>
        <a href={GITHUB_RELEASES} target="_blank" rel="noreferrer noopener" className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-foreground underline decoration-primary/60 underline-offset-4 hover:decoration-primary">All installation options <ExternalLink className="size-3.5" /></a>
      </div>
      <InstallCommand />
    </section>
  );
}
