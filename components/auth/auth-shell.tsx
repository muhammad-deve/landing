import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GoPortLogo } from "@/components/goport-logo";
import { ThemeToggle } from "@/components/theme-toggle";

interface AuthShellProps {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f6fafa] px-5 py-24 dark:bg-[#070b10] sm:px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 dark:hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(11,21,24,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(11,21,24,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute left-1/2 top-[-18rem] h-[42rem] w-[52rem] -translate-x-1/2 rounded-full bg-primary/[0.12] blur-[110px]" />
        <div className="absolute inset-x-[12%] top-[22%] h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        <span className="absolute left-[28%] top-[calc(22%_-_3px)] size-2 rounded-full bg-primary/60 shadow-[0_0_16px] shadow-primary/50" />
        <span className="absolute right-[31%] top-[calc(22%_-_3px)] size-2 rounded-full bg-sky-400/60 shadow-[0_0_16px] shadow-sky-400/40" />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden bg-cover bg-center bg-no-repeat dark:block"
        style={{ backgroundImage: "url('/sign_in_wave.png')" }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden bg-[#070b10]/70 dark:block" />

      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-5 sm:p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/70 px-3 py-2 text-sm font-medium text-muted-foreground backdrop-blur-xl transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back home
        </Link>
        <ThemeToggle />
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
