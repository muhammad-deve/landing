"use client";

import { useState } from "react";
import { CreditCard, KeyRound, Laptop, Smartphone, Webhook, type LucideIcon } from "lucide-react";

type Scenario = {
  id: string;
  label: string;
  title: string;
  description: string;
  event: string;
  endpoint: string;
  source: string;
  icon: LucideIcon;
};

const SCENARIOS: Scenario[] = [
  { id: "webhook", label: "Webhook test", title: "Receive an event before you deploy", description: "Route a provider callback straight to a handler running on your machine.", event: "POST /payment.completed", endpoint: "/api/payment/webhook", source: "Payme event", icon: Webhook },
  { id: "payment", label: "Payments", title: "Validate a payment flow locally", description: "Give payment providers a reachable callback URL while you work on the integration.", event: "POST /invoice.paid", endpoint: "/api/billing/callback", source: "Click callback", icon: CreditCard },
  { id: "oauth", label: "OAuth", title: "Finish the redirect on localhost", description: "Use a public callback URL without standing up a staging environment.", event: "GET /auth/callback", endpoint: "/auth/callback", source: "OAuth provider", icon: KeyRound },
  { id: "mobile", label: "Mobile", title: "Connect a device to your API", description: "Test a real device against the API currently running on your laptop.", event: "GET /v1/profile", endpoint: "/v1/profile", source: "iOS simulator", icon: Smartphone },
  { id: "demo", label: "Client demo", title: "Share a working route", description: "Let a teammate or client see progress without a deployment handoff.", event: "GET /preview", endpoint: "/preview", source: "Browser visit", icon: Laptop },
];

export function UseCaseWorkbench() {
  const [activeId, setActiveId] = useState("webhook");
  const active = SCENARIOS.find((scenario) => scenario.id === activeId) ?? SCENARIOS[0];
  const Icon = active.icon;

  return (
    <div className="route-surface overflow-hidden rounded-[1.5rem] border border-border">
      <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
        <div className="border-b border-border p-4 lg:border-b-0 lg:border-r lg:p-5">
          <p className="mb-3 px-2 text-sm font-medium text-muted-foreground">Choose a route</p>
          <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
            {SCENARIOS.map((scenario) => {
              const ScenarioIcon = scenario.icon;
              const activeItem = scenario.id === active.id;
              return (
                <button key={scenario.id} type="button" onClick={() => setActiveId(scenario.id)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${activeItem ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                  <ScenarioIcon className="size-4 shrink-0" />
                  <span className="text-sm font-medium">{scenario.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary"><Icon className="size-5" /></div>
            <div>
              <h3 className="text-xl font-semibold tracking-[-0.025em] text-foreground">{active.title}</h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{active.description}</p>
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <RouteBlock label={active.source} value={active.event} />
            <div className="hidden h-px bg-gradient-to-r from-primary/25 via-primary to-primary/25 sm:block" />
            <RouteBlock label="Your local handler" value={`localhost:3000${active.endpoint}`} local />
          </div>
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-border bg-background/50 px-4 py-3 font-mono text-xs text-muted-foreground">
            <span className="size-2 rounded-full bg-primary" />
            <span className="text-primary">https://project.goport.uz</span>
            <span className="ml-auto">route active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteBlock({ label, value, local = false }: { label: string; value: string; local?: boolean }) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-background/55 p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`mt-2 truncate font-mono text-xs font-semibold ${local ? "text-foreground" : "text-primary"}`}>{value}</p>
    </div>
  );
}
