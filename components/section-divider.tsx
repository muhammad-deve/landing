import { cn } from "@/lib/utils";

interface SectionDividerProps {
  /** A short monospace marker shown in the middle of the rule, e.g. "01". */
  marker?: string;
  /** Optional tiny label next to the marker, e.g. "features". */
  label?: string;
  className?: string;
}

/**
 * A minimal divider used to clearly separate page sections.
 *
 * It draws a thin gradient hairline that fades in from both edges and meets a
 * small monospace "node" in the center — echoing the tunnel/packet motif used
 * across the site. Keeps the page rhythmic without adding visual weight.
 */
export function SectionDivider({ marker, label, className }: SectionDividerProps) {
  return (
    <div
      aria-hidden
      className={cn("mx-auto flex w-full max-w-6xl items-center gap-4 px-6", className)}
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />

      <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground/70">
        <span className="size-1.5 rounded-full bg-primary/70 shadow-[0_0_8px_1px] shadow-primary/40" />
        {marker ? <span className="text-primary/80">{marker}</span> : null}
        {label ? <span>{label}</span> : null}
      </span>

      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
    </div>
  );
}
