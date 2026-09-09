"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  CircleDollarSign,
  Code2,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  Gauge,
  Globe2,
  HardDrive,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogOut,
  Menu,
  Network,
  Plus,
  Radio,
  RefreshCw,
  RotateCw,
  Server,
  Settings,
  ShieldCheck,
  Square,
  TerminalSquare,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { GoPortLogo, GoPortMark } from "@/components/goport-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  type DashboardData,
  type DashboardDomain,
  type TokenItem,
  clearAuthSession,
  createToken,
  deleteToken,
  deleteTunnel,
  getDashboard,
  readAuthSession,
  stopTunnel,
  UnauthorizedError,
} from "@/lib/api";
import { copyText } from "@/lib/clipboard";

type DashboardView =
  | "overview"
  | "tunnels"
  | "inspector"
  | "domains"
  | "usage"
  | "billing"
  | "tokens"
  | "settings"
  | "docs";

interface NavItem {
  id: DashboardView;
  label: string;
  icon: LucideIcon;
}

const NAV_GROUPS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Workspace",
    items: [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "tunnels", label: "Tunnels", icon: Network },
      { id: "inspector", label: "Request inspector", icon: Activity },
      { id: "domains", label: "Domains", icon: Globe2 },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "usage", label: "Usage", icon: Gauge },
      { id: "billing", label: "Billing", icon: CreditCard },
      { id: "tokens", label: "API keys & tokens", icon: KeyRound },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
];

const VIEW_COPY: Record<DashboardView, { title: string; description: string }> = {
  overview: { title: "Dashboard", description: "Your tunnels, traffic, and next action in one place." },
  tunnels: { title: "Tunnels", description: "Manage public endpoints connected to your local services." },
  inspector: { title: "Request inspector", description: "Inspect and replay traffic without adding debug code." },
  domains: { title: "Domains", description: "Reserve memorable GoPort addresses for your projects." },
  usage: { title: "Usage", description: "Understand where requests and bandwidth are being used." },
  billing: { title: "Billing", description: "Manage your plan, limits, and future invoices." },
  tokens: { title: "API keys & tokens", description: "Authenticate trusted machines and CI environments." },
  settings: { title: "Settings", description: "Profile, security, and account preferences." },
  docs: { title: "Getting started", description: "Go from install to a public HTTPS URL in a few minutes." },
};

const PANEL = "border border-border/80 bg-white/90 dark:bg-card/72";

export function DashboardClient() {
  const router = useRouter();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [view, setView] = useState<DashboardView>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<DashboardDomain | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const handleAuthError = useCallback(() => {
    clearAuthSession();
    router.replace("/login");
  }, [router]);

  const load = useCallback(async (silent = false) => {
    const session = readAuthSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    setAuthToken(session.token);
    if (!silent) setError(null);
    try {
      const dashboard = await getDashboard(session.token);
      setData(dashboard);
      setSelectedDomain((current) =>
        current
          ? dashboard.domains.find((domain) => domain.subdomain === current.subdomain) ?? null
          : null,
      );
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        handleAuthError();
        return;
      }
      if (!silent) setError(err instanceof Error ? err.message : "Couldn't load your dashboard.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [handleAuthError, router]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const interval = window.setInterval(() => void load(true), 15_000);
    return () => window.clearInterval(interval);
  }, [load]);

  const navigate = (next: DashboardView) => {
    setView(next);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const runTunnelAction = async (action: "stop" | "delete", domain: DashboardDomain) => {
    if (!authToken || busyAction) return;
    const question = action === "stop"
      ? `Stop ${domain.subdomain}.goport.uz? The local CLI session will disconnect.`
      : `Delete ${domain.subdomain}.goport.uz and its traffic history?`;
    if (!window.confirm(question)) return;

    setActionError(null);
    setBusyAction(`${action}:${domain.subdomain}`);
    try {
      if (action === "stop") await stopTunnel(authToken, domain.subdomain);
      else await deleteTunnel(authToken, domain.subdomain);
      await load(true);
      if (action === "delete") setSelectedDomain(null);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        handleAuthError();
        return;
      }
      setActionError(err instanceof Error ? err.message : `Couldn't ${action} the tunnel.`);
    } finally {
      setBusyAction(null);
    }
  };

  const logout = () => {
    clearAuthSession();
    router.replace("/login");
  };

  if (loading) return <DashboardLoading />;
  if (error) return <DashboardError error={error} onRetry={() => { setLoading(true); void load(); }} />;
  if (!data) return null;

  const activeDomains = data.domains.filter((domain) => domain.isCurrent);
  const firstName = data.name?.trim().split(" ")[0] || "there";
  const currentCopy = VIEW_COPY[view];

  return (
    <div className="min-h-screen bg-[#f2f7f6] text-foreground dark:bg-[#071012]">
      <DashboardSidebar
        view={view}
        data={data}
        open={mobileMenuOpen}
        onNavigate={navigate}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={logout}
      />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 border-b border-border/75 bg-[#f2f7f6]/90 backdrop-blur-xl dark:bg-[#071012]/90">
          <div className="flex min-h-20 items-center gap-3 px-4 sm:px-7 lg:px-9">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex size-10 items-center justify-center rounded-xl border border-border bg-background text-foreground lg:hidden"
              aria-label="Open dashboard navigation"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold tracking-[-0.035em] sm:text-2xl">{currentCopy.title}</h1>
              <p className="mt-0.5 hidden text-sm text-muted-foreground sm:block">{currentCopy.description}</p>
            </div>
            <ThemeToggle />
            <Button
              onClick={() => setCreateOpen(true)}
              className="h-10 rounded-xl bg-primary px-3.5 text-primary-foreground shadow-none hover:bg-primary/90"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">Create tunnel</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-7 sm:py-8 lg:px-9">
          {actionError && (
            <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
              <span>{actionError}</span>
              <button type="button" onClick={() => setActionError(null)} aria-label="Dismiss error"><X className="size-4" /></button>
            </div>
          )}

          {view === "overview" && (
            <OverviewPanel
              data={data}
              firstName={firstName}
              activeDomains={activeDomains}
              onCreate={() => setCreateOpen(true)}
              onNavigate={navigate}
              onSelectDomain={setSelectedDomain}
              onStop={(domain) => void runTunnelAction("stop", domain)}
              busyAction={busyAction}
            />
          )}
          {view === "tunnels" && (
            <TunnelsPanel
              domains={data.domains}
              onCreate={() => setCreateOpen(true)}
              onSelect={setSelectedDomain}
              onStop={(domain) => void runTunnelAction("stop", domain)}
              onDelete={(domain) => void runTunnelAction("delete", domain)}
              busyAction={busyAction}
            />
          )}
          {view === "inspector" && <InspectorPanel domains={data.domains} />}
          {view === "domains" && <DomainsPanel domains={data.domains} onCreate={() => setCreateOpen(true)} onSelect={setSelectedDomain} />}
          {view === "usage" && <UsagePanel data={data} />}
          {view === "billing" && <BillingPanel />}
          {view === "tokens" && (
            <TokensPanel
              authToken={authToken}
              tokens={data.tokens}
              onChange={() => void load(true)}
              onAuthError={handleAuthError}
            />
          )}
          {view === "settings" && <SettingsPanel data={data} onLogout={logout} />}
          {view === "docs" && <DocsPanel />}
        </main>
      </div>

      {createOpen && <CreateTunnelDialog onClose={() => setCreateOpen(false)} />}
      {selectedDomain && (
        <TunnelDetailsDialog
          domain={selectedDomain}
          busyAction={busyAction}
          onClose={() => setSelectedDomain(null)}
          onStop={() => void runTunnelAction("stop", selectedDomain)}
          onDelete={() => void runTunnelAction("delete", selectedDomain)}
        />
      )}
    </div>
  );
}

function DashboardSidebar({
  view,
  data,
  open,
  onNavigate,
  onClose,
  onLogout,
}: {
  view: DashboardView;
  data: DashboardData;
  open: boolean;
  onNavigate: (view: DashboardView) => void;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <>
      {open && <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-50 bg-[#102124]/35 backdrop-blur-sm lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-[60] flex w-64 flex-col border-r border-border/80 bg-background px-3.5 py-4 transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-12 items-center justify-between px-2">
          <Link href="/" aria-label="GoPort home"><GoPortLogo className="h-6 w-auto text-foreground" /></Link>
          <button type="button" onClick={onClose} className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary lg:hidden" aria-label="Close navigation"><X className="size-4" /></button>
        </div>

        <nav className="mt-6 flex-1 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-7">
              <p className="mb-2 px-3 text-[11px] font-medium text-muted-foreground">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = item.id === view;
                  const badge = item.id === "tunnels" ? data.domains.filter((domain) => domain.isCurrent).length : item.id === "tokens" ? data.tokens.length : 0;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate(item.id)}
                      className={`flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-colors ${active ? "bg-primary/11 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                    >
                      <Icon className="size-[17px]" />
                      <span className="flex-1">{item.label}</span>
                      {badge > 0 && <span className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] ${active ? "bg-primary/15" : "bg-secondary"}`}>{badge}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <button type="button" onClick={() => onNavigate("docs")} className={`flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-colors ${view === "docs" ? "bg-primary/11 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
            <BookOpen className="size-[17px]" />
            Getting started
          </button>
        </nav>

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <Avatar name={data.name} avatar={data.avatar} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{data.name || "GoPort developer"}</p>
              <p className="truncate text-xs text-muted-foreground">{data.email}</p>
            </div>
            <button type="button" onClick={onLogout} className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Log out" title="Log out"><LogOut className="size-4" /></button>
          </div>
        </div>
      </aside>
    </>
  );
}

function OverviewPanel({
  data,
  firstName,
  activeDomains,
  onCreate,
  onNavigate,
  onSelectDomain,
  onStop,
  busyAction,
}: {
  data: DashboardData;
  firstName: string;
  activeDomains: DashboardDomain[];
  onCreate: () => void;
  onNavigate: (view: DashboardView) => void;
  onSelectDomain: (domain: DashboardDomain) => void;
  onStop: (domain: DashboardDomain) => void;
  busyAction: string | null;
}) {
  const primary = activeDomains[0];
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back, {firstName}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-[-0.045em] sm:text-[2rem]">Keep localhost within reach.</h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-muted-foreground">Status refreshes every 15 seconds while this dashboard is open.</p>
      </div>

      {primary ? (
        <ActiveTunnelControl domain={primary} extraCount={Math.max(activeDomains.length - 1, 0)} onSelect={() => onSelectDomain(primary)} onStop={() => onStop(primary)} busy={busyAction === `stop:${primary.subdomain}`} />
      ) : (
        <NoActiveTunnel onCreate={onCreate} />
      )}

      <OperationalSummary data={data} activeCount={activeDomains.length} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.75fr)]">
        <section className={`${PANEL} overflow-hidden rounded-[1.4rem]`}>
          <PanelHeader title="Recent tunnels" description="Public endpoints created by your CLI." action="View all" onAction={() => onNavigate("tunnels")} />
          {data.domains.length ? (
            <div className="divide-y divide-border/70">
              {data.domains.slice(0, 5).map((domain) => <CompactTunnelRow key={domain.subdomain} domain={domain} onClick={() => onSelectDomain(domain)} />)}
            </div>
          ) : <CompactEmpty onCreate={onCreate} />}
        </section>

        <section className={`${PANEL} rounded-[1.4rem] p-5 sm:p-6`}>
          <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><TerminalSquare className="size-4" /></span><h3 className="font-semibold">Quick command</h3></div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">Expose the app running on port 3000 with automatic HTTPS.</p>
          <CopyCommand command="goport http 3000" className="mt-5" />
          <button type="button" onClick={() => onNavigate("docs")} className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">See setup guide <ArrowRight className="size-3.5" /></button>
        </section>
      </div>

      <section className={`${PANEL} overflow-hidden rounded-[1.4rem]`}>
        <PanelHeader title="Request inspector" description="Request bodies stay on the machine running the GoPort CLI." action="Open inspector" onAction={() => onNavigate("inspector")} />
        <div className="grid gap-px bg-border/70 md:grid-cols-3">
          <InspectorCapability icon={FileText} title="See every request" text="Method, path, headers, body, status, and timing." />
          <InspectorCapability icon={RotateCw} title="Replay in one click" text="Send the same request again after your code changes." />
          <InspectorCapability icon={ShieldCheck} title="Local by design" text="Sensitive payloads remain in your local inspector." />
        </div>
      </section>
    </div>
  );
}

function ActiveTunnelControl({ domain, extraCount, onSelect, onStop, busy }: { domain: DashboardDomain; extraCount: number; onSelect: () => void; onStop: () => void; busy: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { if (await copyText(domain.url)) { setCopied(true); window.setTimeout(() => setCopied(false), 1600); } };
  return (
    <section className="relative overflow-hidden rounded-[1.6rem] bg-[#102124] p-5 text-white shadow-[0_28px_70px_-45px_rgba(7,61,47,0.8)] sm:p-7 dark:border dark:border-[#29423f]">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_72%_50%,rgba(24,190,135,0.22),transparent_58%)]" />
      <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-white/60">
            <StatusPill online />
            <span>{(domain.protocol || "http").toUpperCase()} tunnel</span>
            {extraCount > 0 && <span>+{extraCount} more online</span>}
          </div>
          <button type="button" onClick={onSelect} className="mt-4 block max-w-full text-left font-mono text-lg font-medium tracking-[-0.03em] text-white hover:text-[#6de0b5] sm:text-2xl">
            <span className="block truncate">{domain.url.replace(/^https?:\/\//, "")}</span>
          </button>
          <div className="mt-4 flex items-center gap-3 text-sm text-white/55">
            <span className="flex size-7 items-center justify-center rounded-lg bg-white/7"><Globe2 className="size-3.5" /></span>
            <span className="h-px w-8 bg-gradient-to-r from-[#23c78d] to-white/15" />
            <span className="size-1.5 animate-pulse rounded-full bg-[#38d996]" />
            <span className="h-px w-8 bg-white/15" />
            <span className="flex items-center gap-2 font-mono text-xs text-white/75"><Server className="size-3.5" />127.0.0.1:{domain.localPort || "local"}</span>
          </div>
        </div>
        <div className="relative flex flex-wrap gap-2 lg:justify-end">
          <button type="button" onClick={copy} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/12 bg-white/7 px-3.5 text-sm font-medium hover:bg-white/12"><Copy className="size-4" />{copied ? "Copied" : "Copy URL"}</button>
          <button type="button" onClick={onSelect} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/12 bg-white/7 px-3.5 text-sm font-medium hover:bg-white/12">Details <ChevronRight className="size-4" /></button>
          <button type="button" onClick={onStop} disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-3.5 text-sm font-semibold text-[#102124] hover:bg-[#e5f4ef] disabled:opacity-60">{busy ? <Loader2 className="size-4 animate-spin" /> : <Square className="size-3.5 fill-current" />} Stop</button>
        </div>
      </div>
    </section>
  );
}

function NoActiveTunnel({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="relative overflow-hidden rounded-[1.6rem] border border-[#26433d] bg-[#102124] p-6 text-white sm:p-8">
      <div className="absolute right-[-4rem] top-[-6rem] size-72 rounded-full border border-[#35d39a]/15" />
      <div className="absolute right-[-1rem] top-[-3rem] size-52 rounded-full border border-[#35d39a]/15" />
      <div className="relative max-w-2xl">
        <div className="flex items-center gap-2 text-sm text-white/55"><span className="size-2 rounded-full bg-white/30" />No active tunnel</div>
        <h3 className="mt-5 text-2xl font-semibold tracking-[-0.045em] sm:text-3xl">Your next public URL starts locally.</h3>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">Choose a port, copy the generated command, and run it in your terminal. The connected tunnel will appear here automatically.</p>
        <button type="button" onClick={onCreate} className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[#38d996] px-4 text-sm font-semibold text-[#07120e] hover:bg-[#63e4b2]"><Plus className="size-4" />Create tunnel command</button>
      </div>
    </section>
  );
}

function OperationalSummary({ data, activeCount }: { data: DashboardData; activeCount: number }) {
  const items = [
    { label: "Active tunnels", value: String(activeCount), icon: Radio },
    { label: "Requests", value: formatNumber(data.totalRequests), icon: Activity },
    { label: "Transferred", value: formatBytes(data.totalBytes), icon: HardDrive },
    { label: "Reserved domains", value: String(data.domains.filter((domain) => domain.isCustom).length), icon: Globe2 },
  ];
  return (
    <section className={`${PANEL} grid overflow-hidden rounded-[1.4rem] sm:grid-cols-2 xl:grid-cols-4`}>
      {items.map(({ label, value, icon: Icon }, index) => (
        <div key={label} className={`flex items-center gap-4 px-5 py-5 sm:px-6 ${index > 0 ? "border-t border-border/70 sm:border-t-0 sm:border-l" : ""} ${index === 2 ? "sm:border-l-0 sm:border-t xl:border-l xl:border-t-0" : ""}`}>
          <Icon className="size-4 text-primary" />
          <div><p className="font-mono text-xl font-semibold tracking-[-0.04em]">{value}</p><p className="mt-0.5 text-xs text-muted-foreground">{label}</p></div>
        </div>
      ))}
    </section>
  );
}

function TunnelsPanel({ domains, onCreate, onSelect, onStop, onDelete, busyAction }: { domains: DashboardDomain[]; onCreate: () => void; onSelect: (domain: DashboardDomain) => void; onStop: (domain: DashboardDomain) => void; onDelete: (domain: DashboardDomain) => void; busyAction: string | null }) {
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");
  const filtered = domains.filter((domain) => filter === "all" || (filter === "online" ? domain.isCurrent : !domain.isCurrent));
  return (
    <div className="space-y-6">
      <SectionLead title="Every endpoint, one clear status." description="Tunnels are created by the CLI. Stop an online session here, or copy its command to reconnect it from the machine running your app." />
      <section className={`${PANEL} overflow-hidden rounded-[1.4rem]`}>
        <div className="flex flex-col gap-4 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="inline-flex w-fit rounded-xl bg-secondary p-1">
            {(["all", "online", "offline"] as const).map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${filter === item ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>{item}</button>)}
          </div>
          <Button onClick={onCreate} className="h-9 rounded-xl bg-primary text-primary-foreground shadow-none"><Plus className="size-4" />Create tunnel</Button>
        </div>
        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead><tr className="border-b border-border/70 text-xs font-medium text-muted-foreground"><th className="px-5 py-3.5">Endpoint</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5">Local destination</th><th className="px-4 py-3.5">Traffic</th><th className="px-4 py-3.5">Last connected</th><th className="px-5 py-3.5 text-right">Actions</th></tr></thead>
              <tbody className="divide-y divide-border/65">
                {filtered.map((domain) => (
                  <tr key={domain.subdomain} className="group hover:bg-secondary/45">
                    <td className="px-5 py-4"><button type="button" onClick={() => onSelect(domain)} className="block max-w-[17rem] text-left"><span className="block truncate font-mono text-sm font-semibold group-hover:text-primary">{domain.subdomain}.goport.uz</span><span className="mt-1 block text-xs text-muted-foreground">{domain.isCustom ? "Reserved subdomain" : "Generated subdomain"}</span></button></td>
                    <td className="px-4 py-4"><StatusPill online={domain.isCurrent} /></td>
                    <td className="px-4 py-4 font-mono text-xs text-muted-foreground">127.0.0.1:{domain.localPort || "—"}</td>
                    <td className="px-4 py-4"><p className="font-mono text-xs font-medium">{formatNumber(domain.requests)} req</p><p className="mt-1 text-xs text-muted-foreground">{formatBytes(domain.bytes)}</p></td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">{domain.lastActive ? formatRelative(domain.lastActive) : "Never"}</td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-1">
                      <IconCopyButton value={domain.url} label="Copy URL" />
                      {domain.isCurrent ? <IconActionButton icon={busyAction === `stop:${domain.subdomain}` ? Loader2 : Square} label="Stop tunnel" onClick={() => onStop(domain)} spinning={busyAction === `stop:${domain.subdomain}`} /> : <IconActionButton icon={Trash2} label="Delete tunnel" danger onClick={() => onDelete(domain)} spinning={busyAction === `delete:${domain.subdomain}`} />}
                      <IconActionButton icon={ChevronRight} label="Tunnel details" onClick={() => onSelect(domain)} />
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <CompactEmpty onCreate={onCreate} message={filter === "all" ? undefined : `No ${filter} tunnels.`} />}
      </section>
    </div>
  );
}

function InspectorPanel({ domains }: { domains: DashboardDomain[] }) {
  const active = domains.find((domain) => domain.isCurrent);
  return (
    <div className="space-y-6">
      <SectionLead title="Debug the request, not the tunnel." description="GoPort captures request details in the local dashboard beside the process receiving them. That keeps credentials and payloads off the hosted control plane." />
      <section className="overflow-hidden rounded-[1.5rem] border border-[#29423f] bg-[#102124] text-white">
        <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div><div className="flex items-center gap-2"><span className={`size-2 rounded-full ${active ? "animate-pulse bg-[#38d996]" : "bg-white/30"}`} /><h3 className="font-semibold">Local request stream</h3></div><p className="mt-1.5 text-xs text-white/50">Dashboard · http://127.0.0.1:4040</p></div>
          <a href="http://127.0.0.1:4040" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#102124] hover:bg-[#e6f3ef]">Open local inspector <ArrowUpRight className="size-4" /></a>
        </div>
        <div className="grid min-h-[350px] md:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <div className="border-b border-white/10 p-5 md:border-b-0 md:border-r md:p-6">
            <div className="flex items-center justify-between text-xs text-white/45"><span>Incoming requests</span><span>{active ? `${active.subdomain}.goport.uz` : "No tunnel connected"}</span></div>
            <div className="mt-16 flex flex-col items-center text-center"><span className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#38d996]"><Activity className="size-5" /></span><p className="mt-4 text-sm font-medium">Requests appear on your local machine</p><p className="mt-2 max-w-sm text-xs leading-5 text-white/45">Send a request through an active GoPort URL, then open the inspector to view headers, bodies, responses, timings, and replay controls.</p></div>
          </div>
          <div className="bg-black/10 p-5 md:p-6">
            <p className="text-xs text-white/45">Request details</p>
            <div className="mt-8 space-y-5">
              {["Headers", "Request body", "Response", "Timing"].map((item) => <div key={item}><div className="mb-2 flex items-center justify-between text-xs"><span className="text-white/60">{item}</span><span className="text-white/25">Waiting</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/7"><div className="h-full w-0 bg-[#38d996]" /></div></div>)}
            </div>
          </div>
        </div>
      </section>
      <section className={`${PANEL} rounded-[1.4rem] p-5 sm:p-6`}><h3 className="font-semibold">Test the active tunnel</h3><p className="mt-2 text-sm text-muted-foreground">This command sends a request you can inspect immediately.</p><CopyCommand className="mt-5" command={`curl -i ${active?.url || "https://your-app.goport.uz"}/health`} /></section>
    </div>
  );
}

function DomainsPanel({ domains, onCreate, onSelect }: { domains: DashboardDomain[]; onCreate: () => void; onSelect: (domain: DashboardDomain) => void }) {
  return (
    <div className="space-y-6">
      <SectionLead title="Give local work a stable address." description="Use a generated subdomain for quick tests or reserve a name you can keep in webhook and OAuth provider settings." />
      <section className={`${PANEL} overflow-hidden rounded-[1.4rem]`}>
        <PanelHeader title="GoPort subdomains" description={`${domains.length} ${domains.length === 1 ? "address" : "addresses"} attached to your account`} action="Reserve a name" onAction={onCreate} />
        {domains.length ? <div className="divide-y divide-border/70">{domains.map((domain) => <CompactTunnelRow key={domain.subdomain} domain={domain} onClick={() => onSelect(domain)} showDomainType />)}</div> : <CompactEmpty onCreate={onCreate} />}
      </section>
      <section className={`${PANEL} grid overflow-hidden rounded-[1.4rem] lg:grid-cols-[1fr_0.7fr]`}>
        <div className="p-5 sm:p-7"><div className="flex items-center gap-3"><LockKeyhole className="size-5 text-primary" /><h3 className="font-semibold">Custom domains</h3><SoonBadge /></div><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Bring your own domain, point a CNAME at GoPort, and receive managed SSL automatically. DNS verification will appear here when this feature launches.</p></div>
        <div className="border-t border-border bg-secondary/45 p-5 lg:border-l lg:border-t-0 sm:p-7"><p className="text-xs font-medium text-muted-foreground">Planned DNS record</p><code className="mt-3 block rounded-lg border border-border bg-background px-3 py-2.5 font-mono text-xs">CNAME tunnel.goport.uz</code><p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-3.5 text-primary" />Managed TLS certificate</p></div>
      </section>
    </div>
  );
}

function UsagePanel({ data }: { data: DashboardData }) {
  const maxRequests = Math.max(...data.domains.map((domain) => domain.requests), 1);
  return (
    <div className="space-y-6">
      <SectionLead title="Traffic, without the guesswork." description="Current totals are lifetime counters. Monthly billing periods and hard plan limits will appear here when subscriptions launch." />
      <section className={`${PANEL} overflow-hidden rounded-[1.4rem]`}>
        <div className="grid md:grid-cols-2">
          <UsageTotal icon={Activity} label="Requests served" value={formatNumber(data.totalRequests)} note="Across every tunnel" />
          <UsageTotal icon={HardDrive} label="Bandwidth transferred" value={formatBytes(data.totalBytes)} note="Uploaded and downloaded" border />
        </div>
      </section>
      <section className={`${PANEL} rounded-[1.4rem] p-5 sm:p-7`}>
        <div className="flex items-center justify-between gap-4"><div><h3 className="font-semibold">Usage by tunnel</h3><p className="mt-1 text-sm text-muted-foreground">Relative request volume across your endpoints.</p></div><BarChart3 className="size-5 text-primary" /></div>
        <div className="mt-7 space-y-6">
          {data.domains.length ? data.domains.map((domain) => (
            <div key={domain.subdomain}>
              <div className="mb-2.5 flex items-end justify-between gap-4"><div className="min-w-0"><p className="truncate font-mono text-sm font-medium">{domain.subdomain}.goport.uz</p><p className="mt-1 text-xs text-muted-foreground">{formatBytes(domain.bytes)}</p></div><p className="font-mono text-sm">{formatNumber(domain.requests)}</p></div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.max((domain.requests / maxRequests) * 100, domain.requests ? 3 : 0)}%` }} /></div>
            </div>
          )) : <p className="py-10 text-center text-sm text-muted-foreground">Usage will appear after your first tunnel receives traffic.</p>}
        </div>
      </section>
    </div>
  );
}

function BillingPanel() {
  return (
    <div className="space-y-6">
      <SectionLead title="Start free. Upgrade when traffic grows." description="Your account is on the Free plan. Paid subscriptions are being prepared; no payment method is required today." />
      <section className="overflow-hidden rounded-[1.5rem] border border-[#29423f] bg-[#102124] p-6 text-white sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><div className="flex items-center gap-2 text-sm text-[#74dcb7]"><CircleDollarSign className="size-4" />Current plan</div><h3 className="mt-4 text-3xl font-semibold tracking-[-0.05em]">Free</h3><p className="mt-2 text-sm text-white/55">Automatic HTTPS, WebSockets, local inspection, and generated subdomains.</p></div><div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"><span className="text-white/45">Amount due</span><span className="ml-8 font-mono font-semibold">$0.00</span></div></div>
      </section>
      <div className="grid gap-5 lg:grid-cols-2">
        <PlanCard name="Free" price="$0" description="For personal projects and local development." features={["2 active tunnels", "Generated subdomains", "Automatic HTTPS", "Local request inspector"]} current />
        <PlanCard name="Pro" price="$2.99" suffix="/ month" description="For persistent integrations and heavier traffic." features={["More simultaneous tunnels", "Persistent subdomains", "Longer request history", "Request replay"]} />
      </div>
      <section className={`${PANEL} rounded-[1.4rem] p-5 sm:p-6`}><div className="flex items-start gap-4"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground"><FileText className="size-4" /></span><div><h3 className="font-semibold">Invoices and payment history</h3><p className="mt-1.5 text-sm text-muted-foreground">Nothing to show while your account is on the Free plan.</p></div></div></section>
    </div>
  );
}

function TokensPanel({ authToken, tokens, onChange, onAuthError }: { authToken: string | null; tokens: TokenItem[]; onChange: () => void; onAuthError: () => void }) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!authToken || creating || !name.trim()) return;
    setCreating(true); setError(null);
    try { await createToken(authToken, name.trim()); setName(""); onChange(); }
    catch (err) { if (err instanceof UnauthorizedError) onAuthError(); else setError(err instanceof Error ? err.message : "Couldn't create the token."); }
    finally { setCreating(false); }
  };
  return (
    <div className="space-y-6">
      <SectionLead title="Keys for every trusted machine." description="Create a separate token for your laptop, CI runner, or server so access can be revoked independently." />
      <section className={`${PANEL} rounded-[1.4rem] p-5 sm:p-7`}>
        <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><KeyRound className="size-4" /></span><div><h3 className="font-semibold">Create CLI token</h3><p className="mt-0.5 text-xs text-muted-foreground">The token value is used by `goport auth`.</p></div></div>
        <form onSubmit={create} className="mt-6 flex flex-col gap-2 sm:flex-row"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Token name, e.g. work-laptop" maxLength={50} className="h-11 rounded-xl bg-background" /><Button type="submit" disabled={creating || !name.trim()} className="h-11 rounded-xl bg-primary text-primary-foreground shadow-none">{creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}Create token</Button></form>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      </section>
      <section className={`${PANEL} overflow-hidden rounded-[1.4rem]`}><PanelHeader title="Your tokens" description={`${tokens.length} active ${tokens.length === 1 ? "credential" : "credentials"}`} />
        <div className="divide-y divide-border/70">{tokens.map((token) => <TokenRow key={token.id} authToken={authToken} token={token} canDelete={tokens.length > 1} onChange={onChange} onAuthError={onAuthError} />)}</div>
      </section>
      <section className="rounded-[1.4rem] border border-amber-500/25 bg-amber-500/7 p-5"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" /><p className="text-sm leading-6 text-muted-foreground"><span className="font-semibold text-foreground">Treat tokens like passwords.</span> Never commit them to source control or paste them into client-side code.</p></div></section>
    </div>
  );
}

function TokenRow({ authToken, token, canDelete, onChange, onAuthError }: { authToken: string | null; token: TokenItem; canDelete: boolean; onChange: () => void; onAuthError: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const command = `goport auth ${token.token}`;
  const copy = async () => { if (await copyText(command)) { setCopied(true); window.setTimeout(() => setCopied(false), 1600); } };
  const remove = async () => {
    if (!authToken || deleting || !canDelete || !window.confirm(`Revoke the "${token.name}" token?`)) return;
    setDeleting(true);
    try { await deleteToken(authToken, token.id); onChange(); }
    catch (err) { if (err instanceof UnauthorizedError) onAuthError(); else setDeleting(false); }
  };
  return (
    <div className="p-5 sm:px-6">
      <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><h4 className="text-sm font-semibold">{token.name}</h4>{token.name === "default" && <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Default</span>}</div><p className="mt-1.5 text-xs text-muted-foreground">Created {token.created ? formatDate(token.created) : "with your account"} · Last used not tracked yet</p></div><button type="button" onClick={remove} disabled={!canDelete || deleting} className="flex size-9 items-center justify-center rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-35" title={canDelete ? "Revoke token" : "Keep at least one token"}>{deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}</button></div>
      <div className="mt-4 flex items-center gap-2 overflow-hidden rounded-xl border border-border bg-[#102124] px-3.5 py-3 font-mono text-xs text-white"><span className="text-[#38d996]">$</span><code className="min-w-0 flex-1 truncate"><span className="text-[#73dfb8]">goport auth</span> <span className="text-white/70">{revealed ? token.token : maskToken(token.token)}</span></code><button type="button" onClick={() => setRevealed((value) => !value)} className="text-white/45 hover:text-white" aria-label={revealed ? "Hide token" : "Show token"}>{revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button><button type="button" onClick={copy} className="text-white/45 hover:text-white" aria-label="Copy authentication command">{copied ? <Check className="size-4 text-[#38d996]" /> : <Copy className="size-4" />}</button></div>
    </div>
  );
}

function SettingsPanel({ data, onLogout }: { data: DashboardData; onLogout: () => void }) {
  return (
    <div className="space-y-6">
      <SectionLead title="A quiet place for account changes." description="Your authentication profile is managed by GoPort's secure user store." />
      <section className={`${PANEL} rounded-[1.4rem] p-5 sm:p-7`}><div className="flex items-center gap-4"><Avatar name={data.name} avatar={data.avatar} large /><div><h3 className="font-semibold">{data.name || "GoPort developer"}</h3><p className="mt-1 text-sm text-muted-foreground">{data.email}</p></div></div><div className="mt-7 grid gap-5 border-t border-border pt-6 sm:grid-cols-2"><ReadOnlyField label="Display name" value={data.name || "Not set"} /><ReadOnlyField label="Email address" value={data.email} /></div><p className="mt-5 text-xs leading-5 text-muted-foreground">Profile editing will be available after account verification controls are added.</p></section>
      <section className={`${PANEL} overflow-hidden rounded-[1.4rem]`}><SettingsRow icon={LockKeyhole} title="Password" description="Reset your password securely from the login screen." action={<Link href="/login" className="text-sm font-medium text-primary hover:underline">Reset password</Link>} /><SettingsRow icon={Zap} title="Notifications" description="Product and traffic alerts are not enabled yet." action={<SoonBadge />} /><SettingsRow icon={LogOut} title="Sign out" description="Remove this session from the current browser." action={<button type="button" onClick={onLogout} className="text-sm font-medium text-foreground hover:text-primary">Log out</button>} /></section>
      <section className="rounded-[1.4rem] border border-destructive/25 bg-destructive/5 p-5 sm:p-6"><h3 className="font-semibold text-destructive">Delete account</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Account deletion requires verified ownership and is not self-service yet. Contact support from your account email to request deletion.</p><a href="mailto:support@goport.uz?subject=Delete%20my%20GoPort%20account" className="mt-4 inline-flex text-sm font-medium text-destructive hover:underline">Contact support</a></section>
    </div>
  );
}

function DocsPanel() {
  const frameworks = [
    { name: "Next.js", command: "pnpm dev", port: "3000" },
    { name: "Node.js", command: "npm run dev", port: "3000" },
    { name: "Django", command: "python manage.py runserver", port: "8000" },
    { name: "Laravel", command: "php artisan serve", port: "8000" },
    { name: "Spring", command: "./mvnw spring-boot:run", port: "8080" },
    { name: "Go", command: "go run .", port: "8080" },
  ];
  return (
    <div className="space-y-6">
      <SectionLead title="From install to internet in three steps." description="Run these commands on the machine where your local service is listening." />
      <div className="grid gap-5 lg:grid-cols-3"><SetupStep number="1" title="Install GoPort" command="choco install goport" text="Install the CLI and verify it is available in your terminal." /><SetupStep number="2" title="Authenticate" command="goport auth <token>" text="Create a token in this dashboard and link your machine." /><SetupStep number="3" title="Expose a port" command="goport http 3000" text="Receive a public HTTPS URL and open the local inspector." /></div>
      <section className={`${PANEL} overflow-hidden rounded-[1.4rem]`}><PanelHeader title="Framework examples" description="Start your application, then expose its usual development port." /><div className="grid md:grid-cols-2 xl:grid-cols-3">{frameworks.map((framework) => <div key={framework.name} className="border-b border-border/70 p-5 md:border-r xl:p-6"><div className="flex items-center justify-between"><h3 className="font-semibold">{framework.name}</h3><Code2 className="size-4 text-primary" /></div><code className="mt-4 block truncate rounded-lg bg-secondary px-3 py-2.5 font-mono text-xs">{framework.command}</code><CopyCommand className="mt-2" compact command={`goport http ${framework.port}`} /></div>)}</div></section>
      <a href="https://github.com/muhammad-deve/GoPort#readme" target="_blank" rel="noreferrer" className="flex items-center justify-between gap-5 rounded-[1.4rem] border border-[#29423f] bg-[#102124] p-5 text-white hover:border-primary sm:p-7"><div className="flex items-center gap-4"><span className="flex size-11 items-center justify-center rounded-xl bg-white/7 text-[#38d996]"><BookOpen className="size-5" /></span><div><h3 className="font-semibold">Read the full documentation</h3><p className="mt-1 text-sm text-white/50">CLI flags, custom subdomains, regions, and self-hosting.</p></div></div><ArrowUpRight className="size-5 text-white/50" /></a>
    </div>
  );
}

function CreateTunnelDialog({ onClose }: { onClose: () => void }) {
  const [port, setPort] = useState("3000");
  const [subdomain, setSubdomain] = useState("");
  const [copied, setCopied] = useState(false);
  const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/^-+/, "");
  const command = `goport http ${port || "3000"}${cleanSubdomain ? ` --name ${cleanSubdomain}` : ""}`;
  const copy = async () => { if (await copyText(command)) { setCopied(true); window.setTimeout(() => setCopied(false), 1800); } };
  return (
    <ModalShell title="Create tunnel" description="Configure the command, then run it on the machine hosting your app." onClose={onClose}>
      <div className="space-y-5">
        <div><label htmlFor="tunnel-port" className="text-sm font-medium">Local port</label><p className="mt-1 text-xs text-muted-foreground">The port your app already uses.</p><Input id="tunnel-port" inputMode="numeric" value={port} onChange={(event) => setPort(event.target.value.replace(/\D/g, "").slice(0, 5))} className="mt-2 h-11 rounded-xl bg-background font-mono" placeholder="3000" /></div>
        <div><label htmlFor="tunnel-name" className="text-sm font-medium">Reserved subdomain <span className="font-normal text-muted-foreground">(optional)</span></label><p className="mt-1 text-xs text-muted-foreground">Leave blank to reuse or generate an address.</p><div className="mt-2 flex h-11 overflow-hidden rounded-xl border border-input bg-background"><Input id="tunnel-name" value={cleanSubdomain} onChange={(event) => setSubdomain(event.target.value)} className="h-full rounded-none border-0 bg-transparent font-mono shadow-none focus-visible:ring-0" placeholder="my-app" /><span className="flex items-center border-l border-border px-3 font-mono text-xs text-muted-foreground">.goport.uz</span></div></div>
        <div><p className="text-sm font-medium">Protocol</p><div className="mt-2 flex items-center justify-between rounded-xl border border-border bg-secondary/45 px-4 py-3"><div className="flex items-center gap-3"><Globe2 className="size-4 text-primary" /><div><p className="text-sm font-medium">HTTP + automatic HTTPS</p><p className="mt-0.5 text-xs text-muted-foreground">WebSocket upgrades included</p></div></div><Check className="size-4 text-primary" /></div></div>
        <div className="rounded-xl bg-[#102124] p-4 text-white"><p className="mb-3 text-xs text-white/45">Run in your terminal</p><div className="flex items-center gap-2 font-mono text-xs"><span className="text-[#38d996]">$</span><code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap">{command}</code><button type="button" onClick={copy} className="flex size-8 items-center justify-center rounded-lg bg-white/7 text-white/60 hover:text-white" aria-label="Copy tunnel command">{copied ? <Check className="size-4 text-[#38d996]" /> : <Copy className="size-4" />}</button></div></div>
        <p className="text-xs leading-5 text-muted-foreground">GoPort cannot start a process on your machine from the web. The tunnel appears here as soon as this command connects.</p>
        <div className="flex justify-end gap-2 border-t border-border pt-5"><Button type="button" variant="outline" onClick={onClose} className="h-10 rounded-xl">Cancel</Button><Button type="button" onClick={copy} className="h-10 rounded-xl bg-primary text-primary-foreground shadow-none">{copied ? <Check className="size-4" /> : <Copy className="size-4" />}{copied ? "Command copied" : "Copy command"}</Button></div>
      </div>
    </ModalShell>
  );
}

function TunnelDetailsDialog({ domain, busyAction, onClose, onStop, onDelete }: { domain: DashboardDomain; busyAction: string | null; onClose: () => void; onStop: () => void; onDelete: () => void }) {
  const port = domain.localPort || "3000";
  const restart = `goport http ${port}${domain.isCustom ? ` --name ${domain.subdomain}` : ""}`;
  const reset = `goport http ${port} --reset`;
  return (
    <ModalShell title={domain.subdomain} description="Tunnel details and lifecycle controls." onClose={onClose} wide>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-secondary/35 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex items-center gap-2"><StatusPill online={domain.isCurrent} /><span className="text-xs text-muted-foreground">{domain.isCustom ? "Reserved" : "Generated"}</span></div><a href={domain.url} target="_blank" rel="noreferrer" className="mt-3 block truncate font-mono text-sm font-semibold hover:text-primary">{domain.url}</a></div><IconCopyButton value={domain.url} label="Copy URL" withText /></div>
        <div className="grid gap-4 sm:grid-cols-2"><DetailField label="Public URL" value={domain.url.replace(/^https?:\/\//, "")} /><DetailField label="Local destination" value={`127.0.0.1:${domain.localPort || "Not recorded"}`} /><DetailField label="Protocol" value={`${(domain.protocol || "http").toUpperCase()} · public HTTPS`} /><DetailField label="Created" value={domain.created ? formatDate(domain.created) : "Unknown"} /><DetailField label="Requests" value={formatNumber(domain.requests)} /><DetailField label="Bandwidth" value={formatBytes(domain.bytes)} /><DetailField label="Last connected" value={domain.lastActive ? formatRelative(domain.lastActive) : "Never"} /><DetailField label="Connection" value={domain.isCurrent ? "Online" : "Offline"} /></div>
        <div><h4 className="text-sm font-semibold">Reconnect from your machine</h4><CopyCommand command={restart} className="mt-3" /></div>
        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between"><CopyTextAction label="Regenerate address command" value={reset} /><div className="flex gap-2">{domain.isCurrent ? <Button type="button" variant="outline" onClick={onStop} disabled={busyAction === `stop:${domain.subdomain}`} className="h-10 rounded-xl">{busyAction === `stop:${domain.subdomain}` ? <Loader2 className="size-4 animate-spin" /> : <Square className="size-3.5 fill-current" />}Stop tunnel</Button> : <Button type="button" variant="outline" onClick={onDelete} disabled={busyAction === `delete:${domain.subdomain}`} className="h-10 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/8">{busyAction === `delete:${domain.subdomain}` ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}Delete tunnel</Button>}<Button type="button" onClick={onClose} className="h-10 rounded-xl bg-primary text-primary-foreground shadow-none">Done</Button></div></div>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, description, onClose, wide = false, children }: { title: string; description: string; onClose: () => void; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#102124]/45 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="dashboard-dialog-title">
      <button type="button" aria-label="Close dialog" onClick={onClose} className="absolute inset-0" />
      <div className={`relative max-h-[92vh] w-full overflow-y-auto rounded-t-[1.6rem] border border-border bg-background shadow-2xl sm:rounded-[1.6rem] ${wide ? "max-w-3xl" : "max-w-xl"}`}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-background/95 px-5 py-5 backdrop-blur sm:px-6"><div><h2 id="dashboard-dialog-title" className="text-xl font-semibold tracking-[-0.035em]">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div><button type="button" onClick={onClose} className="flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Close"><X className="size-4" /></button></div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

function PanelHeader({ title, description, action, onAction }: { title: string; description: string; action?: string; onAction?: () => void }) {
  return <div className="flex items-center justify-between gap-4 border-b border-border/70 px-5 py-4 sm:px-6"><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs text-muted-foreground">{description}</p></div>{action && onAction && <button type="button" onClick={onAction} className="shrink-0 text-xs font-semibold text-primary hover:underline">{action}</button>}</div>;
}

function CompactTunnelRow({ domain, onClick, showDomainType = false }: { domain: DashboardDomain; onClick: () => void; showDomainType?: boolean }) {
  return <button type="button" onClick={onClick} className="grid w-full gap-3 px-5 py-4 text-left hover:bg-secondary/45 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-6"><div className="min-w-0"><div className="flex items-center gap-2.5"><span className={`size-2 shrink-0 rounded-full ${domain.isCurrent ? "bg-primary shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_12%,transparent)]" : "bg-muted-foreground/35"}`} /><span className="truncate font-mono text-sm font-semibold">{domain.subdomain}.goport.uz</span></div><p className="mt-1.5 truncate pl-[18px] text-xs text-muted-foreground">{showDomainType ? (domain.isCustom ? "Reserved GoPort subdomain" : "Generated GoPort subdomain") : `127.0.0.1:${domain.localPort || "port not recorded"}`}</p></div><div className="pl-[18px] sm:pl-0 sm:text-right"><p className="font-mono text-xs font-medium">{formatNumber(domain.requests)} requests</p><p className="mt-1 text-xs text-muted-foreground">{formatBytes(domain.bytes)}</p></div><ChevronRight className="hidden size-4 text-muted-foreground sm:block" /></button>;
}

function CompactEmpty({ onCreate, message }: { onCreate: () => void; message?: string }) {
  return <div className="flex flex-col items-center px-5 py-12 text-center"><span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Network className="size-5" /></span><p className="mt-4 text-sm font-semibold">{message || "No tunnels yet"}</p><p className="mt-1.5 max-w-sm text-xs leading-5 text-muted-foreground">Create a command, run it beside your local app, and the tunnel will appear here.</p><button type="button" onClick={onCreate} className="mt-4 text-sm font-semibold text-primary hover:underline">Create tunnel</button></div>;
}

function SectionLead({ title, description }: { title: string; description: string }) {
  return <div className="max-w-3xl"><h2 className="text-2xl font-semibold tracking-[-0.045em] sm:text-[2rem]">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p></div>;
}

function StatusPill({ online }: { online: boolean }) {
  return <span className={`inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-semibold ${online ? "bg-primary/12 text-primary" : "bg-secondary text-muted-foreground"}`}><span className={`size-1.5 rounded-full ${online ? "bg-primary" : "bg-muted-foreground/50"}`} />{online ? "Online" : "Offline"}</span>;
}

function CopyCommand({ command, className = "", compact = false }: { command: string; className?: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { if (await copyText(command)) { setCopied(true); window.setTimeout(() => setCopied(false), 1600); } };
  return <div className={`${className} flex items-center gap-2 rounded-xl border border-border bg-[#102124] px-3.5 ${compact ? "py-2.5" : "py-3.5"} font-mono text-xs text-white`}><span className="text-[#38d996]">$</span><code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap">{command}</code><button type="button" onClick={copy} className="text-white/50 hover:text-white" aria-label={`Copy ${command}`}>{copied ? <Check className="size-4 text-[#38d996]" /> : <Copy className="size-4" />}</button></div>;
}

function CopyTextAction({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { if (await copyText(value)) { setCopied(true); window.setTimeout(() => setCopied(false), 1600); } };
  return <button type="button" onClick={copy} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">{copied ? <Check className="size-4 text-primary" /> : <RotateCw className="size-4" />}{copied ? "Command copied" : label}</button>;
}

function IconCopyButton({ value, label, withText = false }: { value: string; label: string; withText?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { if (await copyText(value)) { setCopied(true); window.setTimeout(() => setCopied(false), 1400); } };
  return <button type="button" onClick={copy} className={`inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground ${withText ? "px-3" : "w-9"}`} title={label} aria-label={label}>{copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}{withText && <span className="text-xs font-semibold">{copied ? "Copied" : label}</span>}</button>;
}

function IconActionButton({ icon: Icon, label, onClick, danger = false, spinning = false }: { icon: LucideIcon; label: string; onClick: () => void; danger?: boolean; spinning?: boolean }) {
  return <button type="button" onClick={onClick} className={`flex size-9 items-center justify-center rounded-xl text-muted-foreground ${danger ? "hover:bg-destructive/10 hover:text-destructive" : "hover:bg-secondary hover:text-foreground"}`} title={label} aria-label={label}><Icon className={`size-4 ${spinning ? "animate-spin" : ""}`} /></button>;
}

function InspectorCapability({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return <div className="bg-background p-5 sm:p-6"><Icon className="size-4 text-primary" /><h4 className="mt-4 text-sm font-semibold">{title}</h4><p className="mt-1.5 text-xs leading-5 text-muted-foreground">{text}</p></div>;
}

function UsageTotal({ icon: Icon, label, value, note, border = false }: { icon: LucideIcon; label: string; value: string; note: string; border?: boolean }) {
  return <div className={`p-6 sm:p-8 ${border ? "border-t border-border md:border-l md:border-t-0" : ""}`}><div className="flex items-center gap-2 text-sm text-muted-foreground"><Icon className="size-4 text-primary" />{label}</div><p className="mt-5 font-mono text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">{value}</p><p className="mt-3 text-xs text-muted-foreground">{note} · Lifetime total</p></div>;
}

function PlanCard({ name, price, suffix, description, features, current = false }: { name: string; price: string; suffix?: string; description: string; features: string[]; current?: boolean }) {
  return <section className={`${PANEL} flex flex-col rounded-[1.4rem] p-6 sm:p-7`}><div className="flex items-center justify-between"><h3 className="text-lg font-semibold">{name}</h3>{current ? <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">Current plan</span> : <SoonBadge />}</div><p className="mt-5"><span className="text-4xl font-semibold tracking-[-0.055em]">{price}</span>{suffix && <span className="ml-1 text-sm text-muted-foreground">{suffix}</span>}</p><p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p><ul className="my-6 space-y-3 border-y border-border py-5">{features.map((feature) => <li key={feature} className="flex items-center gap-2.5 text-sm"><Check className="size-4 text-primary" />{feature}</li>)}</ul><Button disabled className={`mt-auto h-10 rounded-xl shadow-none ${current ? "bg-secondary text-muted-foreground" : "bg-primary text-primary-foreground"}`}>{current ? "Plan active" : "Upgrade coming soon"}</Button></section>;
}

function SettingsRow({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action: React.ReactNode }) {
  return <div className="flex items-center gap-4 border-b border-border/70 p-5 last:border-0 sm:px-6"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground"><Icon className="size-4" /></span><div className="min-w-0 flex-1"><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs text-muted-foreground">{description}</p></div>{action}</div>;
}

function SetupStep({ number, title, command, text }: { number: string; title: string; command: string; text: string }) {
  return <section className={`${PANEL} rounded-[1.4rem] p-5 sm:p-6`}><span className="flex size-8 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">{number}</span><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-2 min-h-10 text-xs leading-5 text-muted-foreground">{text}</p><CopyCommand command={command} className="mt-5" compact /></section>;
}

function DetailField({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1.5 break-all font-mono text-xs font-medium">{value}</p></div>; }
function ReadOnlyField({ label, value }: { label: string; value: string }) { return <div><p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p><div className="rounded-xl border border-border bg-secondary/35 px-3.5 py-3 text-sm">{value}</div></div>; }
function SoonBadge() { return <span className="rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">Coming soon</span>; }

function Avatar({ name, avatar, large = false }: { name: string; avatar?: string; large?: boolean }) {
  const initials = name?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "GP";
  const size = large ? "size-14" : "size-9";
  if (avatar) return <img src={avatar} alt="" className={`${size} rounded-xl border border-border object-cover`} referrerPolicy="no-referrer" />;
  return <span className={`${size} flex shrink-0 items-center justify-center rounded-xl bg-[#102124] text-xs font-semibold text-white`}>{initials}</span>;
}

function DashboardLoading() {
  return <div className="flex min-h-screen items-center justify-center bg-[#f2f7f6] dark:bg-[#071012]"><div className="flex flex-col items-center"><GoPortMark className="size-12 animate-pulse text-foreground" /><p className="mt-4 text-sm text-muted-foreground">Opening your workspace…</p></div></div>;
}

function DashboardError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return <div className="flex min-h-screen items-center justify-center bg-[#f2f7f6] px-5 dark:bg-[#071012]"><div className={`${PANEL} max-w-md rounded-[1.4rem] p-7 text-center`}><span className="mx-auto flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><X className="size-5" /></span><h1 className="mt-5 text-xl font-semibold">Dashboard unavailable</h1><p className="mt-2 text-sm leading-6 text-muted-foreground">{error}</p><Button onClick={onRetry} className="mt-6 h-10 rounded-xl bg-primary text-primary-foreground shadow-none"><RefreshCw className="size-4" />Try again</Button></div></div>;
}

function maskToken(token: string): string { return token ? `${token.slice(0, 7)}${"•".repeat(Math.max(token.length - 7, 10))}` : ""; }
function formatNumber(value: number): string { return new Intl.NumberFormat("en-US").format(Math.max(value || 0, 0)); }
function formatBytes(bytes: number): string { if (!bytes || bytes <= 0) return "0 B"; const units = ["B", "KB", "MB", "GB", "TB"]; const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1); const value = bytes / Math.pow(1024, index); return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`; }
function formatDate(value: string): string { const date = new Date(value); return Number.isNaN(date.getTime()) ? "Unknown" : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date); }
function formatRelative(value: string): string { const time = new Date(value).getTime(); if (Number.isNaN(time)) return "Unknown"; const seconds = Math.max(Math.round((Date.now() - time) / 1000), 0); if (seconds < 60) return "just now"; const minutes = Math.round(seconds / 60); if (minutes < 60) return `${minutes}m ago`; const hours = Math.round(minutes / 60); if (hours < 24) return `${hours}h ago`; const days = Math.round(hours / 24); if (days < 30) return `${days}d ago`; return formatDate(value); }
