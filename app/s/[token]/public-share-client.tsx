"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Download, File, FileArchive, FileImage, FileText, KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { GoPortLogo } from "@/components/goport-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CloudShare, getPublicShare, publicShareContentURL, unlockPublicShare } from "@/lib/api";

function bytes(value: number) {
	if (!value) return "0 B";
	const units = ["B", "KB", "MB", "GB", "TB"];
	const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), 4);
	return `${(value / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
}

function fileIcon(item: CloudShare) {
	if (item.mimeType.startsWith("image/")) return <FileImage className="size-7"/>;
	if (item.mimeType.includes("pdf") || item.mimeType.startsWith("text/")) return <FileText className="size-7"/>;
	if (item.mimeType.includes("zip")) return <FileArchive className="size-7"/>;
	return <File className="size-7"/>;
}

export function PublicShareClient({ token }: { token: string }) {
	const [item, setItem] = useState<CloudShare | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [password, setPassword] = useState("");
	const [unlocking, setUnlocking] = useState(false);
	const [unlocked, setUnlocked] = useState(false);

	useEffect(() => {
		void getPublicShare(token).then(setItem).catch((err) => setError(err instanceof Error ? err.message : "This sharing link is unavailable.")).finally(() => setLoading(false));
	}, [token]);

	const unlock = async (event: FormEvent) => {
		event.preventDefault(); setUnlocking(true); setError(null);
		try { await unlockPublicShare(token, password); setUnlocked(true); setPassword(""); }
		catch (err) { setError(err instanceof Error ? err.message : "Invalid password."); }
		finally { setUnlocking(false); }
	};

	if (loading) return <Shell><Loader2 className="size-8 animate-spin text-primary"/><p className="mt-4 text-sm text-muted-foreground">Opening secure share…</p></Shell>;
	if (error && !item) return <Shell><ShieldAlert className="size-10 text-destructive"/><h1 className="mt-5 text-2xl font-semibold">Link unavailable</h1><p className="mt-2 max-w-md text-sm text-muted-foreground">{error}</p></Shell>;
	if (!item) return null;

	const authorized = !item.passwordProtected || unlocked;
	return (
		<div className="min-h-screen bg-[#f2f7f6] px-4 py-6 text-foreground dark:bg-[#071012] sm:py-10">
			<div className="mx-auto max-w-5xl">
				<header className="flex items-center justify-between"><Link href="/"><GoPortLogo className="h-7 w-auto"/></Link><span className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">Secure file share</span></header>
				<main className="mt-8 overflow-hidden rounded-[1.75rem] border border-border/80 bg-background shadow-[0_30px_90px_-55px_rgba(7,61,47,.65)]">
					<section className="flex flex-col gap-5 border-b border-border/70 p-6 sm:flex-row sm:items-center sm:p-8">
						<div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">{fileIcon(item)}</div>
						<div className="min-w-0 flex-1"><h1 className="truncate text-2xl font-semibold tracking-[-.04em]">{item.filename}</h1><p className="mt-1 text-sm text-muted-foreground">{bytes(item.size)} · expires {new Date(item.expiresAt).toLocaleString()}</p></div>
						{authorized && <a href={publicShareContentURL(token, false, true)}><Button size="lg" className="w-full rounded-xl sm:w-auto"><Download/>Download</Button></a>}
					</section>
					{!authorized ? (
						<form onSubmit={unlock} className="mx-auto max-w-md px-6 py-16 text-center"><div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-secondary"><KeyRound className="size-5"/></div><h2 className="mt-5 text-xl font-semibold">Password required</h2><p className="mt-2 text-sm text-muted-foreground">Ask the sender for the password to preview or download this file.</p><Input type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-6" autoFocus/><Button className="mt-3 w-full" disabled={unlocking}>{unlocking ? <Loader2 className="animate-spin"/> : <KeyRound/>}Unlock file</Button>{error && <p className="mt-3 text-sm text-destructive">{error}</p>}</form>
					) : item.previewable ? <Preview item={item} token={token}/> : (
						<div className="px-6 py-20 text-center"><File className="mx-auto size-12 text-muted-foreground"/><h2 className="mt-4 font-semibold">Preview unavailable</h2><p className="mt-2 text-sm text-muted-foreground">This format is served as a download for your safety.</p></div>
					)}
				</main>
				<p className="mt-5 text-center text-xs text-muted-foreground">Uploaded to GoPort Cloud · files are removed when deleted or expired</p>
			</div>
		</div>
	);
}

function Preview({ item, token }: { item: CloudShare; token: string }) {
	const src = publicShareContentURL(token, true, false);
	if (item.mimeType.startsWith("image/")) return <div className="flex min-h-80 items-center justify-center bg-secondary/35 p-5"><img src={src} alt={item.filename} className="max-h-[70vh] max-w-full rounded-lg object-contain"/></div>;
	return <iframe src={src} title={`Preview of ${item.filename}`} className="h-[70vh] w-full border-0 bg-white"/>;
}

function Shell({ children }: { children: React.ReactNode }) {
	return <div className="flex min-h-screen flex-col items-center justify-center bg-[#f2f7f6] px-5 text-center dark:bg-[#071012]"><GoPortLogo className="mb-10 h-7 w-auto"/>{children}</div>;
}
