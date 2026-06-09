import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { GoPortLogo } from "@/components/goport-logo";
import { PageBackground } from "@/components/page-background";

interface AuthShellProps {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <PageBackground />

      <Link
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back home
      </Link>

      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-8 transition-opacity hover:opacity-80">
            <GoPortLogo className="h-8 w-auto text-foreground" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/40 p-8 shadow-2xl shadow-black/40 backdrop-blur">
          {children}
        </div>

        {footer ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        ) : null}
      </div>
    </div>
  );
}
