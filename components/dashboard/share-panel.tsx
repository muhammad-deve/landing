"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
	CalendarClock,
	Check,
	Copy,
	Ellipsis,
	ExternalLink,
	File,
	FileArchive,
	FileCode,
	FileImage,
	FileText,
	FileUp,
	KeyRound,
	Link2,
	Loader2,
	LockKeyhole,
	PanelsTopLeft,
	RotateCcw,
	ShieldOff,
	Trash2,
	UploadCloud,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { copyText } from "@/lib/clipboard";
import {
	CloudShare,
	deleteCloudShare,
	getCloudShares,
	restoreCloudShare,
	revokeCloudShare,
	ShareLimits,
	UnauthorizedError,
	UploadCancelledError,
	updateCloudShare,
	uploadCloudShare,
} from "@/lib/api";

const PANEL = "rounded-[1.4rem] border border-border/80 bg-white/90 dark:bg-card/72";

type LinkMode = "page" | "direct";
type Confirmation = { kind: "delete" | "revoke"; item: CloudShare };

function bytes(value: number) {
	if (!value) return "0 B";
	const units = ["B", "KB", "MB", "GB", "TB"];
	const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), 4);
	const amount = value / 1024 ** index;
	return `${amount.toFixed(index && amount < 100 && amount % 1 ? 1 : 0)} ${units[index]}`;
}

/** Value for a datetime-local input, in the browser's time zone. */
function localInputValue(value: Date) {
	const offset = value.getTimezoneOffset() * 60_000;
	return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}

function formatDate(value: string) {
	return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function errorMessage(err: unknown, fallback: string) {
	return err instanceof Error && err.message ? err.message : fallback;
}

function fallbackLimits(storageBytes: number, maxUploadBytes: number): ShareLimits {
	const plan = { storageBytes, maxUploadBytes, defaultRetentionHours: 168, maxRetentionHours: 720, maxDownloads: 0, directLinks: false };
	return { isPro: false, current: plan, free: plan, pro: { ...plan, directLinks: true } };
}

/** "1 hour", "3 days" */
function durationText(hours: number) {
	if (hours % 24 === 0) return hours === 24 ? "1 day" : `${hours / 24} days`;
	return hours === 1 ? "1 hour" : `${hours} hours`;
}

const EXPIRY_PRESETS = [1, 24, 72, 168, 336, 720];

function fileIcon(mimeType: string, className: string) {
	if (mimeType.startsWith("image/")) return <FileImage className={className} />;
	if (mimeType.startsWith("text/html")) return <FileCode className={className} />;
	if (mimeType.includes("pdf") || mimeType.startsWith("text/")) return <FileText className={className} />;
	if (mimeType.includes("zip")) return <FileArchive className={className} />;
	return <File className={className} />;
}

export function SharePanel({ authToken, onAuthError, onUpgrade }: { authToken: string; onAuthError: () => void; onUpgrade?: () => void }) {
	const [items, setItems] = useState<CloudShare[]>([]);
	const [usage, setUsage] = useState({ usedBytes: 0, quotaBytes: 0, remainingBytes: 0 });
	const [limits, setLimits] = useState<ShareLimits | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
	const [confirming, setConfirming] = useState(false);

	const load = useCallback(async () => {
		try {
			const data = await getCloudShares(authToken);
			setItems(data.items);
			setUsage(data.storage);
			setLimits(
				data.limits ?? fallbackLimits(data.storage.quotaBytes, data.maxUploadBytes),
			);
			setError(null);
		} catch (err) {
			if (err instanceof UnauthorizedError) {
				onAuthError();
				return;
			}
			setError(errorMessage(err, "Couldn't load shared files."));
		} finally {
			setLoading(false);
		}
	}, [authToken, onAuthError]);

	useEffect(() => {
		void load();
	}, [load]);

	useEffect(() => {
		if (!notice) return;
		const timer = window.setTimeout(() => setNotice(null), 4000);
		return () => window.clearTimeout(timer);
	}, [notice]);

	/** Runs a change, reloads the list, and reports the outcome. */
	const run = useCallback(
		async (action: () => Promise<unknown>, success: string) => {
			setError(null);
			try {
				await action();
				setNotice(success);
				await load();
				return true;
			} catch (err) {
				if (err instanceof UnauthorizedError) onAuthError();
				else setError(errorMessage(err, "That didn't work. Try again."));
				return false;
			}
		},
		[load, onAuthError],
	);

	const confirm = async () => {
		if (!confirmation) return;
		setConfirming(true);
		const { kind, item } = confirmation;
		const done =
			kind === "delete"
				? await run(() => deleteCloudShare(authToken, item.id), `${item.filename} was deleted.`)
				: await run(() => revokeCloudShare(authToken, item.id), "Link revoked. You can restore it at any time.");
		setConfirming(false);
		if (done) setConfirmation(null);
	};

	return (
		<div className="space-y-6">
			<section>
				<h2 className="text-2xl font-semibold tracking-[-0.04em]">Share files without friction.</h2>
				<p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
					Cloud files stay available until they expire or you revoke them. For files that must stay on your computer, run{" "}
					<code className="whitespace-nowrap rounded bg-secondary px-1.5 py-1 font-mono text-xs">goport share ./folder</code>.
				</p>
			</section>

			{error && (
				<div role="alert" className="flex items-start justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3 text-sm text-destructive">
					<span>{error}</span>
					<button type="button" aria-label="Dismiss" onClick={() => setError(null)} className="shrink-0 opacity-70 hover:opacity-100">
						<X className="size-4" />
					</button>
				</div>
			)}
			{notice && (
				<div role="status" className="flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/8 px-4 py-3 text-sm text-primary">
					<Check className="size-4 shrink-0" />
					{notice}
				</div>
			)}

			<section className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
				<UploadCard
					authToken={authToken}
					limits={limits}
					remainingBytes={usage.remainingBytes}
					onUploaded={async (item) => {
						setNotice(item.direct ? "Uploaded. The direct link is ready to copy." : "Uploaded. The share link is ready to copy.");
						await load();
					}}
					onError={(message) => setError(message)}
					onAuthError={onAuthError}
					onUpgrade={onUpgrade}
				/>
				<StorageCard usage={usage} limits={limits} onUpgrade={onUpgrade} />
			</section>

			<section className={`${PANEL} overflow-hidden`}>
				<div className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
					<h3 className="font-semibold">Uploaded files</h3>
					{items.length > 0 && <span className="text-xs text-muted-foreground">{items.length} {items.length === 1 ? "file" : "files"}</span>}
				</div>
				{loading ? (
					<div className="p-10 text-center">
						<Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
					</div>
				) : items.length ? (
					<div className="divide-y divide-border/70">
						{items.map((item) => (
							<ShareRow
								key={item.id}
								item={item}
								authToken={authToken}
								directAvailable={Boolean(limits?.current.directLinks)}
								maxRetentionHours={limits?.current.maxRetentionHours ?? 720}
								onRun={run}
								onConfirm={setConfirmation}
								onUpgrade={onUpgrade}
							/>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center px-5 py-12 text-center">
						<span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
							<UploadCloud className="size-5" />
						</span>
						<p className="mt-4 text-sm font-semibold">No cloud files yet</p>
						<p className="mt-1.5 max-w-sm text-xs leading-5 text-muted-foreground">Upload a file above and its link will appear here.</p>
					</div>
				)}
			</section>

			<AlertDialog open={confirmation !== null} onOpenChange={(open) => !open && !confirming && setConfirmation(null)}>
				<AlertDialogContent className="rounded-2xl sm:max-w-md">
					<AlertDialogHeader>
						<span className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive sm:mx-0">
							{confirmation?.kind === "delete" ? <Trash2 className="size-5" /> : <ShieldOff className="size-5" />}
						</span>
						<AlertDialogTitle className="mt-2">{confirmation?.kind === "delete" ? "Delete this file?" : "Revoke this link?"}</AlertDialogTitle>
						<AlertDialogDescription className="leading-6">
							{confirmation?.kind === "delete" ? (
								<>
									<span className="font-medium text-foreground [overflow-wrap:anywhere]">{confirmation.item.filename}</span>
									{" and its link will be removed for good. This can't be undone."}
								</>
							) : (
								<>
									Anyone who opens the link will see that it was revoked. The file stays in your storage, and you can restore the same link later.
								</>
							)}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={confirming}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={(event) => {
								event.preventDefault();
								void confirm();
							}}
							disabled={confirming}
							className="bg-destructive text-white hover:bg-destructive/90"
						>
							{confirming && <Loader2 className="size-4 animate-spin" />}
							{confirmation?.kind === "delete" ? "Delete file" : "Revoke link"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

function ProBadge() {
	return <span className="rounded-md bg-primary/12 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-primary">Pro</span>;
}

function LinkModeChoice({
	value,
	onChange,
	directAvailable,
	onUpgrade,
	name,
}: {
	value: LinkMode;
	onChange: (mode: LinkMode) => void;
	directAvailable: boolean;
	onUpgrade?: () => void;
	name: string;
}) {
	const options: { mode: LinkMode; icon: LucideIcon; title: string; text: string }[] = [
		{ mode: "page", icon: PanelsTopLeft, title: "Share page", text: "A GoPort page with a preview, an optional password and a download button." },
		{ mode: "direct", icon: Link2, title: "Direct file", text: "The link opens the file itself, like a certificate or a photo. No page around it." },
	];
	return (
		<div role="radiogroup" aria-label="How the link opens" className="grid gap-2.5 sm:grid-cols-2">
			{options.map(({ mode, icon: Icon, title, text }) => {
				const locked = mode === "direct" && !directAvailable;
				const selected = value === mode;
				return (
					<label
						key={mode}
						className={`relative flex cursor-pointer gap-3 rounded-xl border p-3.5 text-left transition ${
							selected ? "border-primary bg-primary/[0.07] ring-1 ring-primary/40" : "border-border bg-background/70 hover:border-primary/45"
						} ${locked ? "cursor-default opacity-80" : ""}`}
					>
						<input
							type="radio"
							name={name}
							value={mode}
							checked={selected}
							disabled={locked}
							onChange={() => onChange(mode)}
							className="sr-only"
						/>
						<span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
							<Icon className="size-4" />
						</span>
						<span className="min-w-0">
							<span className="flex items-center gap-2 text-sm font-semibold">
								{title}
								{mode === "direct" && <ProBadge />}
							</span>
							<span className="mt-1 block text-xs leading-5 text-muted-foreground">{text}</span>
							{locked && onUpgrade && (
								<button type="button" onClick={onUpgrade} className="mt-1.5 text-xs font-semibold text-primary hover:underline">
									Upgrade to use direct links
								</button>
							)}
						</span>
					</label>
				);
			})}
		</div>
	);
}

function UploadCard({
	authToken,
	limits,
	remainingBytes,
	onUploaded,
	onError,
	onAuthError,
	onUpgrade,
}: {
	authToken: string;
	limits: ShareLimits | null;
	remainingBytes: number;
	onUploaded: (item: CloudShare) => Promise<void>;
	onError: (message: string | null) => void;
	onAuthError: () => void;
	onUpgrade?: () => void;
}) {
	const [file, setFile] = useState<File | null>(null);
	const [mode, setMode] = useState<LinkMode>("page");
	const [password, setPassword] = useState("");
	const [expiryHours, setExpiryHours] = useState<number | null>(null);
	const [progress, setProgress] = useState<number | null>(null);
	const [dragging, setDragging] = useState(false);
	const [problem, setProblem] = useState<string | null>(null);
	const input = useRef<HTMLInputElement>(null);
	const abort = useRef<AbortController | null>(null);
	const maxUpload = limits?.current.maxUploadBytes ?? 0;
	const directAvailable = Boolean(limits?.current.directLinks);
	const maxRetention = limits?.current.maxRetentionHours ?? 168;
	const presets = EXPIRY_PRESETS.filter((hours) => hours <= maxRetention);
	if (!presets.includes(maxRetention)) presets.push(maxRetention);
	const defaultHours = Math.min(limits?.current.defaultRetentionHours ?? 24, maxRetention);
	const hours = expiryHours !== null && expiryHours <= maxRetention ? expiryHours : defaultHours;

	const reset = () => {
		setFile(null);
		setPassword("");
		setProgress(null);
		setProblem(null);
		if (input.current) input.current.value = "";
	};

	const choose = (selected: File | null) => {
		if (!selected) return;
		onError(null);
		setFile(selected);
		if (maxUpload && selected.size > maxUpload) {
			const proLimit = limits && !limits.isPro && selected.size <= limits.pro.maxUploadBytes ? ` Pro allows files up to ${bytes(limits.pro.maxUploadBytes)}.` : "";
			setProblem(`This file is ${bytes(selected.size)}. Your plan allows files up to ${bytes(maxUpload)}.${proLimit}`);
		} else if (limits && selected.size > remainingBytes) {
			setProblem(`This file is ${bytes(selected.size)}, but only ${bytes(remainingBytes)} of storage is left. Delete a file${limits.isPro ? "" : " or upgrade to Pro"} to make room.`);
		} else if (selected.size === 0) {
			setProblem("This file is empty.");
		} else {
			setProblem(null);
		}
	};

	const upload = async () => {
		if (!file || problem) return;
		const controller = new AbortController();
		abort.current = controller;
		setProgress(0);
		onError(null);
		try {
			const item = await uploadCloudShare(authToken, file, {
				expiresAt: new Date(Date.now() + hours * 3_600_000).toISOString(),
				password: mode === "direct" ? "" : password,
				direct: mode === "direct",
				onProgress: setProgress,
				signal: controller.signal,
			});
			reset();
			await onUploaded(item);
		} catch (err) {
			setProgress(null);
			if (err instanceof UploadCancelledError) return;
			if (err instanceof UnauthorizedError) {
				onAuthError();
				return;
			}
			onError(errorMessage(err, "Upload failed."));
		} finally {
			abort.current = null;
		}
	};

	const uploading = progress !== null;
	const passwordTooShort = mode === "page" && password.length > 0 && password.length < 8;

	return (
		<div className={`${PANEL} flex flex-col p-4 sm:p-5`}>
			{!file ? (
				<div
					onDragOver={(event) => {
						event.preventDefault();
						setDragging(true);
					}}
					onDragLeave={() => setDragging(false)}
					onDrop={(event) => {
						event.preventDefault();
						setDragging(false);
						choose(event.dataTransfer.files[0] ?? null);
					}}
					onClick={() => input.current?.click()}
					role="button"
					tabIndex={0}
					onKeyDown={(event) => {
						if (event.key === "Enter" || event.key === " ") {
							event.preventDefault();
							input.current?.click();
						}
					}}
					className={`flex min-h-52 flex-1 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
						dragging ? "border-primary bg-primary/8" : "border-border hover:border-primary/55 hover:bg-secondary/35"
					}`}
				>
					<span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
						<UploadCloud className="size-6" />
					</span>
					<h3 className="mt-4 font-semibold">Drop a file here</h3>
					<p className="mt-1 text-sm text-muted-foreground">or click to browse · up to {maxUpload ? bytes(maxUpload) : "your plan limit"}</p>
				</div>
			) : (
				<div className="space-y-4">
					<div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3">
						<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary">
							{fileIcon(file.type, "size-5")}
						</span>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium">{file.name}</p>
							<p className="text-xs text-muted-foreground">{bytes(file.size)}</p>
						</div>
						{!uploading && (
							<Button type="button" variant="ghost" size="icon" aria-label="Choose a different file" onClick={reset} className="shrink-0 rounded-lg">
								<X className="size-4" />
							</Button>
						)}
					</div>

					{problem ? (
						<div className="rounded-xl border border-destructive/30 bg-destructive/8 px-3.5 py-3 text-sm text-destructive">
							{problem}
							{limits && !limits.isPro && onUpgrade && (
								<button type="button" onClick={onUpgrade} className="ml-1 font-semibold underline-offset-2 hover:underline">
									See Pro
								</button>
							)}
						</div>
					) : (
						<>
							<div>
								<p className="mb-2 text-xs font-medium text-muted-foreground">How should the link open?</p>
								<LinkModeChoice name="upload-link-mode" value={mode} onChange={setMode} directAvailable={directAvailable} onUpgrade={onUpgrade} />
							</div>
							<div className={`grid gap-3 ${mode === "page" ? "sm:grid-cols-2" : ""}`}>
								<label className="text-xs font-medium text-muted-foreground">
									Link works for
									<select
										value={hours}
										onChange={(event) => setExpiryHours(Number(event.target.value))}
										disabled={uploading}
										className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
									>
										{presets.map((option) => (
											<option key={option} value={option}>
												{durationText(option)}
											</option>
										))}
									</select>
									{limits && !limits.isPro && <span className="mt-1.5 block font-normal">Free files are kept up to {durationText(maxRetention)}. Pro keeps them up to {durationText(limits.pro.maxRetentionHours)}.</span>}
								</label>
								{mode === "page" && (
									<label className="text-xs font-medium text-muted-foreground">
										Password (optional)
										<Input
											type="password"
											autoComplete="new-password"
											value={password}
											onChange={(event) => setPassword(event.target.value)}
											placeholder="At least 8 characters"
											className="mt-1.5"
											disabled={uploading}
											aria-invalid={passwordTooShort}
										/>
									</label>
								)}
							</div>
							{mode === "direct" && <p className="text-xs leading-5 text-muted-foreground">Direct links can&apos;t ask for a password, so share them only with people who should see the file.</p>}
						</>
					)}

					{uploading && (
						<div>
							<div className="h-2 overflow-hidden rounded-full bg-secondary">
								<div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
							</div>
							<p className="mt-1.5 flex justify-between text-xs text-muted-foreground">
								<span>{progress === 100 ? "Finishing…" : "Uploading…"}</span>
								<span className="font-mono">{progress}%</span>
							</p>
						</div>
					)}

					<div className="flex flex-col-reverse gap-2 sm:flex-row">
						{uploading ? (
							<Button type="button" variant="outline" onClick={() => abort.current?.abort()} className="rounded-xl sm:w-auto">
								Cancel upload
							</Button>
						) : (
							<Button type="button" variant="outline" onClick={reset} className="rounded-xl sm:w-auto">
								Cancel
							</Button>
						)}
						<Button type="button" onClick={() => void upload()} disabled={uploading || Boolean(problem) || passwordTooShort} className="flex-1 rounded-xl">
							{uploading ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
							Upload file
						</Button>
					</div>
				</div>
			)}
			<input ref={input} type="file" className="hidden" onChange={(event) => choose(event.target.files?.[0] ?? null)} />
		</div>
	);
}

function StorageCard({ usage, limits, onUpgrade }: { usage: { usedBytes: number; quotaBytes: number; remainingBytes: number }; limits: ShareLimits | null; onUpgrade?: () => void }) {
	const percent = usage.quotaBytes ? Math.min(100, (usage.usedBytes / usage.quotaBytes) * 100) : 0;
	const rows = limits
		? [
				{ label: "Storage", value: bytes(limits.current.storageBytes) },
				{ label: "Largest file", value: bytes(limits.current.maxUploadBytes) },
				{ label: "Files kept up to", value: durationText(limits.current.maxRetentionHours) },
				{ label: "Downloads per file", value: limits.current.maxDownloads ? String(limits.current.maxDownloads) : "Unlimited" },
				{ label: "Direct file links", value: limits.current.directLinks ? "Included" : "Pro" },
			]
		: [];
	return (
		<div className="flex flex-col rounded-[1.4rem] border border-border/80 bg-[#102124] p-5 text-white">
			<div className="flex items-center justify-between gap-3">
				<p className="text-xs text-white/55">Storage usage</p>
				{limits && <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/80">{limits.isPro ? "Pro" : "Free"}</span>}
			</div>
			<p className="mt-2 font-mono text-2xl font-semibold">
				{bytes(usage.usedBytes)} <span className="text-sm text-white/45">/ {bytes(usage.quotaBytes)}</span>
			</p>
			<div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
				<div className={`h-full rounded-full ${percent > 90 ? "bg-[#f87171]" : "bg-[#38d996]"}`} style={{ width: `${Math.max(percent, usage.usedBytes ? 1 : 0)}%` }} />
			</div>
			<p className="mt-2 text-xs text-white/55">{bytes(usage.remainingBytes)} remaining</p>
			{rows.length > 0 && (
				<dl className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
					{rows.map((row) => (
						<div key={row.label} className="flex items-center justify-between gap-3">
							<dt className="text-white/55">{row.label}</dt>
							<dd className="font-medium text-white/90">{row.value}</dd>
						</div>
					))}
				</dl>
			)}
			{limits && !limits.isPro && (
				<div className="mt-5 rounded-xl border border-[#38d996]/25 bg-[#38d996]/[0.08] p-3.5">
					<p className="text-sm font-semibold text-white">Need more room?</p>
					<p className="mt-1 text-xs leading-5 text-white/60">
						Pro gives you {bytes(limits.pro.storageBytes)} of storage, files up to {bytes(limits.pro.maxUploadBytes)} kept for up to {durationText(limits.pro.maxRetentionHours)}, unlimited downloads and direct file links.
					</p>
					{onUpgrade && (
						<button type="button" onClick={onUpgrade} className="mt-2.5 text-xs font-semibold text-[#38d996] hover:underline">
							See Pro plans
						</button>
					)}
				</div>
			)}
		</div>
	);
}

function ShareRow({
	item,
	authToken,
	directAvailable,
	maxRetentionHours,
	onRun,
	onConfirm,
	onUpgrade,
}: {
	item: CloudShare;
	authToken: string;
	directAvailable: boolean;
	maxRetentionHours: number;
	onRun: (action: () => Promise<unknown>, success: string) => Promise<boolean>;
	onConfirm: (confirmation: Confirmation) => void;
	onUpgrade?: () => void;
}) {
	const [open, setOpen] = useState(false);
	const [busy, setBusy] = useState(false);
	const [copied, setCopied] = useState(false);
	const [expires, setExpires] = useState(() => localInputValue(new Date(item.expiresAt)));
	const [mode, setMode] = useState<LinkMode>(item.direct ? "direct" : "page");
	const [password, setPassword] = useState("");
	const [removePassword, setRemovePassword] = useState(false);

	const resetForm = () => {
		setExpires(localInputValue(new Date(item.expiresAt)));
		setMode(item.direct ? "direct" : "page");
		setPassword("");
		setRemovePassword(false);
	};

	const act = async (action: () => Promise<unknown>, success: string) => {
		setBusy(true);
		const done = await onRun(action, success);
		setBusy(false);
		return done;
	};

	const save = async () => {
		const changes: { expiresAt: string; password?: string; direct?: boolean } = { expiresAt: new Date(expires).toISOString() };
		if (mode !== (item.direct ? "direct" : "page")) changes.direct = mode === "direct";
		if (mode === "direct") {
			if (item.passwordProtected) changes.password = "";
		} else if (password) {
			changes.password = password;
		} else if (removePassword) {
			changes.password = "";
		}
		if (await act(() => updateCloudShare(authToken, item.id, changes), "Changes saved.")) setOpen(false);
	};

	const passwordTooShort = mode === "page" && password.length > 0 && password.length < 8;
	// Retention counts from the upload; the current expiry can always be kept.
	const latestExpiry = new Date(Math.max(new Date(item.created).getTime() + maxRetentionHours * 3_600_000, new Date(item.expiresAt).getTime()));
	const limitReached = Boolean(item.downloadLimit && item.downloads >= item.downloadLimit);
	const status = item.revoked
		? { label: "Revoked", className: "bg-destructive/10 text-destructive" }
		: limitReached
			? { label: "Download limit reached", className: "bg-destructive/10 text-destructive" }
			: item.direct
			? { label: "Direct link", className: "bg-primary/12 text-primary" }
			: { label: "Share page", className: "bg-secondary text-muted-foreground" };

	return (
		<div className="p-4 sm:p-5">
			<div className="flex flex-col gap-3 lg:flex-row lg:items-center">
				<div className="flex min-w-0 flex-1 items-start gap-3">
					<span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${item.revoked ? "bg-secondary text-muted-foreground" : "bg-primary/10 text-primary"}`}>
						{fileIcon(item.mimeType, "size-5")}
					</span>
					<div className="min-w-0 flex-1">
						<p className={`truncate font-medium ${item.revoked ? "text-muted-foreground" : ""}`} title={item.filename}>
							{item.filename}
						</p>
						<div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
							<span className={`rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${status.className}`}>{status.label}</span>
							{item.passwordProtected && (
								<span className="inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-semibold">
									<LockKeyhole className="size-3" />
									Password
								</span>
							)}
							<span>{bytes(item.size)}</span>
							<span aria-hidden>·</span>
							<span>
								{item.downloadLimit ? `${item.downloads} of ${item.downloadLimit} downloads` : `${item.downloads} ${item.downloads === 1 ? "download" : "downloads"}`}
							</span>
							<span aria-hidden>·</span>
							<span>expires {formatDate(item.expiresAt)}</span>
						</div>
					</div>
				</div>
				<div className="flex flex-wrap gap-2 sm:pl-[52px] lg:pl-0">
					{item.revoked ? (
						<Button variant="outline" size="sm" disabled={busy} onClick={() => void act(() => restoreCloudShare(authToken, item.id), "Link restored. It works again with the same URL.")} className="rounded-lg">
							{busy ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
							Restore link
						</Button>
					) : (
						<>
							<Button
								variant="outline"
								size="sm"
								disabled={!item.url}
								className="rounded-lg"
								onClick={async () => {
									if (item.url && (await copyText(item.url))) {
										setCopied(true);
										window.setTimeout(() => setCopied(false), 1600);
									}
								}}
							>
								{copied ? <Check className="size-4" /> : <Copy className="size-4" />}
								{copied ? "Copied" : "Copy link"}
							</Button>
							<Button variant="outline" size="sm" disabled={busy} className="rounded-lg" onClick={() => onConfirm({ kind: "revoke", item })}>
								<ShieldOff className="size-4" />
								Revoke
							</Button>
						</>
					)}
					<Button variant="outline" size="sm" disabled={busy} className="rounded-lg text-destructive hover:bg-destructive/8 hover:text-destructive" onClick={() => onConfirm({ kind: "delete", item })}>
						<Trash2 className="size-4" />
						Delete
					</Button>
					{!item.revoked && (
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="icon-sm" className="rounded-lg" aria-label={`More actions for ${item.filename}`}>
									<Ellipsis className="size-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="min-w-40 rounded-lg">
								{item.url && (
									<DropdownMenuItem asChild>
										<a href={item.url} target="_blank" rel="noopener noreferrer">
											<ExternalLink />
											Open
										</a>
									</DropdownMenuItem>
								)}
								<DropdownMenuItem
									onSelect={() => {
										if (!open) resetForm();
										setOpen(!open);
									}}
								>
									<CalendarClock />
									{open ? "Close settings" : "Manage"}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</div>

			{open && !item.revoked && (
				<div className="mt-4 space-y-4 rounded-xl bg-secondary/55 p-4 lg:ml-[52px]">
					<div>
						<p className="mb-2 text-xs font-medium text-muted-foreground">How the link opens</p>
						<LinkModeChoice name={`link-mode-${item.id}`} value={mode} onChange={setMode} directAvailable={directAvailable || item.direct} onUpgrade={onUpgrade} />
						{mode !== (item.direct ? "direct" : "page") && <p className="mt-2 text-xs leading-5 text-muted-foreground">The link changes format, so send people the new link after saving.</p>}
					</div>
					<div className={`grid gap-3 ${mode === "page" ? "sm:grid-cols-2" : ""}`}>
						<label className="text-xs font-medium text-muted-foreground">
							Expires
							<Input
								type="datetime-local"
								value={expires}
								min={localInputValue(new Date())}
								max={localInputValue(latestExpiry)}
								onChange={(event) => setExpires(event.target.value)}
								className="mt-1.5 bg-background"
							/>
							<span className="mt-1.5 block font-normal">Up to {durationText(maxRetentionHours)} after upload.</span>
						</label>
						{mode === "page" && (
							<div className="text-xs font-medium text-muted-foreground">
								<label htmlFor={`password-${item.id}`}>{item.passwordProtected ? "New password" : "Password (optional)"}</label>
								<Input
									id={`password-${item.id}`}
									type="password"
									autoComplete="new-password"
									value={password}
									disabled={removePassword}
									onChange={(event) => setPassword(event.target.value)}
									placeholder={item.passwordProtected ? "Leave blank to keep the current one" : "At least 8 characters"}
									className="mt-1.5 bg-background"
									aria-invalid={passwordTooShort}
								/>
								{item.passwordProtected && (
									<label className="mt-2 flex items-center gap-2 font-normal">
										<input
											type="checkbox"
											checked={removePassword}
											onChange={(event) => {
												setRemovePassword(event.target.checked);
												if (event.target.checked) setPassword("");
											}}
											className="size-3.5 accent-[var(--primary)]"
										/>
										Remove the password
									</label>
								)}
							</div>
						)}
					</div>
					{mode === "direct" && item.passwordProtected && <p className="text-xs leading-5 text-muted-foreground">Direct links can&apos;t ask for a password, so saving removes it.</p>}
					<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
						<Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)} className="rounded-lg">
							Cancel
						</Button>
						<Button type="button" size="sm" disabled={busy || passwordTooShort || !expires} onClick={() => void save()} className="rounded-lg">
							{busy ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
							Save changes
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}
