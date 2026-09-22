"use client";

import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const COMMAND = "goport http 8080";

const REQUESTS = [
  { time: "14:32:15", method: "GET", path: "/api/users", status: "200 OK" },
  { time: "14:32:08", method: "POST", path: "/api/auth/login", status: "200 OK" },
  { time: "14:31:52", method: "PUT", path: "/api/users/42", status: "200 OK" },
  { time: "14:31:45", method: "DELETE", path: "/api/posts/17", status: "200 OK" },
];

interface TerminalPreviewProps {
  animated?: boolean;
}

export function TerminalPreview({ animated = true }: TerminalPreviewProps) {
  const [commandLength, setCommandLength] = useState(animated ? 0 : COMMAND.length);
  const [detailsVisible, setDetailsVisible] = useState(!animated);
  const [requestCount, setRequestCount] = useState(animated ? 0 : REQUESTS.length);
  const [paused, setPaused] = useState(false);
  // Hover or keyboard focus suspends the loop so the pane holds still while
  // someone is actually reading it.
  const [suspended, setSuspended] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (!animated) return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [animated]);

  /** Final, fully readable state — what a stopped or reduced-motion pane shows. */
  const showComplete = useCallback(() => {
    setCommandLength(COMMAND.length);
    setDetailsVisible(true);
    setRequestCount(REQUESTS.length);
  }, []);

  const stopped = paused || suspended;

  useEffect(() => {
    if (!animated) return;

    if (reducedMotion || stopped) {
      showComplete();
      return;
    }

    const timeouts: number[] = [];
    let typeTimer: number | undefined;

    const runCycle = () => {
      if (typeTimer) window.clearInterval(typeTimer);
      timeouts.forEach((timer) => window.clearTimeout(timer));
      timeouts.length = 0;

      setCommandLength(0);
      setDetailsVisible(false);
      setRequestCount(0);

      typeTimer = window.setInterval(() => {
        setCommandLength((length) => {
          if (length >= COMMAND.length) {
            if (typeTimer) window.clearInterval(typeTimer);
            return length;
          }
          return length + 1;
        });
      }, 55);

      timeouts.push(
        window.setTimeout(() => setDetailsVisible(true), COMMAND.length * 55 + 220),
        ...REQUESTS.map((_, index) =>
          window.setTimeout(() => setRequestCount(index + 1), COMMAND.length * 55 + 600 + index * 500),
        ),
        window.setTimeout(runCycle, COMMAND.length * 55 + 600 + REQUESTS.length * 500 + 2400),
      );
    };

    runCycle();

    return () => {
      if (typeTimer) window.clearInterval(typeTimer);
      timeouts.forEach((timer) => window.clearTimeout(timer));
    };
  }, [animated, reducedMotion, stopped, showComplete]);

  // Nothing moves when the caller disabled animation or the OS asks for reduced
  // motion, so no stop control is needed in those cases.
  const showPauseControl = animated && !reducedMotion;

  return (
    <div
      className="terminal-surface w-full min-w-0 overflow-hidden rounded-[1.35rem] border border-primary/20 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.72)]"
      onMouseEnter={() => setSuspended(true)}
      onMouseLeave={() => setSuspended(false)}
      onFocusCapture={() => setSuspended(true)}
      onBlurCapture={() => setSuspended(false)}
    >
      <div className="flex items-center gap-2 border-b border-primary/15 bg-primary/[0.025] px-5 py-3">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27ca40]" />
        </div>
        <span className="ml-2 font-mono text-xs text-muted-foreground">terminal</span>
        {showPauseControl && (
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            aria-pressed={paused}
            aria-label={paused ? "Play the terminal demo" : "Pause the terminal demo"}
            title={paused ? "Play the terminal demo" : "Pause the terminal demo"}
            className="ml-auto flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
          </button>
        )}
      </div>

      <div className="min-h-[19rem] p-5 text-left font-mono text-[13px] leading-relaxed sm:min-h-[22rem] sm:p-6 sm:text-sm">
        <div className="flex">
          <span className="text-muted-foreground">$</span>
          <span className="ml-2 font-semibold text-foreground">{COMMAND.slice(0, commandLength)}</span>
        </div>

        {detailsVisible && (
          <div className={animated ? "animate-in fade-in duration-150" : undefined}>
            <div className="mt-6 space-y-1">
              <TerminalValue label="Dashboard" value="http://127.0.0.1:4040" />
              <TerminalValue label="Region" value="Europe (eu)" />
              <TerminalRow label="Status">
                <span className="text-primary">online</span>
                <span className="text-muted-foreground"> (133ms)</span>
              </TerminalRow>
              <TerminalRow label="Forwarding">
                <span className="break-all text-primary">https://abc123.goport.uz</span>
                <span className="text-muted-foreground"> &rarr; </span>
                <span className="break-all font-semibold text-foreground">localhost:8080</span>
              </TerminalRow>
            </div>

            <div className="mt-6">
              <div className="font-semibold text-foreground">HTTP Requests</div>
              <div className="text-muted-foreground/80">-------------</div>
              <div className="mt-2 space-y-1 text-xs">
                {REQUESTS.slice(0, requestCount).map((request) => (
                  <div
                    key={`${request.time}-${request.method}`}
                    className={`grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-x-2 sm:gap-x-3 ${animated ? "animate-in fade-in slide-in-from-bottom-1 duration-300" : ""}`}
                  >
                    <span className="text-muted-foreground">{request.time}</span>
                    <span className="text-muted-foreground">{request.method}</span>
                    <span className="truncate font-semibold text-foreground">{request.path}</span>
                    <span className="font-semibold text-primary">{request.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Label/value row. The value column is `minmax(0,1fr)` rather than a fixed
 * `24rem` so long URLs wrap inside the card instead of widening the page.
 */
function TerminalRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-2 sm:grid-cols-[7rem_minmax(0,1fr)]">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0">{children}</span>
    </div>
  );
}

function TerminalValue({ label, value }: { label: string; value: string }) {
  return (
    <TerminalRow label={label}>
      <span className="break-all font-semibold text-foreground">{value}</span>
    </TerminalRow>
  );
}
