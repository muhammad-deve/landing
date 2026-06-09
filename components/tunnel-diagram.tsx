import { Cloud, Terminal, Globe, MonitorSmartphone } from "lucide-react";

export function TunnelDiagram() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-border/60 bg-card/30 p-6 backdrop-blur sm:p-10">
      <div className="mx-auto mb-12 w-fit rounded-md border border-border/60 bg-background/60 px-3 py-1 font-mono text-xs text-muted-foreground">
        Fig. 1 — Anatomy of a secure tunnel
      </div>

      {/* Animated flow */}
      <div className="flex flex-col items-stretch gap-3">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:flex-nowrap sm:gap-2">
          <FlowNode
            icon={Globe}
            label="HTTP request"
            sublabel="from the internet"
          />

          <FlowConnector />

          <FlowNode
            icon={Cloud}
            label="GoPort Cloud"
            sublabel="secure tunnel"
            highlight
          />

          <FlowConnector dashed />

          <FlowNode
            icon={Terminal}
            label="GoPort CLI agent"
            sublabel="on your machine"
          />

          <FlowConnector />

          <FlowNode
            icon={MonitorSmartphone}
            label="localhost:8080"
            sublabel="your app"
            accent
          />
        </div>

        {/* legend */}
        <div className="mt-4 flex items-center justify-center gap-6 font-mono text-[11px] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            request
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            response
          </span>
        </div>
      </div>

      <p className="mt-10 text-center font-mono text-xs text-muted-foreground/70">
        Your machine becomes a server — instantly, no port forwarding required.
      </p>
    </div>
  );
}

function FlowNode({
  icon: Icon,
  label,
  sublabel,
  highlight,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel: string;
  highlight?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-2 text-center">
      <div
        className={[
          "flex size-16 items-center justify-center rounded-2xl border bg-background/80 transition-colors",
          highlight
            ? "animate-node-pulse border-primary/40 text-primary"
            : accent
              ? "border-primary/30 text-primary"
              : "border-border/70 text-foreground",
        ].join(" ")}
      >
        <Icon className="size-7" />
      </div>
      <div className="leading-tight">
        <div className="font-mono text-xs font-medium text-foreground">{label}</div>
        <div className="font-mono text-[10px] text-muted-foreground">{sublabel}</div>
      </div>
    </div>
  );
}

/**
 * A connector with two animated packets: a primary one moving toward
 * localhost (request) and a sky-blue one moving back (response).
 */
function FlowConnector({ dashed }: { dashed?: boolean }) {
  return (
    <div className="relative h-16 w-full min-w-[2rem] flex-1 sm:w-auto">
      {/* request rail (top) */}
      <div className="absolute left-0 right-0 top-1/2 -mt-1.5 h-px overflow-visible">
        <div
          className={
            dashed
              ? "h-px w-full bg-[repeating-linear-gradient(90deg,var(--primary),var(--primary)_5px,transparent_5px,transparent_11px)] opacity-40"
              : "h-px w-full bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20"
          }
        />
        <span className="animate-packet absolute top-1/2 size-2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_8px_2px] shadow-primary/60" />
      </div>

      {/* response rail (bottom) */}
      <div className="absolute left-0 right-0 top-1/2 mt-1.5 h-px overflow-visible">
        <div
          className={
            dashed
              ? "h-px w-full bg-[repeating-linear-gradient(90deg,var(--color-sky-400,#38bdf8),var(--color-sky-400,#38bdf8)_5px,transparent_5px,transparent_11px)] opacity-30"
              : "h-px w-full bg-gradient-to-r from-sky-400/20 via-sky-400/40 to-sky-400/20"
          }
        />
        <span
          className="animate-packet-reverse absolute top-1/2 size-2 -translate-y-1/2 rounded-full bg-sky-400 shadow-[0_0_8px_2px] shadow-sky-400/50"
          style={{ animationDelay: "1.2s" }}
        />
      </div>
    </div>
  );
}
