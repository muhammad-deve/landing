"use client";

import { useState } from "react";
import { CreditCard, KeyRound, Laptop, Smartphone, Webhook, type LucideIcon } from "lucide-react";

const PUBLIC_HOST = "project.goport.uz";
const LOCAL_HOST = "localhost:3000";

type Scenario = {
  id: string;
  label: string;
  title: string;
  description: string;
  caller: string;
  event: string;
  endpoint: string;
  icon: LucideIcon;
};

const SCENARIOS: Scenario[] = [
  { id: "webhook", label: "Webhook testing", title: "Inspect a real delivery on your machine", description: "Send provider callbacks to your local handler and debug the exact payload your application receives.", caller: "Payme", event: "POST /payment.completed", endpoint: "/api/payment/webhook", icon: Webhook },
  { id: "payment", label: "Payment callbacks", title: "Test the full payment callback flow", description: "Give a payment provider a stable HTTPS endpoint while the integration still runs locally.", caller: "Click", event: "POST /invoice.paid", endpoint: "/api/billing/callback", icon: CreditCard },
  { id: "oauth", label: "OAuth redirects", title: "Use a valid public callback URL", description: "Complete an OAuth redirect on localhost without deploying a temporary staging build.", caller: "OAuth provider", event: "GET /auth/callback", endpoint: "/auth/callback", icon: KeyRound },
  { id: "mobile", label: "Mobile app testing", title: "Reach your local API from a device", description: "Connect a phone or emulator to the API running on your development machine.", caller: "Mobile app", event: "GET /v1/profile", endpoint: "/v1/profile", icon: Smartphone },
  { id: "demo", label: "Preview links", title: "Share current work without a deployment", description: "Send a temporary HTTPS link to a teammate or client while you keep the project local.", caller: "Client browser", event: "GET /preview", endpoint: "/preview", icon: Laptop },
];

export function UseCaseWorkbench() {
  const [activeId, setActiveId] = useState("webhook");
  const active = SCENARIOS.find((scenario) => scenario.id === activeId) ?? SCENARIOS[0];
  const Icon = active.icon;
  const publicUrl = `https://${PUBLIC_HOST}${active.endpoint}`;
  const localTarget = `${LOCAL_HOST}${active.endpoint}`;

  return (
    <div className="route-surface min-w-0 w-full overflow-hidden rounded-[1.5rem] border border-border lg:h-[20.25rem] xl:h-[19.25rem]">
      <div className="grid h-full min-w-0 lg:grid-cols-[minmax(0,0.74fr)_minmax(0,1.26fr)]">
        <div className="h-full border-b border-border p-4 lg:border-b-0 lg:border-r lg:p-5">
          <p className="mb-3 px-2 text-sm font-medium text-muted-foreground">Choose a workflow</p>
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
            {SCENARIOS.map((scenario) => {
              const ScenarioIcon = scenario.icon;
              const activeItem = scenario.id === active.id;

              return (
                <button
                  key={scenario.id}
                  type="button"
                  aria-pressed={activeItem}
                  onClick={() => setActiveId(scenario.id)}
                  className={`flex h-11 cursor-pointer items-center gap-3 rounded-xl px-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeItem ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                >
                  <ScenarioIcon className="size-4 shrink-0" />
                  <span className="truncate text-sm font-medium">{scenario.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex h-full min-w-0 flex-col p-5 sm:p-7">
          <div className="flex h-[7.25rem] shrink-0 items-start gap-4 sm:h-[5.5rem] lg:h-[7.25rem] xl:h-[5.5rem]">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-xl font-semibold tracking-[-0.025em] text-foreground lg:max-w-[18rem] xl:max-w-none">{active.title}</h3>
              <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-6 text-muted-foreground">{active.description}</p>
            </div>
          </div>

          <p className="sr-only">
            {active.caller} sends {active.event} to {publicUrl}. GoPort then forwards that same request to http://{localTarget}.
          </p>

          <div className="mt-7 shrink-0">
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-7">
              <RouteBlock label={`${active.caller} sends the request`} value={active.event} />
              <RouteBlock label="GoPort forwards to localhost" value={localTarget} local />
            </div>

            <div className="relative mt-5 flex h-[2.625rem] items-center gap-2 rounded-xl border border-border bg-background/50 px-4 font-mono text-xs text-muted-foreground">
              <RequestHop direction="down" position="left" />
              <RequestHop direction="up" position="right" />

              <span className="size-2 shrink-0 rounded-full bg-primary" />
              <span className="truncate text-primary" title={publicUrl}>{publicUrl}</span>
              <span className="ml-auto shrink-0">route active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteBlock({ label, value, local = false }: { label: string; value: string; local?: boolean }) {
  return (
    <div className="flex h-[4.5rem] min-w-0 flex-col justify-center rounded-xl border border-border bg-background/55 p-4">
      <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-2 truncate font-mono text-xs font-semibold ${local ? "text-foreground" : "text-primary"}`} title={value}>
        {value}
      </p>
    </div>
  );
}

/**
 * Fixed-size request markers in the gap between the boxes and public URL.
 * The left marker drops into GoPort first; the same green marker rises into
 * localhost on the right a moment later. They never resize the surrounding UI.
 */
function RequestHop({ direction, position }: { direction: "down" | "up"; position: "left" | "right" }) {
  return (
    <span
      aria-hidden="true"
      style={{ left: position === "left" ? "calc(25% - 0.4375rem)" : "calc(75% + 0.4375rem)" }}
      className="pointer-events-none absolute -top-5 hidden h-5 w-[7px] -translate-x-1/2 overflow-hidden sm:block"
    >
      <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[repeating-linear-gradient(180deg,var(--primary),var(--primary)_3px,transparent_3px,transparent_8px)] opacity-40" />
      <span
        className={`absolute left-0 size-[7px] rounded-full bg-primary shadow-[0_0_8px_2px] shadow-primary/55 ${
          direction === "down" ? "animate-request-drop" : "animate-request-rise"
        }`}
      />
    </span>
  );
}
