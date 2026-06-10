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
    <div
      className="relative flex min-h-screen flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-8"
      style={{ backgroundImage: "url('/sign_in_wave.png')" }}
    >
      {/* darken so the form stays readable */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[#070b10]/70" />

      <Link
        href="/"
        className="absolute left-6 top-6 z-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back home
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-5 flex flex-col items-center text-center">
          <Link href="/" className="mb-5 transition-opacity hover:opacity-80">
            <GoPortLogo className="h-8 w-auto text-foreground" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/40 p-6 shadow-2xl shadow-black/40 backdrop-blur">
          {children}
        </div>

        {footer ? (
          <p className="mt-4 text-center text-sm text-muted-foreground">{footer}</p>
        ) : null}
      </div>
    </div>
  );
}
