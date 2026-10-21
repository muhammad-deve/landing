import { apiBase } from "@/lib/api";

// A direct link opens the shared file itself, with no GoPort page around it
// (Pro). The file streams from the backend so the address stays on goport.uz.
// The trailing name is only there to make the link readable.

export const dynamic = "force-dynamic";

const FORWARD_REQUEST = ["range", "if-range", "if-none-match", "if-modified-since"];
const FORWARD_RESPONSE = [
	"accept-ranges",
	"cache-control",
	"content-disposition",
	"content-length",
	"content-range",
	"content-security-policy",
	"content-type",
	"etag",
	"last-modified",
	"referrer-policy",
	"x-content-type-options",
];

type Context = { params: Promise<{ token: string; name?: string[] }> };

function redirect(location: string) {
	return new Response(null, { status: 302, headers: { Location: location, "Cache-Control": "no-store" } });
}

async function serve(request: Request, context: Context, method: "GET" | "HEAD") {
	const { token } = await context.params;
	if (!/^[A-Za-z0-9_-]{32,128}$/.test(token)) return redirect(`/s/${encodeURIComponent(token)}`);
	const backendURL = `${apiBase()}/api/v1/public/shares/${encodeURIComponent(token)}/raw`;

	// Uncompressed, so Content-Length and Range offsets match the body passed on.
	const headers = new Headers({ "accept-encoding": "identity" });
	for (const name of FORWARD_REQUEST) {
		const value = request.headers.get(name);
		if (value) headers.set(name, value);
	}

	let upstream: Response;
	try {
		upstream = await fetch(backendURL, { method, headers, cache: "no-store", redirect: "manual" });
	} catch {
		// If this server can't reach the API, let the browser fetch the file
		// from it directly.
		return redirect(backendURL);
	}

	if (upstream.status === 429) {
		return new Response("This file is busy right now. Try again in a moment.", { status: 503, headers: { "Retry-After": "5", "Content-Type": "text/plain; charset=utf-8" } });
	}
	// Revoked, expired, deleted, over its download limit, or not a direct link:
	// the share page explains which, or shows the file the normal way.
	if (upstream.status >= 400) {
		void upstream.body?.cancel();
		return redirect(`/s/${encodeURIComponent(token)}`);
	}

	const responseHeaders = new Headers();
	for (const name of FORWARD_RESPONSE) {
		const value = upstream.headers.get(name);
		if (value) responseHeaders.set(name, value);
	}
	return new Response(method === "HEAD" || upstream.status === 304 ? null : upstream.body, { status: upstream.status, headers: responseHeaders });
}

export function GET(request: Request, context: Context) {
	return serve(request, context, "GET");
}

export function HEAD(request: Request, context: Context) {
	return serve(request, context, "HEAD");
}
