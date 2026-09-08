import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GoPortLogo } from "@/components/goport-logo";

interface AuthShellProps {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-5 py-24 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-55 dark:opacity-100"
        style={{ backgroundImage: "url('/sign_in_wave.png')" }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden bg-[#070b10]/70 dark:block" />

      <div className="absolute inset-x-0 top-0 z-20 flex items-center p-5 sm:p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/70 px-3 py-2 text-sm font-medium text-muted-foreground backdrop-blur-xl transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back home
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Link href="/" className="mb-6 transition-opacity hover:opacity-75">
            <GoPortLogo className="h-9 w-auto text-foreground" />
          </Link>
          <h1 className="text-3xl font-semibold tracking-[-0.035em] text-foreground">{title}</h1>
          {subtitle ? <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{subtitle}</p> : null}
        </div>

        <div className="rounded-[1.5rem] border border-border bg-white/90 p-6 shadow-[0_30px_90px_-45px_rgba(11,21,24,0.4)] backdrop-blur-xl dark:border-border/60 dark:bg-card/40 dark:shadow-2xl dark:shadow-black/40 sm:p-7">
          {children}
        </div>

        {footer ? <p className="mt-5 text-center text-sm text-muted-foreground">{footer}</p> : null}
      </div>
    </main>
  );
}
