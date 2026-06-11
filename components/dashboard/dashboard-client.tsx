"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  Check,
  Copy,
  Eye,
  EyeOff,
  Globe,
  HardDrive,
  Loader2,
  LogOut,
  RefreshCw,
  Sparkles,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { GoPortLogo } from "@/components/goport-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type DashboardData,
  type DashboardDomain,
  clearAuthSession,
  getDashboard,
  readAuthSession,
  UnauthorizedError,
} from "@/lib/api";

export function DashboardClient() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const session = readAuthSession();
    if (!session) {
      router.replace("/login");
      return;
    }

    setError(null);
    try {
      const dashboard = await getDashboard(session.token);
      setData(dashboard);
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        clearAuthSession();
        router.replace("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Couldn't load your dashboard.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const logout = () => {
    clearAuthSession();
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="text-sm">Loading your dashboard…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button
          onClick={() => {
            setLoading(true);
            void load();
          }}
          className="h-10 bg-primary font-medium text-primary-foreground hover:bg-primary/90"
        >
          <RefreshCw className="size-4" />
          Try again
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const firstName = data.name?.trim().split(" ")[0] || "there";

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pb-24 pt-28">
      <Header name={firstName} email={data.email} onLogout={logout} />

      <div className="mt-10 flex flex-col gap-6">
        <TokenCard token={data.token} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            icon={Activity}
            label="Total requests"
            value={formatNumber(data.totalRequests)}
            hint="Across all your tunnels"
          />
          <StatCard
            icon={HardDrive}
            label="Data transferred"
            value={formatBytes(data.totalBytes)}
            hint="Total bandwidth served"
          />
          <StatCard
            icon={Globe}
            label="Domains"
            value={formatNumber(data.domains.length)}
            hint="Subdomains you own"
          />
        </div>

        <DomainsCard domains={data.domains} onRefresh={() => void load()} />
      </div>
    </div>
  );
}

function Header({
  name,
  email,
  onLogout,
}: {
  name: string;
  email: string;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
          <GoPortLogo className="h-6 w-auto text-foreground" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-foreground">{name}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
          <Button
            variant="ghost"
            onClick={onLogout}
            className="text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline">Log out</span>
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Welcome back, {name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your token, traffic, and tunnels — all in one place.
        </p>
      </div>
    </div>
  );
}

function TokenCard({ token }: { token: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const command = `goport auth ${token}`;
  const display = revealed ? command : `goport auth ${maskToken(token)}`;

  const copy = async () => {
    if (await copyText(command)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="rounded-xl border border-border/70 bg-card/40 p-6 backdrop-blur">
      <div className="flex items-center gap-2">
        <Terminal className="size-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Your CLI token</h2>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Run this once to link the GoPort CLI to your account. Keep it secret.
      </p>

      <div className="group mt-4 flex items-center gap-3 rounded-lg border border-border/70 bg-[#0a0a0a]/90 px-4 py-3.5 font-mono text-sm shadow-inner transition-colors hover:border-primary/40">
        <span className="select-none text-primary/90">$</span>
        <code className="flex-1 truncate text-left text-foreground/90">
          <span className="text-primary">goport</span>{" "}
          <span className="text-sky-400">auth</span>{" "}
          <span className="text-fuchsia-400">
            {revealed ? token : maskToken(token)}
          </span>
        </code>
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          aria-label={revealed ? "Hide token" : "Reveal token"}
          title={revealed ? "Hide token" : "Reveal token"}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
        <button
          type="button"
          onClick={copy}
          aria-label="Copy command"
          title={copied ? "Copied!" : "Copy command"}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          {copied ? (
            <Check className="size-4 text-primary" />
          ) : (
            <Copy className="size-4" />
          )}
        </button>
      </div>
      <span className="sr-only">{display}</span>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/40 p-5 backdrop-blur transition-colors hover:border-primary/30">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-4 text-primary" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-3 font-mono text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function DomainsCard({
  domains,
  onRefresh,
}: {
  domains: DashboardDomain[];
  onRefresh: () => void;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card/40 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="size-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Your domains</h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          aria-label="Refresh"
          title="Refresh"
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          <RefreshCw className="size-4" />
        </button>
      </div>

      {domains.length === 0 ? (
        <EmptyDomains />
      ) : (
        <div className="mt-5 flex flex-col divide-y divide-border/50">
          {domains.map((domain) => (
            <DomainRow key={domain.subdomain} domain={domain} />
          ))}
        </div>
      )}
    </div>
  );
}

function DomainRow({ domain }: { domain: DashboardDomain }) {
  return (
    <div className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <a
          href={domain.url}
          target="_blank"
          rel="noreferrer"
          className="group inline-flex w-fit items-center gap-1.5 font-mono text-sm text-foreground transition-colors hover:text-primary"
        >
          <span className="truncate">{domain.url.replace(/^https?:\/\//, "")}</span>
          <ArrowUpRight className="size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
        </a>
        <div className="flex items-center gap-2">
          {domain.isCustom ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
              <Sparkles className="size-2.5" />
              Custom
            </span>
          ) : (
            <span className="rounded-full border border-border/60 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Random
            </span>
          )}
          {domain.lastActive && (
            <span className="text-xs text-muted-foreground">
              Active {formatRelative(domain.lastActive)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6 sm:gap-8">
        <Metric label="Requests" value={formatNumber(domain.requests)} />
        <Metric label="Data" value={formatBytes(domain.bytes)} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="font-mono text-sm font-medium text-foreground">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function EmptyDomains() {
  return (
    <div className="mt-5 flex flex-col items-center gap-3 rounded-lg border border-dashed border-border/60 bg-white/[0.02] px-6 py-10 text-center">
      <div className="flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
        <Globe className="size-5" />
      </div>
      <p className="text-sm font-medium text-foreground">No tunnels yet</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        Authenticate the CLI with the token above, then run{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-foreground">
          goport http 3000
        </code>{" "}
        to open your first tunnel.
      </p>
    </div>
  );
}

/* ----------------------------- helpers ----------------------------- */

function maskToken(token: string): string {
  if (!token) return "";
  const prefix = token.slice(0, 6);
  return `${prefix}${"•".repeat(Math.max(token.length - 6, 8))}`;
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(Math.max(n, 0));
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diff = Date.now() - then;
  const sec = Math.round(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mon = Math.round(day / 30);
  if (mon < 12) return `${mon}mo ago`;
  return `${Math.round(mon / 12)}y ago`;
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy path
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
