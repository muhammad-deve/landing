import { EarlyAccessForm } from "@/components/early-access-form";
import { TerminalPreview } from "@/components/terminal-preview";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background overflow-hidden">
      {/* Diagonal dashed lines background */}
      <div className="pointer-events-none absolute inset-0">
        <svg
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="diagonal-lines"
              patternUnits="userSpaceOnUse"
              width="60"
              height="60"
              patternTransform="rotate(-45)"
            >
              <line
                x1="0"
                y1="0"
                x2="60"
                y2="0"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="8 12"
                className="text-primary/10"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
        </svg>
      </div>

      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="flex w-full max-w-4xl flex-col items-center gap-12 text-center">
          {/* Hero */}
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Expose localhost. Instantly.
            </h1>
            <p className="max-w-md text-lg text-muted-foreground">
              Self-hosted tunneling tool for developers
            </p>
          </div>

          {/* Early Access Form */}
          <div className="flex w-full flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Get notified when we launch
            </p>
            <EarlyAccessForm />
          </div>

          {/* Terminal Preview */}
          <TerminalPreview />
        </div>
      </main>
    </div>
  );
}
