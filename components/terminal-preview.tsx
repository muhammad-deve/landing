"use client";

import { useEffect, useState } from "react";

const COMMAND = "goport http 8080";

const REQUESTS = [
  { time: "14:32:15", method: "GET", path: "/api/users", status: "202 OK" },
  { time: "14:32:08", method: "POST", path: "/api/auth/login", status: "202 OK" },
  { time: "14:31:52", method: "PUT", path: "/api/users/42", status: "202 OK" },
  { time: "14:31:45", method: "DELETE", path: "/api/posts/17", status: "202 OK" },
];

interface TerminalPreviewProps {
  animated?: boolean;
}

export function TerminalPreview({ animated = true }: TerminalPreviewProps) {
  const [commandLength, setCommandLength] = useState(animated ? 0 : COMMAND.length);
  const [detailsVisible, setDetailsVisible] = useState(!animated);
  const [requestCount, setRequestCount] = useState(animated ? 0 : REQUESTS.length);

  useEffect(() => {
    if (!animated) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCommandLength(COMMAND.length);
      setDetailsVisible(true);
      setRequestCount(REQUESTS.length);
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
  }, [animated]);

  return (
    <div className="terminal-surface w-full overflow-hidden rounded-[1.35rem] border border-primary/20 shadow-[0_24px_70px_-32px_rgba(0,0,0,0.72)]">
      <div className="flex items-center gap-2 border-b border-primary/15 bg-primary/[0.025] px-5 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27ca40]" />
        </div>
        <span className="ml-2 font-mono text-xs text-muted-foreground">terminal</span>
      </div>

      <div className="min-h-[19rem] overflow-x-auto p-5 text-left font-mono text-[13px] leading-relaxed sm:min-h-[22rem] sm:p-6 sm:text-sm">
        <div className="flex">
          <span className="text-muted-foreground">$</span>
          <span className="ml-2 font-semibold text-foreground">{COMMAND.slice(0, commandLength)}</span>
        </div>

        {detailsVisible && (
          <div className={animated ? "animate-in fade-in duration-150" : undefined}>
            <div className="mt-6 min-w-[36rem] space-y-1">
              <TerminalValue label="Dashboard" value="http://127.0.0.1:4040" />
              <TerminalValue label="Region" value="Europe (eu)" />
              <div className="grid grid-cols-[10rem_minmax(24rem,1fr)]">
                <span className="text-muted-foreground">Status</span>
                <span>
                  <span className="text-primary">online</span>
                  <span className="text-muted-foreground"> (133ms)</span>
                </span>
              </div>
              <div className="grid grid-cols-[10rem_minmax(24rem,1fr)]">
                <span className="text-muted-foreground">Forwarding</span>
                <span>
                  <span className="text-primary">https://abc123.goport.uz</span>
                  <span className="text-muted-foreground"> → </span>
                  <span className="font-semibold text-foreground">localhost:8080</span>
                </span>
              </div>
            </div>

            <div className="mt-6 min-w-[36rem]">
              <div className="font-semibold text-foreground">HTTP Requests</div>
              <div className="text-muted-foreground/80">-------------</div>
              <div className="mt-2 space-y-1 text-xs">
                {REQUESTS.slice(0, requestCount).map((request) => (
                  <div key={`${request.time}-${request.method}`} className={animated ? "grid animate-in grid-cols-[5rem_4.5rem_12.5rem_4.5rem] items-center fade-in slide-in-from-bottom-1 duration-300" : "grid grid-cols-[5rem_4.5rem_12.5rem_4.5rem] items-center"}>
                    <span className="text-muted-foreground">{request.time}</span>
                    <span className="text-muted-foreground">{request.method}</span>
                    <span className="font-semibold text-foreground">{request.path}</span>
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

function TerminalValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[10rem_minmax(24rem,1fr)]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground">{value}</span>
    </div>
  );
}
