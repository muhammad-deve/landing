"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist/legacy/build/pdf.mjs";
import { Button } from "@/components/ui/button";

/** Pages after this are left to the download, to keep phones responsive. */
const MAX_PAGES = 150;

type PageSize = { width: number; height: number };

/**
 * Renders a PDF as a column of page images that fit the screen width.
 *
 * Phone browsers can't show a PDF inside a frame: iOS draws the first page at
 * full size and lets it run off the screen. Rendering with pdf.js gives every
 * page at the right width, and the page itself scrolls and pinch-zooms
 * normally.
 */
export function PdfPages({ src, title, openURL }: { src: string; title: string; openURL: string }) {
	const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);
	const [sizes, setSizes] = useState<PageSize[]>([]);
	const [total, setTotal] = useState(0);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		let cancelled = false;
		let loaded: PDFDocumentProxy | null = null;
		void (async () => {
			const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
			pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
			const response = await fetch(src, { credentials: "include" });
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			const data = new Uint8Array(await response.arrayBuffer());
			loaded = await pdfjs.getDocument({ data, isEvalSupported: false }).promise;
			const count = Math.min(loaded.numPages, MAX_PAGES);
			const pageSizes: PageSize[] = [];
			for (let number = 1; number <= count; number++) {
				const viewport = (await loaded.getPage(number)).getViewport({ scale: 1 });
				pageSizes.push({ width: viewport.width, height: viewport.height });
			}
			if (cancelled) return;
			setTotal(loaded.numPages);
			setSizes(pageSizes);
			setDoc(loaded);
		})().catch(() => {
			if (!cancelled) setFailed(true);
		});
		return () => {
			cancelled = true;
			void loaded?.destroy();
		};
	}, [src]);

	if (failed) {
		return (
			<div className="px-6 py-16 text-center">
				<p className="font-semibold">This PDF can&apos;t be previewed here</p>
				<p className="mt-2 text-sm text-muted-foreground">Open it in your browser&apos;s PDF viewer or download it instead.</p>
				<Button asChild variant="outline" className="mt-5 rounded-xl">
					<a href={openURL} target="_blank" rel="noopener noreferrer">
						<ExternalLink className="size-4" />
						Open PDF
					</a>
				</Button>
			</div>
		);
	}

	if (!doc) {
		return (
			<div className="flex min-h-72 flex-col items-center justify-center gap-3 bg-secondary/35 text-sm text-muted-foreground">
				<Loader2 className="size-6 animate-spin text-primary" />
				Loading preview…
			</div>
		);
	}

	return (
		<div className="space-y-3 bg-secondary/35 p-3 sm:p-5" aria-label={`Preview of ${title}`}>
			{sizes.map((size, index) => (
				<PdfPage key={index} doc={doc} number={index + 1} size={size} />
			))}
			{total > sizes.length && (
				<p className="py-4 text-center text-sm text-muted-foreground">
					The preview shows the first {sizes.length} of {total} pages. Download the file to see the rest.
				</p>
			)}
		</div>
	);
}

function PdfPage({ doc, number, size }: { doc: PDFDocumentProxy; number: number; size: PageSize }) {
	const holder = useRef<HTMLDivElement>(null);
	const [image, setImage] = useState<string | null>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		const element = holder.current;
		if (!element) return;
		let cancelled = false;
		let objectURL: string | null = null;
		let task: RenderTask | null = null;

		const render = async () => {
			const page = await doc.getPage(number);
			// Twice the CSS width at most: sharper text on retina screens without
			// running into the canvas memory limit on iPhones.
			const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
			const viewport = page.getViewport({ scale: (element.clientWidth * pixelRatio) / size.width });
			const canvas = document.createElement("canvas");
			canvas.width = Math.floor(viewport.width);
			canvas.height = Math.floor(viewport.height);
			task = page.render({ canvas, viewport, background: "#ffffff" });
			await task.promise;
			const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
			canvas.width = 0;
			canvas.height = 0;
			page.cleanup();
			if (cancelled || !blob) return;
			objectURL = URL.createObjectURL(blob);
			setImage(objectURL);
		};

		const observer = new IntersectionObserver(
			(entries) => {
				if (!entries.some((entry) => entry.isIntersecting)) return;
				observer.disconnect();
				render().catch(() => {
					if (!cancelled) setFailed(true);
				});
			},
			{ rootMargin: "800px 0px" },
		);
		observer.observe(element);
		return () => {
			cancelled = true;
			observer.disconnect();
			task?.cancel();
			if (objectURL) URL.revokeObjectURL(objectURL);
		};
	}, [doc, number, size.width]);

	return (
		<div
			ref={holder}
			className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-md bg-white shadow-[0_1px_3px_rgba(0,0,0,.12)] ring-1 ring-black/5"
			style={{ aspectRatio: `${size.width} / ${size.height}` }}
		>
			{image ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img src={image} alt={`Page ${number}`} className="block size-full" />
			) : (
				<span className="absolute inset-0 flex items-center justify-center text-xs text-neutral-400">
					{failed ? `Page ${number} couldn't be shown` : <Loader2 className="size-5 animate-spin" />}
				</span>
			)}
		</div>
	);
}
