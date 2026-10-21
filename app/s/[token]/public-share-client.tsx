"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
	Clock3,
	Download,
	Eye,
	EyeOff,
	File,
	FileArchive,
	FileCode,
	FileImage,
	FileQuestion,
	FileText,
	KeyRound,
	Loader2,
	RotateCw,
	ShieldCheck,
	ShieldOff,
	WifiOff,
} from "lucide-react";
import { GoPortLogo } from "@/components/goport-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CloudShare, getPublicShare, publicShareContentURL, PublicShareError, PublicShareState, unlockPublicShare } from "@/lib/api";
import { PdfPages } from "./pdf-pages";

function bytes(value: number) {
	if (!value) return "0 B";
	const units = ["B", "KB", "MB", "GB", "TB"];
	const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), 4);
	const amount = value / 1024 ** index;
	return `${amount.toFixed(index && amount < 100 && amount % 1 ? 1 : 0)} ${units[index]}`;
}

function formatDate(value: string) {
	return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

/** "0:59", "29:41", "23 h 59 min" */
function countdown(seconds: number) {
	if (seconds >= 3600) {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.ceil((seconds % 3600) / 60);
		return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
	}
	return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function fileIcon(item: CloudShare, className: string) {
	if (item.mimeType.startsWith("image/")) return <FileImage className={className} />;
	if (item.mimeType.startsWith("text/html")) return <FileCode className={className} />;
	if (item.mimeType.includes("pdf") || item.mimeType.startsWith("text/")) return <FileText className={className} />;
	if (item.mimeType.includes("zip")) return <FileArchive className={className} />;
	return <File className={className} />;
}

const UNAVAILABLE: Record<string, { icon: LucideIcon; title: string; text: string }> = {
	revoked: { icon: ShieldOff, title: "This link was turned off", text: "The sender revoked it. Ask them for a new link if you still need the file." },
	expired: { icon: Clock3, title: "This link has expired", text: "Shared files are removed when their link expires. Ask the sender to share it again." },
	limit: { icon: Download, title: "Download limit reached", text: "This file was downloaded as many times as the sender's plan allows. Ask them to share it again." },
	invalid: { icon: FileQuestion, title: "Link not found", text: "Check that you copied the whole link, or ask the sender for a new one." },
	offline: { icon: WifiOff, title: "Couldn't reach GoPort", text: "Check your connection and try again." },
};

/** Phones and tablets can't show PDFs inside a frame, so they get rendered pages. */
function useTouchLayout() {
	const [touch, setTouch] = useState<boolean | null>(null);
	useEffect(() => {
		const query = window.matchMedia("(pointer: coarse), (max-width: 767px)");
		const update = () => setTouch(query.matches);
		update();
		query.addEventListener("change", update);
		return () => query.removeEventListener("change", update);
	}, []);
	return touch;
}

export function PublicShareClient({ token }: { token: string }) {
	const [item, setItem] = useState<CloudShare | null>(null);
	const [loading, setLoading] = useState(true);
	const [problem, setProblem] = useState<{ state: PublicShareState; message: string } | null>(null);
	const [unlocked, setUnlocked] = useState(false);

	const load = useCallback(async () => {
		setLoading(true);
		setProblem(null);
		try {
			setItem(await getPublicShare(token));
		} catch (err) {
			const state = err instanceof PublicShareError ? err.state : "unknown";
			setProblem({ state, message: err instanceof Error ? err.message : "This sharing link is unavailable." });
		} finally {
			setLoading(false);
		}
	}, [token]);

	useEffect(() => {
		void load();
	}, [load]);

	if (loading) {
		return (
			<Shell>
				<Loader2 className="size-8 animate-spin text-primary" />
				<p className="mt-4 text-sm text-muted-foreground">Opening shared file…</p>
			</Shell>
		);
	}

	if (problem || !item) {
		const copy = UNAVAILABLE[problem?.state ?? "invalid"] ?? { icon: FileQuestion, title: "Link unavailable", text: problem?.message ?? "" };
		return (
			<Shell>
				<span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
					<copy.icon className="size-6" />
				</span>
				<h1 className="mt-5 text-xl font-semibold tracking-[-.02em] sm:text-2xl">{copy.title}</h1>
				<p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{copy.text}</p>
				{(problem?.state === "offline" || problem?.state === "unknown") && (
					<Button variant="outline" onClick={() => void load()} className="mt-6 rounded-xl">
						<RotateCw className="size-4" />
						Try again
					</Button>
				)}
			</Shell>
		);
	}

	const authorized = !item.passwordProtected || unlocked;
	return (
		<div className="min-h-screen bg-[#f2f7f6] px-3 py-4 text-foreground dark:bg-[#071012] sm:px-6 sm:py-10">
			<div className="mx-auto max-w-5xl">
				<header className="flex items-center justify-between gap-3 px-1">
					<Link href="/" aria-label="GoPort home">
						<GoPortLogo className="h-6 w-auto sm:h-7" />
					</Link>
					<span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground sm:px-3 sm:py-1.5 sm:text-xs">
						<ShieldCheck className="size-3.5 text-primary" />
						Secure file share
					</span>
				</header>
				<main className="mt-4 overflow-hidden rounded-2xl border border-border/80 bg-background shadow-[0_30px_90px_-55px_rgba(7,61,47,.65)] sm:mt-8 sm:rounded-[1.75rem]">
					<section className="flex flex-col gap-4 border-b border-border/70 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-8">
						<div className="flex min-w-0 flex-1 items-start gap-3.5 sm:items-center sm:gap-5">
							<span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:size-14 sm:rounded-2xl">
								{fileIcon(item, "size-5 sm:size-7")}
							</span>
							<div className="min-w-0">
								<h1 className="line-clamp-3 text-lg font-semibold leading-snug tracking-[-.03em] [overflow-wrap:anywhere] sm:text-2xl" title={item.filename}>
									{item.filename}
								</h1>
								<p className="mt-1 text-xs text-muted-foreground sm:text-sm">
									{bytes(item.size)} · expires {formatDate(item.expiresAt)}
								</p>
							</div>
						</div>
						{authorized && (
							<Button asChild size="lg" className="h-11 w-full rounded-xl sm:w-auto">
								<a href={publicShareContentURL(token, false, true)}>
									<Download className="size-4" />
									Download
								</a>
							</Button>
						)}
					</section>
					{!authorized ? (
						<PasswordForm token={token} initialWait={item.retryAfter ?? 0} onUnlocked={() => setUnlocked(true)} />
					) : item.previewable ? (
						<Preview item={item} token={token} />
					) : (
						<div className="px-6 py-14 text-center sm:py-20">
							<File className="mx-auto size-10 text-muted-foreground sm:size-12" />
							<h2 className="mt-4 font-semibold">No preview for this file type</h2>
							<p className="mt-2 text-sm text-muted-foreground">Download it to open it on your device.</p>
						</div>
					)}
				</main>
				<p className="mt-5 px-2 text-center text-xs leading-5 text-muted-foreground">
					Shared with{" "}
					<Link href="/" className="font-medium text-foreground/80 hover:underline">
						GoPort
					</Link>{" "}
					· files are removed when they expire or are deleted
				</p>
			</div>
		</div>
	);
}

function PasswordForm({ token, initialWait, onUnlocked }: { token: string; initialWait: number; onUnlocked: () => void }) {
	const [password, setPassword] = useState("");
	const [visible, setVisible] = useState(false);
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [lockedUntil, setLockedUntil] = useState(() => (initialWait > 0 ? Date.now() + initialWait * 1000 : 0));
	const [now, setNow] = useState(() => Date.now());

	useEffect(() => {
		if (lockedUntil <= Date.now()) return;
		const timer = window.setInterval(() => {
			setNow(Date.now());
			if (Date.now() >= lockedUntil) window.clearInterval(timer);
		}, 1000);
		return () => window.clearInterval(timer);
	}, [lockedUntil]);

	const remaining = Math.max(0, Math.ceil((lockedUntil - now) / 1000));
	const locked = remaining > 0;

	const submit = async (event: FormEvent) => {
		event.preventDefault();
		if (locked || !password) return;
		setBusy(true);
		setMessage(null);
		try {
			await unlockPublicShare(token, password);
			setPassword("");
			onUnlocked();
		} catch (err) {
			if (err instanceof PublicShareError && err.state === "locked") {
				setNow(Date.now());
				setLockedUntil(Date.now() + Math.max(err.retryAfter, 1) * 1000);
				setPassword("");
			} else if (err instanceof PublicShareError && err.state === "password") {
				const left = err.attemptsLeft;
				setMessage(left > 0 ? `Wrong password. ${left} ${left === 1 ? "attempt" : "attempts"} left before a pause.` : "Wrong password.");
			} else {
				setMessage(err instanceof Error ? err.message : "Couldn't check the password. Try again.");
			}
		} finally {
			setBusy(false);
		}
	};

	return (
		<form onSubmit={submit} className="mx-auto max-w-md px-5 py-12 text-center sm:py-16">
			<span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary">
				<KeyRound className="size-5" />
			</span>
			<h2 className="mt-5 text-xl font-semibold">Password required</h2>
			<p className="mt-2 text-sm leading-6 text-muted-foreground">Ask the sender for the password to preview or download this file.</p>
			<div className="relative mt-6">
				<Input
					type={visible ? "text" : "password"}
					autoComplete="off"
					aria-label="Password"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					disabled={locked || busy}
					className="h-11 pr-11 text-base sm:text-sm"
					autoFocus
				/>
				<button
					type="button"
					onClick={() => setVisible(!visible)}
					aria-label={visible ? "Hide password" : "Show password"}
					className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
				>
					{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
				</button>
			</div>
			<Button className="mt-3 h-11 w-full rounded-xl" disabled={busy || locked || !password}>
				{busy ? <Loader2 className="size-4 animate-spin" /> : locked ? <Clock3 className="size-4" /> : <KeyRound className="size-4" />}
				{locked ? `Try again in ${countdown(remaining)}` : "Unlock file"}
			</Button>
			<div aria-live="polite" className="min-h-6">
				{locked ? (
					<p className="mt-3 text-sm leading-6 text-destructive">Too many wrong passwords. The form unlocks when the timer ends.</p>
				) : (
					message && <p className="mt-3 text-sm leading-6 text-destructive">{message}</p>
				)}
			</div>
		</form>
	);
}

function Preview({ item, token }: { item: CloudShare; token: string }) {
	const touch = useTouchLayout();
	const src = publicShareContentURL(token, true, false);
	if (item.mimeType.startsWith("image/")) {
		return (
			<div className="flex min-h-64 items-center justify-center bg-secondary/35 p-3 sm:min-h-80 sm:p-6">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={src} alt={item.filename} className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain" />
			</div>
		);
	}
	if (item.mimeType.startsWith("text/html")) return <HtmlPreview src={src} title={item.filename} />;
	if (item.mimeType.startsWith("text/")) return <TextPreview src={src} />;
	if (touch === null) return <div className="min-h-72 bg-secondary/35" />;
	if (touch) return <PdfPages src={src} title={item.filename} openURL={src} />;
	return <iframe src={src} title={`Preview of ${item.filename}`} className="h-[78vh] w-full border-0 bg-white" />;
}

/**
 * Shows a shared web page in a sandbox. The server sends the same sandbox as a
 * header; the attribute here is a second lock. The page gets an opaque origin,
 * so it can't read goport.uz storage or cookies, and it can't submit forms.
 */
function HtmlPreview({ src, title }: { src: string; title: string }) {
	return (
		<div>
			<p className="flex items-start gap-2 border-b border-border/70 bg-secondary/40 px-4 py-2.5 text-xs leading-5 text-muted-foreground sm:px-6">
				<ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
				Web page shared by a GoPort user, shown in a sandbox. It can&apos;t see your accounts or send forms. Never type passwords or card details into it.
			</p>
			<iframe
				src={src}
				title={`Preview of ${title}`}
				sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
				referrerPolicy="no-referrer"
				className="h-[75vh] w-full border-0 bg-white"
			/>
		</div>
	);
}

const TEXT_PREVIEW_BYTES = 256 * 1024;

/** Shows plain text with wrapped lines, so long lines never run off a phone screen. */
function TextPreview({ src }: { src: string }) {
	const [text, setText] = useState<string | null>(null);
	const [truncated, setTruncated] = useState(false);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let cancelled = false;
		fetch(src, { credentials: "include", headers: { Range: `bytes=0-${TEXT_PREVIEW_BYTES - 1}` } })
			.then(async (response) => {
				if (!response.ok) throw new Error(String(response.status));
				const body = await response.text();
				const total = Number(response.headers.get("Content-Range")?.split("/")[1] ?? body.length);
				if (cancelled) return;
				setTruncated(response.status === 206 && total > TEXT_PREVIEW_BYTES);
				setText(body);
			})
			.catch(() => {
				if (!cancelled) setFailed(true);
			});
		return () => {
			cancelled = true;
		};
	}, [src]);

	if (failed) return <p className="px-6 py-16 text-center text-sm text-muted-foreground">The preview couldn&apos;t load. Download the file to read it.</p>;
	if (text === null) {
		return (
			<div className="flex min-h-56 items-center justify-center bg-secondary/35">
				<Loader2 className="size-6 animate-spin text-primary" />
			</div>
		);
	}
	return (
		<div className="bg-secondary/35 p-3 sm:p-5">
			<pre className="max-h-[75vh] overflow-auto whitespace-pre-wrap rounded-lg bg-background p-4 font-mono text-[13px] leading-6 [overflow-wrap:anywhere] ring-1 ring-border">{text}</pre>
			{truncated && <p className="mt-3 text-center text-xs text-muted-foreground">The preview shows the first 256 KB. Download the file to read all of it.</p>}
		</div>
	);
}

function Shell({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-[#f2f7f6] px-5 text-center dark:bg-[#071012]">
			<Link href="/" aria-label="GoPort home" className="mb-10">
				<GoPortLogo className="h-7 w-auto" />
			</Link>
			{children}
		</div>
	);
}
