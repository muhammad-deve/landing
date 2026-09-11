"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  BookOpen,
  Check,
  Camera,
  ChevronRight,
  CircleDollarSign,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  FileText,
  Globe2,
  HardDrive,
  KeyRound,
  LayoutDashboard,
  Loader2,
  LockKeyhole,
  LogOut,
  Mail,
  MailCheck,
  Menu,
  Network,
  Plus,
  Radio,
  RefreshCw,
  RotateCw,
  Server,
  ShieldCheck,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { GoPortLogo, GoPortMark } from "@/components/goport-logo";
import { InstallCommand } from "@/components/install-command";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  type BillingCard,
  type BillingData,
  type DashboardData,
  type DashboardDomain,
  type TokenItem,
  type UsageData,
  type UsageRange,
  type UsageSeries,
  API_BASE_URL,
  clearAuthSession,
  changePassword,
  confirmEmailChange,
  createToken,
  deleteToken,
  deleteTunnel,
  getDashboard,
  getDashboardUsage,
  readAuthSession,
  requestEmailChange,
  stopTunnel,
  UnauthorizedError,
  uploadProfilePhoto,
  updateProfileName,
  updateStoredAuthSession,
  updateStoredProfileName,
} from "@/lib/api";
import { copyText } from "@/lib/clipboard";
import { isPasswordValid } from "@/lib/password";

type DashboardView =
  | "Dashboard"
  | "tunnels"
  | "billing"
  | "tokens"
  | "profile"
  | "docs";

const DASHBOARD_VIEWS = new Set<DashboardView>([
  "Dashboard",
  "tunnels",
  "billing",
  "tokens",
  "profile",
  "docs",
]);

function dashboardViewFromHash(hash: string): DashboardView {
  const rawView = hash.replace(/^#/, "");
  if (rawView === "settings") return "profile";
  const candidate = rawView as DashboardView;
  return DASHBOARD_VIEWS.has(candidate) ? candidate : "Dashboard";
}

interface NavItem {
  id: DashboardView;
  label: string;
  icon: LucideIcon;
}

const NAV_GROUPS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Workspace",
    items: [
      { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "tunnels", label: "Tunnels", icon: Network },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "billing", label: "Billing", icon: CreditCard },
      { id: "tokens", label: "API keys & tokens", icon: KeyRound },
    ],
  },
];

const VIEW_COPY: Record<DashboardView, { title: string; description: string }> = {
  Dashboard: { title: "Dashboard", description: "Your tunnels, traffic, and next action in one place." },
  tunnels: { title: "Tunnels", description: "Manage public endpoints connected to your local services." },
  billing: { title: "Billing", description: "Manage your plan, limits, and future invoices." },
  tokens: { title: "API keys & tokens", description: "Authenticate trusted machines and CI environments." },
  profile: { title: "Profile", description: "Manage your photo, personal details, and sign-in security." },
  docs: { title: "Getting started", description: "Go from install to a public HTTPS URL in a few minutes." },
};

const PANEL = "border border-border/80 bg-white/90 dark:bg-card/72";
const SIDEBAR_PRESS = "cursor-pointer transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-inset motion-reduce:transform-none motion-reduce:transition-none";
const CANCELLATION_REASONS = [
  { id: "price", label: "The price is too high" },
  { id: "usage", label: "I do not use GoPort enough" },
  { id: "features", label: "A feature I need is missing" },
  { id: "alternative", label: "I am switching to another service" },
  { id: "other", label: "Something else" },
] as const;

export function DashboardClient() {
  const router = useRouter();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [view, setView] = useState<DashboardView>("Dashboard");
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
    const syncViewFromUrl = () => {
      const rawView = window.location.hash.replace(/^#/, "");
      const nextView = dashboardViewFromHash(window.location.hash);
      if (rawView === "settings") {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#profile`);
      } else if (rawView && !DASHBOARD_VIEWS.has(rawView as DashboardView)) {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      }
      setView(nextView);
      setMobileMenuOpen(false);
    };

    syncViewFromUrl();
    window.addEventListener("hashchange", syncViewFromUrl);
    window.addEventListener("popstate", syncViewFromUrl);
    return () => {
      window.removeEventListener("hashchange", syncViewFromUrl);
      window.removeEventListener("popstate", syncViewFromUrl);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => void load(true), 15_000);
    return () => window.clearInterval(interval);
  }, [load]);

  const navigate = (next: DashboardView) => {
    if (next === view) {
      setMobileMenuOpen(false);
      return;
    }

    const baseUrl = `${window.location.pathname}${window.location.search}`;
    window.history.pushState(null, "", next === "Dashboard" ? baseUrl : `${baseUrl}#${next}`);
    setView(next);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
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
              onClick={() => navigate("docs")}
              className="h-10 rounded-xl bg-primary px-3.5 text-primary-foreground shadow-none hover:bg-primary/90"
            >
              <BookOpen className="size-4" />
              <span className="hidden sm:inline">Quick Start</span>
              <span className="sm:hidden">Start</span>
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

          {view === "Dashboard" && (
            <DashboardPanel
              authToken={authToken}
              data={data}
              firstName={firstName}
              activeDomains={activeDomains}
              onAuthError={handleAuthError}
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
          {view === "billing" && <BillingPanel billing={data.billing} />}
          {view === "tokens" && (
            <TokensPanel
              authToken={authToken}
              tokens={data.tokens}
              onChange={() => void load(true)}
              onAuthError={handleAuthError}
            />
          )}
          {view === "profile" && (
            <SettingsPanel
              authToken={authToken}
              data={data}
              onChange={() => load(true)}
              onAuthError={handleAuthError}
            />
          )}
          {view === "docs" && <DocsPanel tokens={data.tokens} onNavigate={navigate} />}
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
      {open && <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-50 cursor-pointer bg-[#102124]/35 backdrop-blur-sm lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-[60] flex w-64 flex-col border-r border-border/80 bg-background px-3.5 py-4 transition-transform duration-200 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-12 items-center justify-between px-2">
          <Link href="/" aria-label="GoPort home"><GoPortLogo className="h-6 w-auto text-foreground" /></Link>
          <button type="button" onClick={onClose} className={`${SIDEBAR_PRESS} flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary lg:hidden`} aria-label="Close navigation"><X className="size-4" /></button>
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
                      className={`${SIDEBAR_PRESS} sidebar-press-fill flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium ${active ? "bg-primary/11 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
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
          <button type="button" onClick={() => onNavigate("docs")} className={`${SIDEBAR_PRESS} sidebar-press-fill flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium ${view === "docs" ? "bg-primary/11 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
            <BookOpen className="size-[17px]" />
            <span>Getting started</span>
          </button>
        </nav>

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center gap-1 rounded-xl">
            <button
              type="button"
              onClick={() => onNavigate("profile")}
              className={`${SIDEBAR_PRESS} sidebar-press-fill flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-secondary ${view === "profile" ? "bg-primary/11" : ""}`}
              aria-label="Open profile"
            >
              <Avatar name={data.name} avatar={data.avatar} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{data.name || "GoPort developer"}</span>
                <span className="block truncate text-xs text-muted-foreground">{data.email}</span>
              </span>
            </button>
            <button type="button" onClick={onLogout} className={`${SIDEBAR_PRESS} flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground active:bg-secondary`} aria-label="Log out" title="Log out"><LogOut className="size-4" /></button>
          </div>
        </div>
      </aside>
    </>
  );
}

function DashboardPanel({
  authToken,
  data,
  firstName,
  activeDomains,
  onAuthError,
  onCreate,
  onNavigate,
  onSelectDomain,
  onStop,
  busyAction,
}: {
  authToken: string | null;
  data: DashboardData;
  firstName: string;
  activeDomains: DashboardDomain[];
  onAuthError: () => void;
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

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(19rem,0.75fr)]">
        <TunnelUsageChart
          authToken={authToken}
          domains={data.domains}
          refreshKey={`${data.totalRequests}:${data.totalBytes}:${data.domains.length}`}
          onAuthError={onAuthError}
        />
        <section className={`${PANEL} overflow-hidden rounded-[1.4rem]`}>
          <PanelHeader title="Recent tunnels" description="Public endpoints created by your CLI." action="View all" onAction={() => onNavigate("tunnels")} />
          {data.domains.length ? (
            <div className="divide-y divide-border/70">
              {data.domains.slice(0, 5).map((domain) => <CompactTunnelRow key={domain.subdomain} domain={domain} onClick={() => onSelectDomain(domain)} />)}
            </div>
          ) : <CompactEmpty onCreate={onCreate} />}
        </section>
      </div>
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
    <section className="relative overflow-hidden rounded-[1.4rem] border border-[#26433d] bg-[#102124] px-5 py-4 text-white sm:px-6 sm:py-5">
      <div className="absolute -right-8 -top-20 size-48 rounded-full border border-[#35d39a]/15" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-white/50"><span className="size-2 rounded-full bg-white/30" />No active tunnel</div>
          <h3 className="mt-2 text-lg font-semibold tracking-[-0.035em]">Your next public URL starts locally.</h3>
          <p className="mt-1.5 max-w-2xl text-sm leading-5 text-white/55">Choose a port, copy the command, and run it beside your local app.</p>
        </div>
        <button type="button" onClick={onCreate} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#38d996] px-4 text-sm font-semibold text-[#07120e] hover:bg-[#63e4b2]"><Plus className="size-4" />Create tunnel command</button>
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

const USAGE_RANGES: Array<{ value: UsageRange; label: string }> = [
  { value: "hour", label: "1H" },
  { value: "day", label: "24H" },
  { value: "week", label: "7D" },
];

const USAGE_COLORS = Array.from({ length: 10 }, (_, index) => `var(--usage-${index + 1})`);

type UsageChartDatum = {
  timestamp: string;
  values: Record<string, { requests: number; bytes: number }>;
  [key: string]: string | number | Record<string, { requests: number; bytes: number }>;
};

function TunnelUsageChart({
  authToken,
  domains,
  refreshKey,
  onAuthError,
}: {
  authToken: string | null;
  domains: DashboardDomain[];
  refreshKey: string;
  onAuthError: () => void;
}) {
  const [range, setRange] = useState<UsageRange>("day");
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!authToken) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    void getDashboardUsage(authToken, range, controller.signal)
      .then(setUsage)
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (err instanceof UnauthorizedError) {
          onAuthError();
          return;
        }
        setError(err instanceof Error ? err.message : "Couldn't load usage history.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [authToken, range, refreshKey, retryKey, onAuthError]);

  const series = useMemo<UsageSeries[]>(() => {
    const ranked = [...(usage?.series ?? [])];
    ranked.sort((left, right) => {
      const leftRequests = left.points.reduce((total, point) => total + point.requests, 0);
      const rightRequests = right.points.reduce((total, point) => total + point.requests, 0);
      return rightRequests - leftRequests;
    });
    return ranked.slice(0, 10);
  }, [usage]);

  const chartData = useMemo<UsageChartDatum[]>(() => {
    const firstSeries = series[0];
    if (!firstSeries) return [];
    return firstSeries.points.map((point, pointIndex) => {
      const values: UsageChartDatum["values"] = {};
      const row: UsageChartDatum = { timestamp: point.timestamp, values };
      for (const item of series) {
        const seriesPoint = item.points[pointIndex];
        const requests = seriesPoint?.requests ?? 0;
        const bytes = seriesPoint?.bytes ?? 0;
        row[item.tunnelId] = requests;
        values[item.tunnelId] = { requests, bytes };
      }
      return row;
    });
  }, [series]);

  const hasTraffic = chartData.some((row) =>
    Object.values(row.values).some((value) => value.requests > 0 || value.bytes > 0),
  );
  const totalSeriesCount = usage?.series.length ?? 0;

  return (
    <section className={`${PANEL} min-w-0 overflow-hidden rounded-[1.4rem]`}>
      <div className="flex flex-col gap-4 border-b border-border/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h3 className="text-sm font-semibold">Tunnel usage</h3>
          <p className="mt-1 text-xs text-muted-foreground">{totalSeriesCount > 10 ? `Top 10 of ${totalSeriesCount} tunnels` : "Requests over time"} · hover for requests and transferred bytes.</p>
        </div>
        <div className="flex items-center gap-2">
          {loading && usage && <Loader2 className="size-3.5 animate-spin text-muted-foreground" aria-label="Refreshing usage" />}
          <div className="inline-flex w-fit rounded-xl bg-secondary p-1" aria-label="Usage date range">
          {USAGE_RANGES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                if (option.value === range) return;
                setUsage(null);
                setRange(option.value);
              }}
              className={`rounded-lg px-3 py-1.5 font-mono text-[11px] font-semibold transition-colors ${range === option.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              aria-pressed={range === option.value}
            >
              {option.label}
            </button>
          ))}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        {loading && !usage ? (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground"><Loader2 className="mr-2 size-4 animate-spin" />Loading usage…</div>
        ) : error && !usage ? (
          <div className="flex h-[300px] flex-col items-center justify-center px-6 text-center"><p className="text-sm font-medium">Usage history is unavailable</p><p className="mt-1.5 text-xs text-muted-foreground">{error}</p><button type="button" onClick={() => setRetryKey((value) => value + 1)} className="mt-4 text-sm font-semibold text-primary hover:underline">Try again</button></div>
        ) : domains.length === 0 ? (
          <div className="flex h-[300px] flex-col items-center justify-center px-6 text-center"><Activity className="size-5 text-primary" /><p className="mt-3 text-sm font-medium">No tunnel usage yet</p><p className="mt-1.5 max-w-sm text-xs leading-5 text-muted-foreground">Create a tunnel and send traffic through it to start this chart.</p></div>
        ) : (
          <>
            <div className="relative h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
                  <XAxis
                    dataKey="timestamp"
                    axisLine={false}
                    tickLine={false}
                    minTickGap={28}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    tickFormatter={(value: string) => formatUsageTick(value, range)}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    tickFormatter={formatCompactNumber}
                  />
                  <Tooltip
                    cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "4 4", strokeOpacity: 0.55 }}
                    content={<TunnelUsageTooltip range={range} series={series} />}
                  />
                  {series.map((item, index) => (
                    <Line
                      key={item.tunnelId}
                      type="monotone"
                      dataKey={item.tunnelId}
                      name={item.subdomain}
                      stroke={USAGE_COLORS[index % USAGE_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2, fill: "var(--background)" }}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              {!hasTraffic && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-8"><span className="rounded-lg border border-border bg-background/90 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur">No traffic recorded in this period yet.</span></div>
              )}
            </div>
            <div className="mt-3 flex max-h-20 flex-wrap gap-x-4 gap-y-2 overflow-y-auto border-t border-border/60 pt-3">
              {series.map((item, index) => (
                <div key={item.tunnelId} className="flex min-w-0 items-center gap-1.5" title={item.url}>
                  <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: USAGE_COLORS[index % USAGE_COLORS.length] }} />
                  <span className="max-w-40 truncate font-mono text-[10px] text-muted-foreground">{item.subdomain}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function TunnelUsageTooltip({
  active,
  label,
  payload,
  range,
  series,
}: {
  active?: boolean;
  label?: string | number;
  payload?: Array<{ payload?: UsageChartDatum }>;
  range: UsageRange;
  series: UsageSeries[];
}) {
  const row = payload?.[0]?.payload;
  if (!active || !row || !label) return null;

  return (
    <div className="max-h-72 min-w-56 overflow-y-auto rounded-xl border border-border bg-background/95 p-3 text-xs shadow-xl backdrop-blur">
      <p className="font-medium text-foreground">{formatUsageTooltipDate(String(label), range)}</p>
      <div className="mt-2.5 space-y-2">
        {series.map((item, index) => {
          const value = row.values[item.tunnelId] ?? { requests: 0, bytes: 0 };
          return (
            <div key={item.tunnelId} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <span className="flex min-w-0 items-center gap-2"><span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: USAGE_COLORS[index % USAGE_COLORS.length] }} /><span className="truncate font-mono text-muted-foreground">{item.subdomain}</span></span>
              <span className="text-right font-mono"><strong className="font-semibold text-foreground">{formatNumber(value.requests)}</strong><span className="ml-1 text-muted-foreground">req</span><span className="mx-1.5 text-border">·</span><span className="text-muted-foreground">{formatBytes(value.bytes)}</span></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatUsageTick(value: string, range: UsageRange) {
  const date = new Date(value);
  if (range === "week") return new Intl.DateTimeFormat(undefined, { weekday: "short", timeZone: "UTC" }).format(date);
  return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: range === "hour" ? "2-digit" : undefined }).format(date);
}

function formatUsageTooltipDate(value: string, range: UsageRange) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: range === "week" ? "UTC" : undefined,
    timeZoneName: range === "week" ? "short" : undefined,
  }).format(new Date(value));
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function BillingPanel({ billing }: { billing?: BillingData }) {
  const [cards, setCards] = useState<BillingCard[]>(billing?.cards ?? []);
  const [subscription, setSubscription] = useState(billing?.subscription ?? null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const cardRemovalLocked = Boolean(subscription && subscription.status !== "canceled");
  const canCancel = Boolean(subscription && !subscription.cancelAtPeriodEnd && subscription.status !== "canceled");
  const nextAmount = subscription?.nextChargeAmountCents ?? subscription?.amountCents ?? 0;

  const removeCard = (card: BillingCard) => {
    if (cardRemovalLocked) return;
    setCards((current) => current.filter((item) => item.id !== card.id));
    setNotice(`${card.brand} ending in ${card.last4} was removed.`);
  };

  const acceptFreeMonth = () => {
    setSubscription((current) => current ? { ...current, freeMonthOfferUsed: true, nextChargeAmountCents: 0 } : current);
    setCancelOpen(false);
    setNotice("Your next month is free. Your subscription remains active and you will not be charged for the next billing period.");
  };

  const scheduleCancellation = () => {
    setSubscription((current) => current ? { ...current, cancelAtPeriodEnd: true } : current);
    setCancelOpen(false);
    setNotice(`Cancellation scheduled${subscription?.currentPeriodEnd ? ` for ${formatDate(subscription.currentPeriodEnd)}` : " for the end of this billing period"}.`);
  };

  return (
    <div className="space-y-6">
      <SectionLead title="Billing, without surprises." description="Manage your plan and payment methods, then review every charge made to your account." />

      {notice && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-primary/25 bg-primary/[0.06] px-4 py-3 text-sm text-primary">
          <span className="flex items-start gap-2"><Check className="mt-0.5 size-4 shrink-0" />{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="cursor-pointer rounded-md p-1 hover:bg-primary/10" aria-label="Dismiss billing message"><X className="size-4" /></button>
        </div>
      )}

      <section className={`${PANEL} overflow-hidden rounded-[1.4rem]`}>
        <div className="flex flex-col justify-between gap-6 p-5 sm:flex-row sm:items-end sm:p-7">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary"><CircleDollarSign className="size-4" />Current plan</div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h3 className="text-3xl font-semibold tracking-[-0.05em]">{subscription?.planName ?? "Free"}</h3>
              {subscription?.cancelAtPeriodEnd ? <span className="rounded-full bg-amber-500/12 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">Cancellation scheduled</span> : subscription && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize text-primary">{subscription.status}</span>}
            </div>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              {subscription
                ? subscription.cancelAtPeriodEnd
                  ? `Your access continues until ${subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : "the end of this billing period"}.`
                  : `Renews ${subscription.currentPeriodEnd ? `on ${formatDate(subscription.currentPeriodEnd)}` : "at the end of the current billing period"}.`
                : "You are using the Free plan. No payment method is required."}
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:items-end">
            <div className="rounded-xl border border-border bg-secondary/25 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Next charge</span>
              <span className="ml-8 font-mono font-semibold">{formatCurrency(nextAmount, subscription?.currency ?? "USD")}</span>
            </div>
            {canCancel && <Button type="button" variant="outline" onClick={() => setCancelOpen(true)} className="h-10 cursor-pointer rounded-xl border-border bg-transparent text-muted-foreground shadow-none hover:border-destructive/35 hover:bg-destructive/5 hover:text-destructive">Cancel subscription</Button>}
          </div>
        </div>
      </section>

      <section className={`${PANEL} overflow-hidden rounded-[1.4rem]`}>
        <PanelHeader title="Payment methods" description={`${cards.length} saved ${cards.length === 1 ? "card" : "cards"}`} />
        {cards.length ? (
          <div className="divide-y divide-border/70">
            {cards.map((card) => (
              <div key={card.id} className="flex items-center gap-4 p-5 sm:px-6">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary/35 text-muted-foreground"><CreditCard className="size-4" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h4 className="text-sm font-semibold capitalize">{card.brand} •••• {card.last4}</h4>{card.isDefault && <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Default</span>}</div>
                  <p className="mt-1 text-xs text-muted-foreground">Expires {String(card.expiresMonth).padStart(2, "0")}/{String(card.expiresYear).slice(-2)}</p>
                </div>
                <button type="button" onClick={() => removeCard(card)} disabled={cardRemovalLocked} className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-muted-foreground" aria-label={`Remove ${card.brand} ending in ${card.last4}`} title={cardRemovalLocked ? "Cancel your active subscription before removing a card" : "Remove card"}><Trash2 className="size-4" /></button>
              </div>
            ))}
          </div>
        ) : (
          <BillingEmpty icon={CreditCard} title="No saved cards" description="A payment method will appear here after you subscribe to a paid plan." />
        )}
        {cardRemovalLocked && cards.length > 0 && <div className="flex items-start gap-2 border-t border-border/70 bg-secondary/20 px-5 py-3 text-xs leading-5 text-muted-foreground sm:px-6"><ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />Payment methods cannot be removed while a subscription is active.</div>}
      </section>

      <section className={`${PANEL} overflow-hidden rounded-[1.4rem]`}>
        <PanelHeader title="Recent transactions" description="Your latest subscription charges and their payment methods." />
        {billing?.transactions.length ? (
          <div className="divide-y divide-border/70">
            {billing.transactions.map((transaction) => (
              <div key={transaction.id} className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-6">
                <div className="min-w-0"><h4 className="truncate text-sm font-semibold">{transaction.description}</h4><p className="mt-1 text-xs text-muted-foreground">{formatDate(transaction.chargedAt)}</p></div>
                <span className="w-fit rounded-lg border border-border bg-secondary/25 px-2.5 py-1.5 text-xs text-muted-foreground capitalize">{transaction.cardBrand} •••• {transaction.cardLast4}</span>
                <div className="sm:min-w-28 sm:text-right"><p className="font-mono text-sm font-semibold">{formatCurrency(transaction.amountCents, transaction.currency)}</p><p className={`mt-1 text-xs font-medium capitalize ${transaction.status === "paid" ? "text-primary" : transaction.status === "failed" ? "text-destructive" : "text-muted-foreground"}`}>{transaction.status}</p></div>
              </div>
            ))}
          </div>
        ) : (
          <BillingEmpty icon={FileText} title="No transactions yet" description="Successful charges will appear here with the card used for each payment." />
        )}
      </section>

      {cancelOpen && subscription && (
        <CancelSubscriptionDialog
          subscription={subscription}
          onClose={() => setCancelOpen(false)}
          onAcceptOffer={acceptFreeMonth}
          onCancel={scheduleCancellation}
        />
      )}
    </div>
  );
}

function BillingEmpty({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return <div className="flex items-start gap-4 p-5 sm:p-6"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground"><Icon className="size-4" /></span><div><h4 className="text-sm font-semibold">{title}</h4><p className="mt-1.5 text-sm leading-6 text-muted-foreground">{description}</p></div></div>;
}

function CancelSubscriptionDialog({ subscription, onClose, onAcceptOffer, onCancel }: { subscription: NonNullable<BillingData["subscription"]>; onClose: () => void; onAcceptOffer: () => void; onCancel: () => void }) {
  const [step, setStep] = useState<"reason" | "offer">("reason");
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const validReason = Boolean(reason && (reason !== "other" || customReason.trim().length >= 3));

  const continueCancellation = () => {
    if (!validReason) return;
    if (subscription.freeMonthOfferUsed) onCancel();
    else setStep("offer");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button type="button" onClick={onClose} className="absolute inset-0 cursor-pointer bg-[#071012]/55 backdrop-blur-sm" aria-label="Close cancellation dialog" />
      <div role="dialog" aria-modal="true" aria-labelledby="cancel-subscription-title" className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[1.4rem] border border-border bg-background p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-sm font-medium text-destructive">Cancel subscription</p><h3 id="cancel-subscription-title" className="mt-1 text-xl font-semibold tracking-[-0.03em]">{step === "reason" ? "What made you decide to leave?" : "Before you go—take a month on us."}</h3></div>
          <button type="button" onClick={onClose} className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Close"><X className="size-4" /></button>
        </div>

        {step === "reason" ? (
          <>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Your answer helps us improve GoPort. Choose the reason that best fits.</p>
            <div className="mt-5 space-y-2" role="radiogroup" aria-label="Cancellation reason">
              {CANCELLATION_REASONS.map((option) => (
                <label key={option.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${reason === option.id ? "border-primary/45 bg-primary/[0.06] text-foreground" : "border-border hover:bg-secondary/45"}`}>
                  <input type="radio" name="cancellation-reason" value={option.id} checked={reason === option.id} onChange={() => setReason(option.id)} className="mt-0.5 size-4 accent-[var(--primary)]" />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            {reason === "other" && <textarea value={customReason} onChange={(event) => setCustomReason(event.target.value)} placeholder="Tell us what we could do better" rows={3} className="mt-3 w-full resize-none rounded-xl border border-border bg-background px-3.5 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20" />}
            <div className="mt-6 flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose} className="h-10 cursor-pointer rounded-xl">Keep my subscription</Button>
              <Button type="button" onClick={continueCancellation} disabled={!validReason} className="h-10 cursor-pointer rounded-xl bg-foreground text-background shadow-none hover:bg-foreground/90">Continue</Button>
            </div>
          </>
        ) : (
          <>
            <div className="mt-6 rounded-[1.2rem] border border-primary/25 bg-primary/[0.06] p-5">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><CircleDollarSign className="size-5" /></span>
              <h4 className="mt-5 text-lg font-semibold">Keep every Pro feature for one month—free.</h4>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Your next bill will be {formatCurrency(0, subscription.currency)}. After the free month, your regular {formatCurrency(subscription.amountCents, subscription.currency)} / {subscription.interval} price resumes. This offer is available once per account.</p>
            </div>
            <div className="mt-6 space-y-2">
              <Button type="button" onClick={onAcceptOffer} className="h-11 w-full cursor-pointer rounded-xl bg-primary text-primary-foreground shadow-none hover:bg-primary/90">Use my free month</Button>
              <Button type="button" variant="ghost" onClick={onCancel} className="h-11 w-full cursor-pointer rounded-xl text-destructive hover:bg-destructive/8 hover:text-destructive">No thanks, cancel subscription</Button>
            </div>
            <button type="button" onClick={() => setStep("reason")} className="mt-4 w-full cursor-pointer text-center text-xs text-muted-foreground hover:text-foreground">Back to reason</button>
          </>
        )}
      </div>
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

function SettingsPanel({ authToken, data, onChange, onAuthError }: { authToken: string | null; data: DashboardData; onChange: () => Promise<void>; onAuthError: () => void }) {
  return (
    <div className="space-y-6">
      <SectionLead title="Your account." description="Keep your identity and sign-in details up to date." />
      <section className={`${PANEL} mx-auto max-w-5xl overflow-hidden rounded-[1.4rem]`}>
        <div className="p-5 sm:p-7">
          <div className="flex items-center gap-4">
            <ProfilePhotoEditor authToken={authToken} data={data} onChange={onChange} onAuthError={onAuthError} />
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold">{data.name || "GoPort developer"}</h3>
              <p className="mt-1 truncate text-sm text-muted-foreground">{data.email}</p>
            </div>
            <p className="ml-auto hidden max-w-48 text-right text-xs leading-5 text-muted-foreground sm:block">Select the photo to replace it.</p>
          </div>
          <ProfileNameEditor authToken={authToken} name={data.name} onChange={onChange} onAuthError={onAuthError} />
        </div>
      </section>

      <section className={`${PANEL} mx-auto max-w-5xl overflow-hidden rounded-[1.4rem]`}>
        <div className="bg-secondary/15 px-5 py-3 sm:px-7">
          <p className="text-xs font-semibold text-muted-foreground">Sign-in and security</p>
        </div>
        <ChangeEmailPanel authToken={authToken} currentEmail={data.email} onChange={onChange} onAuthError={onAuthError} />
        <ChangePasswordPanel authToken={authToken} onChange={onChange} onAuthError={onAuthError} />
      </section>
    </div>
  );
}

function ProfileNameEditor({ authToken, name, onChange, onAuthError }: { authToken: string | null; name: string; onChange: () => Promise<void>; onAuthError: () => void }) {
  const current = splitFullName(name);
  const [firstName, setFirstName] = useState(current.firstName);
  const [lastName, setLastName] = useState(current.lastName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const next = splitFullName(name);
    setFirstName(next.firstName);
    setLastName(next.lastName);
  }, [name]);

  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
  const hasChanges = fullName !== name.trim();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!authToken || loading) {
      if (!authToken) onAuthError();
      return;
    }

    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      await updateProfileName(authToken, firstName, lastName);
      updateStoredProfileName(fullName);
      await onChange();
      setSaved(true);
    } catch (err) {
      if (err instanceof UnauthorizedError) onAuthError();
      else setError(err instanceof Error ? err.message : "Couldn't update your name.");
    } finally {
      setLoading(false);
    }
  };

  const editFirstName = (value: string) => { setFirstName(value); setSaved(false); };
  const editLastName = (value: string) => { setLastName(value); setSaved(false); };

  return (
    <form onSubmit={submit} className="mt-7 max-w-2xl border-t border-border/80 pt-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="profile-first-name">First name</Label>
          <Input id="profile-first-name" value={firstName} onChange={(event) => editFirstName(event.target.value)} autoComplete="given-name" maxLength={60} required className="h-10 rounded-xl bg-secondary/20" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-last-name">Last name</Label>
          <Input id="profile-last-name" value={lastName} onChange={(event) => editLastName(event.target.value)} autoComplete="family-name" maxLength={60} className="h-10 rounded-xl bg-secondary/20" />
        </div>
      </div>
      <div className="mt-4 flex min-h-10 flex-wrap items-center gap-3">
        <Button type="submit" disabled={!firstName.trim() || !hasChanges || loading} className="h-10 cursor-pointer rounded-xl bg-primary px-4 text-primary-foreground shadow-none disabled:pointer-events-auto disabled:cursor-not-allowed">
          {loading && <Loader2 className="size-4 animate-spin" />}Save name
        </Button>
        {saved && <p className="inline-flex items-center gap-1.5 text-xs font-medium text-primary" role="status"><Check className="size-3.5" />Name updated</p>}
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      </div>
    </form>
  );
}

function ChangeEmailPanel({ authToken, currentEmail, onChange, onAuthError }: { authToken: string | null; currentEmail: string; onChange: () => Promise<void>; onAuthError: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [otpId, setOtpId] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [changed, setChanged] = useState(false);
  const awaitingCode = Boolean(otpId);

  const requestCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!authToken || loading) {
      if (!authToken) onAuthError();
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const response = await requestEmailChange(authToken, newEmail.trim());
      setOtpId(response.otpId);
      setCode("");
    } catch (err) {
      if (err instanceof UnauthorizedError) onAuthError();
      else setError(err instanceof Error ? err.message : "Couldn't send the verification code.");
    } finally {
      setLoading(false);
    }
  };

  const confirmCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!authToken || code.length !== 6 || loading) return;
    setError(null);
    setLoading(true);
    try {
      const response = await confirmEmailChange(authToken, otpId, code);
      updateStoredAuthSession(response.token, response.email);
      await onChange();
      setChanged(true);
      setExpanded(false);
      setOtpId("");
      setCode("");
      setNewEmail("");
    } catch (err) {
      if (err instanceof UnauthorizedError) onAuthError();
      else setError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    setExpanded(false);
    setNewEmail("");
    setOtpId("");
    setCode("");
    setError(null);
  };

  return (
    <div className="border-t border-border/80 p-5 sm:px-7 sm:py-6">
      <div className="flex items-center gap-3.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Mail className="size-4" /></span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">Email address</h3>
          <p className="mt-1 truncate text-xs text-muted-foreground">{currentEmail}</p>
        </div>
        <Button type="button" variant="outline" onClick={() => expanded ? close() : setExpanded(true)} className="h-9 w-44 shrink-0 cursor-pointer justify-center rounded-xl px-3.5 shadow-none">
          {expanded ? "Cancel" : "Change email"}{!expanded && <ChevronRight className="size-3.5" />}
        </Button>
      </div>

      {changed && !expanded && <p className="mt-3 flex items-center gap-1.5 pl-[3.25rem] text-xs font-medium text-primary" role="status"><Check className="size-3.5" />Email updated</p>}

      {expanded && awaitingCode ? (
        <form onSubmit={confirmCode} className="ml-0 mt-5 max-w-xl border-t border-border/70 pt-5 sm:ml-[3.25rem]">
          <div className="flex items-start gap-3">
            <MailCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-sm leading-5 text-muted-foreground">Enter the six-digit code sent to <span className="font-medium text-foreground">{newEmail}</span>.</p>
          </div>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <Label htmlFor="email-change-code">Verification code</Label>
              <InputOTP id="email-change-code" maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup className="gap-2">
                  {Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index} className="size-10 rounded-md border-border bg-background first:rounded-md first:border last:rounded-md" />)}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => { setOtpId(""); setCode(""); setError(null); }} className="h-10 rounded-xl">Use another email</Button>
              <Button type="submit" disabled={code.length !== 6 || loading} className="h-10 rounded-xl bg-primary text-primary-foreground shadow-none">{loading && <Loader2 className="size-4 animate-spin" />}Verify email</Button>
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
        </form>
      ) : expanded ? (
        <form onSubmit={requestCode} className="ml-0 mt-5 max-w-xl border-t border-border/70 pt-5 sm:ml-[3.25rem]">
          <div className="space-y-2">
            <Label htmlFor="new-email">New email address</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input id="new-email" type="email" value={newEmail} onChange={(event) => { setNewEmail(event.target.value); setChanged(false); }} placeholder="you@company.com" autoComplete="email" required className="h-10 rounded-xl bg-secondary/20" />
              <Button type="submit" disabled={!/\S+@\S+\.\S+/.test(newEmail) || newEmail.trim().toLowerCase() === currentEmail.toLowerCase() || loading} className="h-10 shrink-0 rounded-xl bg-primary px-4 text-primary-foreground shadow-none">{loading && <Loader2 className="size-4 animate-spin" />}Send code</Button>
            </div>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">We will verify the new address before replacing this one.</p>
          {error && <p className="mt-3 text-sm text-destructive" role="alert">{error}</p>}
        </form>
      ) : null}
    </div>
  );
}

function ChangePasswordPanel({ authToken, onChange, onAuthError }: { authToken: string | null; onChange: () => Promise<void>; onAuthError: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const matches = confirmPassword.length > 0 && newPassword === confirmPassword;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!authToken || loading) {
      if (!authToken) onAuthError();
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const response = await changePassword(authToken, currentPassword, newPassword, confirmPassword);
      updateStoredAuthSession(response.token);
      await onChange();
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setExpanded(false);
      setLoading(false);
    } catch (err) {
      if (err instanceof UnauthorizedError) onAuthError();
      else setError(err instanceof Error ? err.message : "Couldn't change your password.");
      setLoading(false);
    }
  };

  const close = () => {
    setExpanded(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswords(false);
    setError(null);
  };

  return (
    <div className="border-t border-border/80 p-5 sm:px-7 sm:py-6">
      <div className="flex items-center gap-3.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground"><LockKeyhole className="size-4" /></span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">Password</h3>
          <p className="mt-1 text-xs text-muted-foreground">Use 8+ characters with a letter and a number.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => expanded ? close() : setExpanded(true)} className="h-9 w-44 shrink-0 cursor-pointer justify-center rounded-xl px-3.5 shadow-none">
          {expanded ? "Cancel" : "Change password"}{!expanded && <ChevronRight className="size-3.5" />}
        </Button>
      </div>

      {success && !expanded && <p className="mt-3 flex items-center gap-1.5 pl-[3.25rem] text-xs font-medium text-primary" role="status"><Check className="size-3.5" />Password updated</p>}

      {expanded && (
        <form onSubmit={submit} className="ml-0 mt-5 max-w-md space-y-4 border-t border-border/70 pt-5 sm:ml-[3.25rem]">
          <div className="flex justify-end">
            <button type="button" onClick={() => setShowPasswords((value) => !value)} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
              {showPasswords ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}{showPasswords ? "Hide passwords" : "Show passwords"}
            </button>
          </div>
          <PasswordField id="current-password" label="Current password" value={currentPassword} onChange={setCurrentPassword} visible={showPasswords} autoComplete="current-password" />
          <PasswordField id="new-password" label="New password" value={newPassword} onChange={setNewPassword} visible={showPasswords} autoComplete="new-password" />
          <PasswordField id="confirm-password" label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} visible={showPasswords} autoComplete="new-password" />
          {confirmPassword && !matches && <p className="text-sm text-destructive" role="alert">New passwords do not match.</p>}
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <Button type="submit" disabled={!currentPassword || !isPasswordValid(newPassword) || !matches || loading} className="h-10 rounded-xl bg-primary px-4 text-primary-foreground shadow-none">{loading && <Loader2 className="size-4 animate-spin" />}Update password</Button>
        </form>
      )}
    </div>
  );
}

function PasswordField({ id, label, value, onChange, visible, autoComplete }: { id: string; label: string; value: string; onChange: (value: string) => void; visible: boolean; autoComplete: string }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} type={visible ? "text" : "password"} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} required className="h-11 rounded-xl bg-secondary/25" /></div>;
}

function DocsPanel({ tokens, onNavigate }: { tokens: TokenItem[]; onNavigate: (view: DashboardView) => void }) {
  const selectedToken = tokens.find((token) => token.name.toLowerCase() === "default") ?? tokens[0];
  const authCommand = selectedToken ? `goport auth ${selectedToken.token}` : "goport auth <token>";

  return (
    <div className="space-y-6">
      <SectionLead
        title="Start GoPort in three steps."
        description="Download the CLI, authenticate this computer, then expose your local app."
      />

      <section className={`${PANEL} overflow-hidden rounded-[1.4rem]`}>
        <ol className="divide-y divide-border/70">
          <GuideStep
            number="1"
            title="Download GoPort"
            description="Choose your operating system, then use the download button or copy the install command."
          >
            <InstallCommand />
          </GuideStep>

          <GuideStep
            number="2"
            title="Copy your token and authenticate"
            description="Copy this command and run it in your terminal. You only need to do this once per computer."
          >
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <KeyRound className="size-3.5 text-primary" />
                {selectedToken ? `Using your ${selectedToken.name} token` : "No token exists yet"}
              </p>
              {!selectedToken && (
                <button type="button" onClick={() => onNavigate("tokens")} className="w-fit text-xs font-semibold text-primary hover:underline">
                  Create a token
                </button>
              )}
            </div>
            <AuthCommand command={authCommand} />
          </GuideStep>

          <GuideStep
            number="3"
            title="Start using GoPort"
            description="Run this command while your local app is open."
          >
            <CopyCommand command="goport http 3000" />
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/[0.06] px-4 py-3">
              <Globe2 className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-xs leading-5 text-muted-foreground">
                Replace <code className="font-mono text-foreground">3000 </code> with your app&apos;s port. GoPort will show your public URL in the terminal.
              </p>
            </div>
          </GuideStep>
        </ol>
      </section>
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
  return (
    <div className={`${className} flex items-center gap-2 rounded-xl border border-border bg-white/85 px-3.5 ${compact ? "py-2.5" : "py-3.5"} font-mono text-xs text-foreground dark:border-[#29423f] dark:bg-[#102124] dark:text-white`}>
      <span className="text-primary dark:text-[#38d996]">$</span>
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap">{command}</code>
      <button type="button" onClick={copy} className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-[color,background-color,transform] hover:bg-secondary hover:text-foreground active:scale-95 dark:text-white/50 dark:hover:bg-white/8 dark:hover:text-white" aria-label={`Copy ${command}`}>
        {copied ? <Check className="size-4 text-primary dark:text-[#38d996]" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}

function AuthCommand({ command }: { command: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const token = command.startsWith("goport auth ") ? command.slice("goport auth ".length) : "";
  const hasToken = Boolean(token && token !== "<token>");
  const visibleToken = hasToken ? (revealed ? token : maskToken(token)) : "<token>";

  const copy = async () => {
    if (await copyText(command)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border bg-white/85 px-3.5 py-3.5 font-mono text-xs text-foreground dark:border-[#29423f] dark:bg-[#102124] dark:text-white">
      <span className="text-primary dark:text-[#38d996]">$</span>
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap">
        <span className="text-primary dark:text-[#73dfb8]">goport auth</span> <span>{visibleToken}</span>
      </code>
      {hasToken && (
        <button
          type="button"
          onClick={() => setRevealed((value) => !value)}
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-[color,background-color,transform] hover:bg-secondary hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-white/45 dark:hover:bg-white/8 dark:hover:text-white dark:focus-visible:ring-[#38d996]"
          aria-label={revealed ? "Hide token" : "Show token"}
        >
          {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      )}
      <button
        type="button"
        onClick={copy}
        className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-[color,background-color,transform] hover:bg-secondary hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-white/45 dark:hover:bg-white/8 dark:hover:text-white dark:focus-visible:ring-[#38d996]"
        aria-label="Copy authentication command"
      >
        {copied ? <Check className="size-4 text-primary dark:text-[#38d996]" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
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

function GuideStep({ number, title, description, children }: { number: string; title: string; description: React.ReactNode; children: React.ReactNode }) {
  return (
    <li className="grid gap-5 px-5 py-6 sm:px-7 sm:py-7 md:grid-cols-[16rem_minmax(0,1fr)] lg:gap-9">
      <div className="flex items-start gap-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-[0_0_0_5px_color-mix(in_srgb,var(--primary)_8%,transparent)]">{number}</span>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="min-w-0 md:pt-0.5">{children}</div>
    </li>
  );
}

function DetailField({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-border bg-secondary/30 px-4 py-3"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1.5 break-all font-mono text-xs font-medium">{value}</p></div>; }

function splitFullName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" "),
  };
}

function ProfilePhotoEditor({ authToken, data, onChange, onAuthError }: { authToken: string | null; data: DashboardData; onChange: () => Promise<void>; onAuthError: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const selectPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!authToken) {
      onAuthError();
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Choose an image smaller than 5 MB.");
      return;
    }

    const nextPreview = URL.createObjectURL(file);
    setPreview(nextPreview);
    setError(null);
    setUploading(true);
    try {
      await uploadProfilePhoto(authToken, file);
      await onChange();
      setPreview(null);
    } catch (err) {
      setPreview(null);
      if (err instanceof UnauthorizedError) onAuthError();
      else setError(err instanceof Error ? err.message : "Couldn't upload your profile picture.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="shrink-0">
      <label
        className={`group relative block size-14 rounded-full focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background ${uploading ? "cursor-wait" : "cursor-pointer"}`}
        title="Change profile picture"
      >
        <Avatar name={data.name} avatar={preview ?? data.avatar} large />
        <span className="absolute bottom-0.5 right-0.5 flex size-5 items-center justify-center rounded-full bg-background/95 text-primary shadow-sm ring-1 ring-border transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          {uploading ? <Loader2 className="size-3 animate-spin" /> : <Camera className="size-3" />}
        </span>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void selectPhoto(event)} disabled={uploading} className="sr-only" />
      </label>
      {error && <p className="mt-1 max-w-40 text-xs leading-4 text-destructive">{error}</p>}
    </div>
  );
}

function Avatar({ name, avatar, large = false }: { name: string; avatar?: string; large?: boolean }) {
  const initials = name?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "GP";
  const size = large ? "size-14" : "size-9";
  const src = avatar?.startsWith("/") ? `${API_BASE_URL}${avatar}` : avatar;
  if (src) return <img src={src} alt={`${name || "GoPort"} profile`} className={`${size} shrink-0 rounded-full border border-border object-cover`} referrerPolicy="no-referrer" />;
  return <span className={`${size} flex shrink-0 items-center justify-center rounded-full bg-[#102124] text-xs font-semibold text-white`}>{initials}</span>;
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
function formatCurrency(amountCents: number, currency: string): string { return new Intl.NumberFormat("en", { style: "currency", currency: currency.toUpperCase() }).format(amountCents / 100); }
function formatDate(value: string): string { const date = new Date(value); return Number.isNaN(date.getTime()) ? "Unknown" : new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date); }
function formatRelative(value: string): string { const time = new Date(value).getTime(); if (Number.isNaN(time)) return "Unknown"; const seconds = Math.max(Math.round((Date.now() - time) / 1000), 0); if (seconds < 60) return "just now"; const minutes = Math.round(seconds / 60); if (minutes < 60) return `${minutes}m ago`; const hours = Math.round(minutes / 60); if (hours < 24) return `${hours}h ago`; const days = Math.round(hours / 24); if (days < 30) return `${days}d ago`; return formatDate(value); }
