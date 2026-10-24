// Base URL of the GoPort backend (PocketBase + custom API).
//
// NEXT_PUBLIC_* values are compiled into the client bundle at build time, so a
// single baked-in origin cannot serve every place this app is loaded from. A
// build pinned to http://localhost:8090 breaks the moment the page is reached
// over HTTPS -- through a tunnel, say -- because the browser refuses the
// insecure call as mixed content and reports only "Failed to fetch".
//
// So resolve it from where the page is actually running:
//   - NEXT_PUBLIC_API_BASE_URL set -> use it verbatim (production build)
//   - otherwise                    -> same-origin "", proxied by the rewrite
//                                     in next.config.mjs to API_PROXY_TARGET
//
// The same-origin path is what lets a tunnelled copy sign in against YOUR
// local backend, and keeps those calls visible in the inspector.
const LOCAL_API = "http://localhost:8090";

function resolveApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  // In the browser, stay on the page's own origin and let the Next rewrite in
  // next.config.mjs forward /api/* to the backend. Same scheme and host as the
  // page, so no mixed content and no CORS -- and because the request travels
  // through the tunnel, it appears in the local inspector.
  if (typeof window !== "undefined") return "";

  // Server-side fetches cannot use a relative URL.
  return process.env.API_PROXY_TARGET?.trim() || LOCAL_API;
}

/** Resolved per call so it reflects the origin the page was actually loaded from. */
export function apiBase(): string {
  return resolveApiBase();
}

export interface SendOtpResponse {
  otpId: string;
  message: string;
}

export interface VerifyOtpResponse {
  email: string;
  name: string;
  valid: boolean;
  message: string;
}

export interface CompleteRegistrationResponse {
  userId: string;
  email: string;
  name: string;
  message: string;
}

export interface ResetPasswordResponse {
  email: string;
  message: string;
}

export interface EmailChangeResponse {
  email: string;
  token: string;
  message: string;
}

export interface ChangePasswordResponse {
  token: string;
  message: string;
}

interface ApiError {
  error?: string;
  message?: string;
}

/** Thrown when the backend reports the email is already registered (HTTP 409). */
export class EmailRegisteredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailRegisteredError";
  }
}

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const body = (await res.json()) as ApiError;
    if (body?.error) return body.error;
    if (body?.message) return body.message;
  } catch {
    // ignore non-JSON bodies
  }
  return fallback;
}

/** Request an OTP code for the given email. Creates a pending user if needed. */
export async function sendOtp(
  email: string,
  name: string,
): Promise<SendOtpResponse> {
  const res = await fetch(`${apiBase()}/api/v1/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  });

  if (res.status === 409) {
    throw new EmailRegisteredError(
      await parseError(res, "This email is already registered. Please log in instead."),
    );
  }
  if (res.status === 429) {
    throw new Error(await parseError(res, "Too many attempts. Please try again later."));
  }
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to send code. Please try again."));
  }

  return (await res.json()) as SendOtpResponse;
}

/** Verify a previously issued OTP code without consuming it. */
export async function verifyOtp(
  otpId: string,
  code: string,
): Promise<VerifyOtpResponse> {
  const res = await fetch(`${apiBase()}/api/v1/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otpId, code }),
  });

  if (!res.ok) {
    throw new Error(await parseError(res, "Invalid or expired code."));
  }

  return (await res.json()) as VerifyOtpResponse;
}

/** Finalize signup by setting the account password after OTP verification. */
export async function completeRegistration(
  otpId: string,
  code: string,
  password: string,
): Promise<CompleteRegistrationResponse> {
  const res = await fetch(`${apiBase()}/api/v1/auth/complete-registration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otpId, code, password }),
  });

  if (res.status === 409) {
    throw new EmailRegisteredError(
      await parseError(res, "This email is already registered. Please log in instead."),
    );
  }
  if (!res.ok) {
    throw new Error(await parseError(res, "Couldn't create your account. Please try again."));
  }

  return (await res.json()) as CompleteRegistrationResponse;
}

/** Request a password-reset OTP for an existing account. */
export async function forgotPassword(email: string): Promise<SendOtpResponse> {
  const res = await fetch(`${apiBase()}/api/v1/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (res.status === 429) {
    throw new Error(await parseError(res, "Too many attempts. Please try again later."));
  }
  if (!res.ok) {
    throw new Error(await parseError(res, "Failed to send reset code. Please try again."));
  }

  return (await res.json()) as SendOtpResponse;
}

/** Set a new password after the reset OTP has been verified. */
export async function resetPassword(
  otpId: string,
  code: string,
  password: string,
): Promise<ResetPasswordResponse> {
  const res = await fetch(`${apiBase()}/api/v1/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otpId, code, password }),
  });

  if (!res.ok) {
    throw new Error(await parseError(res, "Couldn't reset your password. Please try again."));
  }

  return (await res.json()) as ResetPasswordResponse;
}

export interface LoginResponse {
  token: string;
  record: {
    id: string;
    email: string;
    name: string;
    verified: boolean;
  };
}

const AUTH_STORAGE_KEY = "goport_auth";
const GOOGLE_OAUTH_SESSION_KEY = "goport_google_oauth";

interface OAuthProvider {
  name: string;
  displayName: string;
  state: string;
  authURL?: string;
  authUrl?: string;
  codeVerifier: string;
}

interface AuthMethodsResponse {
  oauth2?: {
    enabled: boolean;
    providers: OAuthProvider[];
  };
  authProviders?: OAuthProvider[];
}

interface GoogleOAuthSession {
  provider: "google";
  state: string;
  codeVerifier: string;
  redirectURL: string;
}

export function storeAuthSession(auth: LoginResponse) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      token: auth.token,
      record: auth.record,
    }),
  );
}

/** Read the persisted auth session, or null when signed out. */
export function readAuthSession(): LoginResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LoginResponse>;
    if (!parsed.token || !parsed.record) return null;
    return parsed as LoginResponse;
  } catch {
    return null;
  }
}

/** Clear the persisted auth session (log out). */
export function clearAuthSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

/**
 * Log out: ask the API to end every dashboard session of this account, then
 * forget the local one. The request is fire-and-forget, so a slow or failed
 * call never blocks leaving the dashboard.
 */
export function logOut() {
  const token = readAuthSession()?.token;
  if (token) {
    void fetch(`${apiBase()}/api/v1/account/logout`, {
      method: "POST",
      headers: { Authorization: token },
    }).catch(() => {});
  }
  clearAuthSession();
}

export interface DashboardDomain {
  subdomain: string;
  url: string;
  isCustom: boolean;
  isCurrent: boolean;
  localPort?: string;
  protocol?: string;
  requests: number;
  bytes: number;
  lastActive?: string;
  created?: string;
}

export interface TokenItem {
  id: string;
  name: string;
  token: string;
  created?: string;
  /** When this token last authenticated a tunnel. Absent means never used. */
  lastUsed?: string;
}

export interface BillingTransaction {
  id: string;
  amountCents: number;
  currency: string;
  description: string;
  status: "paid" | "pending" | "failed" | "refunded" | "partially_refunded";
  chargedAt: string;
  invoiceUrl?: string;
  /** "trial" marks a zero-amount bookkeeping row, so it is never shown as a payment. */
  kind?: "charge" | "trial";
}

export interface BillingSubscription {
  id: string;
  planName: string;
  status: "on_trial" | "active" | "paused" | "past_due" | "unpaid" | "cancelled" | "expired";
  amountCents: number;
  currency: string;
  interval: "month" | "year";
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
}

export interface PlanLimits {
  key: "free" | "pro";
  isPro: boolean;
  maxActiveTunnels: number;
  maxTokens: number;
  monthlyBytes: number;
  customSubdomains: boolean;
}

export interface BillingData {
  isPro: boolean;
  checkoutConfigured: boolean;
  availablePlans: Array<"monthly" | "yearly">;
  plan: PlanLimits;
  subscription: BillingSubscription | null;
  transactions: BillingTransaction[];
  /** True once this account has consumed its one free trial. */
  trialUsed?: boolean;
  /** True when a Lemon Squeezy customer portal link can be minted. */
  portalAvailable?: boolean;
}

export interface DashboardData {
  name: string;
  email: string;
  avatar: string;
  totalRequests: number;
  totalBytes: number;
  /** Traffic used since the 1st of the current UTC month — what the plan limit measures. */
  monthBytes?: number;
  /** When the monthly allowance rolls over (RFC 3339). */
  monthResetsAt?: string;
  domains: DashboardDomain[];
  tokens: TokenItem[];
  billing?: BillingData;
}

export interface CloudShare {
	id: string;
	url?: string;
	filename: string;
	mimeType: string;
	size: number;
	expiresAt: string;
	revoked: boolean;
	passwordProtected: boolean;
	/** The link opens the file itself instead of the GoPort share page (Pro). */
	direct: boolean;
	downloads: number;
	/** Downloads the owner's plan allows for this file; absent means unlimited. */
	downloadLimit?: number;
	created: string;
	previewable: boolean;
}

/**
 * What the public share page receives. While `locked` (the password hasn't
 * been entered), only the expiry is included.
 */
export interface PublicShare {
	filename?: string;
	mimeType?: string;
	size?: number;
	expiresAt: string;
	passwordProtected: boolean;
	/** Absent from servers older than the locked view. */
	locked?: boolean;
	previewable: boolean;
	/** Seconds this visitor must still wait before trying a password again. */
	retryAfter?: number;
}

export interface SharePlanLimits {
	storageBytes: number;
	maxUploadBytes: number;
	defaultRetentionHours: number;
	maxRetentionHours: number;
	/** Downloads allowed per file; 0 means unlimited. */
	maxDownloads: number;
	/** Files one account may keep; 0 means unlimited. */
	maxFiles?: number;
	directLinks: boolean;
}

export interface ShareLimits {
	isPro: boolean;
	current: SharePlanLimits;
	free: SharePlanLimits;
	pro: SharePlanLimits;
}

export interface CloudSharesResponse {
	items: CloudShare[];
	storage: { usedBytes: number; quotaBytes: number; remainingBytes: number; files?: number };
	maxUploadBytes: number;
	limits?: ShareLimits;
	chunkSize?: number;
}

export async function getCloudShares(token: string): Promise<CloudSharesResponse> {
	const res = await fetch(`${apiBase()}/api/v1/shares`, { headers: { Authorization: token }, cache: "no-store" });
	if (res.status === 401 || res.status === 403) throw new UnauthorizedError();
	if (!res.ok) throw new Error(await parseError(res, "Couldn't load shared files."));
	return (await res.json()) as CloudSharesResponse;
}

export interface CloudShareUploadOptions {
	expiresAt: string;
	password: string;
	direct: boolean;
	onProgress: (percent: number) => void;
	signal?: AbortSignal;
}

const OFFLINE_MESSAGE = "Couldn't reach GoPort. Check your connection and try again.";

/** Thrown when the user cancels an upload. */
export class UploadCancelledError extends Error {
	constructor() {
		super("Upload cancelled.");
		this.name = "UploadCancelledError";
	}
}

class HttpError extends Error {
	constructor(message: string, readonly status: number, readonly body: Record<string, unknown>) {
		super(message);
		this.name = "HttpError";
	}
}

async function shareJSON<T>(token: string, method: string, path: string, body?: unknown): Promise<T> {
	let res: Response;
	try {
		res = await fetch(`${apiBase()}${path}`, {
			method,
			headers: { Authorization: token, ...(body === undefined ? {} : { "Content-Type": "application/json" }) },
			body: body === undefined ? undefined : JSON.stringify(body),
		});
	} catch {
		throw new Error(OFFLINE_MESSAGE);
	}
	if (res.status === 401) throw new UnauthorizedError();
	let parsed: Record<string, unknown> = {};
	try {
		parsed = (await res.json()) as Record<string, unknown>;
	} catch {
		// empty body
	}
	if (!res.ok) throw new HttpError(typeof parsed.error === "string" ? parsed.error : "Something went wrong. Try again.", res.status, parsed);
	return parsed as T;
}

/** Sends one chunk with XMLHttpRequest so upload progress is reported. */
function sendChunk(token: string, uploadId: string, offset: number, chunk: Blob, onProgress: (loaded: number) => void, signal?: AbortSignal): Promise<number> {
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();
		const abort = () => request.abort();
		signal?.addEventListener("abort", abort, { once: true });
		const done = () => signal?.removeEventListener("abort", abort);
		request.open("PUT", `${apiBase()}/api/v1/shares/uploads/${encodeURIComponent(uploadId)}?offset=${offset}`);
		request.setRequestHeader("Authorization", token);
		request.setRequestHeader("Content-Type", "application/octet-stream");
		request.upload.onprogress = (event) => onProgress(event.loaded);
		request.onabort = () => {
			done();
			reject(new UploadCancelledError());
		};
		request.onerror = () => {
			done();
			reject(new Error(OFFLINE_MESSAGE));
		};
		request.onload = () => {
			done();
			let body: Record<string, unknown> = {};
			try {
				body = JSON.parse(request.responseText) as Record<string, unknown>;
			} catch {
				// empty body
			}
			if (request.status === 401) {
				reject(new UnauthorizedError());
				return;
			}
			if (request.status >= 200 && request.status < 300) {
				resolve(Number(body.received));
				return;
			}
			reject(new HttpError(typeof body.error === "string" ? body.error : "Upload failed.", request.status, body));
		};
		request.send(chunk);
	});
}

/**
 * Uploads a file in chunks. Each request stays small enough for every proxy
 * on the way, a failed chunk is retried, and when a response is lost the
 * server says where to resume.
 */
export async function uploadCloudShare(token: string, file: File, options: CloudShareUploadOptions): Promise<CloudShare> {
	const session = await shareJSON<{ id: string; chunkSize: number }>(token, "POST", "/api/v1/shares/uploads", {
		filename: file.name,
		size: file.size,
		expiresAt: options.expiresAt,
		password: options.password,
		direct: options.direct,
	});
	let offset = 0;
	let failures = 0;
	try {
		while (offset < file.size) {
			if (options.signal?.aborted) throw new UploadCancelledError();
			const start = offset;
			const end = Math.min(start + session.chunkSize, file.size);
			try {
				offset = await sendChunk(
					token,
					session.id,
					start,
					file.slice(start, end),
					(loaded) => options.onProgress(Math.min(99, Math.floor(((start + loaded) / file.size) * 100))),
					options.signal,
				);
				failures = 0;
			} catch (err) {
				if (err instanceof HttpError && err.status === 409 && typeof err.body.received === "number") {
					offset = err.body.received;
					continue;
				}
				const retryable = !(err instanceof HttpError) || err.status >= 500 || err.status === 429;
				if (err instanceof UploadCancelledError || err instanceof UnauthorizedError || !retryable || ++failures > 3) throw err;
				await new Promise((resume) => setTimeout(resume, 1000 * failures));
			}
		}
		const item = await shareJSON<CloudShare>(token, "POST", `/api/v1/shares/uploads/${encodeURIComponent(session.id)}/complete`);
		options.onProgress(100);
		return item;
	} catch (err) {
		// Free the reserved space unless the server already dropped the upload.
		if (!(err instanceof HttpError && err.status === 404)) {
			void shareJSON(token, "DELETE", `/api/v1/shares/uploads/${encodeURIComponent(session.id)}`).catch(() => undefined);
		}
		throw err;
	}
}

export async function updateCloudShare(token: string, id: string, changes: { expiresAt: string; password?: string; direct?: boolean }): Promise<CloudShare> {
	return shareJSON<CloudShare>(token, "PATCH", `/api/v1/shares/${encodeURIComponent(id)}`, changes);
}

export async function revokeCloudShare(token: string, id: string): Promise<void> {
	await shareJSON(token, "POST", `/api/v1/shares/${encodeURIComponent(id)}/revoke`);
}

export async function restoreCloudShare(token: string, id: string): Promise<void> {
	await shareJSON(token, "POST", `/api/v1/shares/${encodeURIComponent(id)}/restore`);
}

export async function deleteCloudShare(token: string, id: string): Promise<void> {
	await shareJSON(token, "DELETE", `/api/v1/shares/${encodeURIComponent(id)}`);
}

export type PublicShareState = "expired" | "revoked" | "limit" | "invalid" | "password" | "locked" | "offline" | "unknown";

/** Why a public share could not be opened or unlocked. */
export class PublicShareError extends Error {
	constructor(
		message: string,
		readonly state: PublicShareState,
		readonly attemptsLeft = 0,
		readonly retryAfter = 0,
	) {
		super(message);
		this.name = "PublicShareError";
	}
}

async function publicShareError(res: Response, fallback: string): Promise<PublicShareError> {
	let body: { error?: string; state?: string; attemptsLeft?: number; retryAfter?: number } = {};
	try {
		body = await res.json();
	} catch {
		// empty body
	}
	const known: PublicShareState[] = ["expired", "revoked", "limit", "invalid", "password", "locked"];
	const state = known.find((value) => value === body.state) ?? "unknown";
	const retryAfter = Number(body.retryAfter ?? res.headers.get("Retry-After") ?? 0);
	return new PublicShareError(body.error || fallback, state, Number(body.attemptsLeft ?? 0), Number.isFinite(retryAfter) ? retryAfter : 0);
}

export async function getPublicShare(token: string): Promise<PublicShare> {
	let res: Response;
	try {
		res = await fetch(`${apiBase()}/api/v1/public/shares/${encodeURIComponent(token)}`, { cache: "no-store", credentials: "include" });
	} catch {
		throw new PublicShareError(OFFLINE_MESSAGE, "offline");
	}
	if (!res.ok) throw await publicShareError(res, "This sharing link is unavailable.");
	return (await res.json()) as PublicShare;
}

export async function unlockPublicShare(token: string, password: string): Promise<void> {
	let res: Response;
	try {
		res = await fetch(`${apiBase()}/api/v1/public/shares/${encodeURIComponent(token)}/unlock`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ password }),
			credentials: "include",
		});
	} catch {
		throw new PublicShareError(OFFLINE_MESSAGE, "offline");
	}
	if (!res.ok) throw await publicShareError(res, "Wrong password.");
}

export function publicShareContentURL(token: string, preview = false, download = false): string {
	const query = new URLSearchParams();
	if (preview) query.set("preview", "1");
	if (download) query.set("download", "1");
	return `${apiBase()}/api/v1/public/shares/${encodeURIComponent(token)}/content?${query.toString()}`;
}

export type UsageRange = "hour" | "day" | "week";

export interface UsagePoint {
  timestamp: string;
  requests: number;
  bytes: number;
}

export interface UsageSeries {
  tunnelId: string;
  subdomain: string;
  url: string;
  points: UsagePoint[];
}

export interface UsageData {
  range: UsageRange;
  from: string;
  to: string;
  bucketSeconds: number;
  series: UsageSeries[];
}

/** Thrown when the dashboard request is rejected for an expired/invalid session. */
export class UnauthorizedError extends Error {
  constructor(message = "Your session has expired. Please log in again.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Fetch the authenticated user's dashboard (profile, tokens, stats, domains). */
export async function getDashboard(token: string, signal?: AbortSignal): Promise<DashboardData> {
  const res = await fetch(`${apiBase()}/api/v1/dashboard`, {
    headers: { Authorization: token },
    signal,
  });

  if (res.status === 401 || res.status === 403) {
    throw new UnauthorizedError();
  }
  if (!res.ok) {
    throw new Error(await parseError(res, "Couldn't load your dashboard. Please try again."));
  }

  return (await res.json()) as DashboardData;
}

export async function createBillingCheckout(
  authToken: string,
  plan: "monthly" | "yearly",
): Promise<{ url: string }> {
  const res = await fetch(`${apiBase()}/api/v1/billing/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authToken },
    body: JSON.stringify({ plan }),
  });

  if (res.status === 401) throw new UnauthorizedError();
  if (res.status === 403) {
    // Our own 403 carries an "error" text (upgrades closed for this account);
    // any other 403 is an auth problem.
    let message = "";
    try {
      message = ((await res.json()) as ApiError)?.error ?? "";
    } catch {
      // ignore non-JSON bodies
    }
    if (!message) throw new UnauthorizedError();
    throw new Error(message);
  }
  if (!res.ok) {
    throw new Error(await parseError(res, "Couldn't start checkout. Please try again."));
  }
  return (await res.json()) as { url: string };
}

export async function changeBillingSubscriptionPlan(authToken: string, plan: "yearly"): Promise<void> {
  const res = await fetch(`${apiBase()}/api/v1/billing/subscription`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: authToken },
    body: JSON.stringify({ plan }),
  });

  if (res.status === 401 || res.status === 403) throw new UnauthorizedError();
  if (!res.ok) {
    throw new Error(await parseError(res, "Couldn't change your billing cycle. Please try again."));
  }
}

export async function cancelBillingSubscription(authToken: string): Promise<void> {
  const res = await fetch(`${apiBase()}/api/v1/billing/subscription`, {
    method: "DELETE",
    headers: { Authorization: authToken },
  });

  if (res.status === 401 || res.status === 403) throw new UnauthorizedError();
  if (!res.ok) {
    throw new Error(await parseError(res, "Couldn't cancel your subscription. Please try again."));
  }
}

/**
 * Mint a short-lived Lemon Squeezy customer portal link. Fetched on click
 * rather than with the dashboard because the URL is signed and expires.
 */
export async function getBillingPortalUrl(authToken: string): Promise<string> {
  const res = await fetch(`${apiBase()}/api/v1/billing/portal`, {
    headers: { Authorization: authToken },
  });

  if (res.status === 401 || res.status === 403) throw new UnauthorizedError();
  if (!res.ok) {
    throw new Error(await parseError(res, "Couldn't open the billing portal. Please try again."));
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

/** Fetch privacy-safe, time-bucketed traffic for every tunnel owned by the user. */
export async function getDashboardUsage(
  token: string,
  range: UsageRange,
  signal?: AbortSignal,
): Promise<UsageData> {
  const res = await fetch(
    `${apiBase()}/api/v1/dashboard/usage?range=${encodeURIComponent(range)}`,
    {
      headers: { Authorization: token },
      signal,
      cache: "no-store",
    },
  );

  if (res.status === 401 || res.status === 403) {
    throw new UnauthorizedError();
  }
  if (!res.ok) {
    throw new Error(await parseError(res, "Couldn't load usage history. Please try again."));
  }

  return (await res.json()) as UsageData;
}

/** Keep the cached account email in sync after a verified email change. */
export function updateStoredAuthSession(token: string, email?: string) {
  const session = readAuthSession();
  if (!session) return;
  storeAuthSession({
    ...session,
    token,
    record: email ? { ...session.record, email } : session.record,
  });
}

/** Keep the cached account name in sync after a profile update. */
export function updateStoredProfileName(name: string) {
  const session = readAuthSession();
  if (!session) return;
  storeAuthSession({
    ...session,
    record: { ...session.record, name },
  });
}

/** Update the signed-in user's display name on their PocketBase record. */
export async function updateProfileName(authToken: string, firstName: string, lastName: string): Promise<void> {
  const session = readAuthSession();
  if (!session) throw new UnauthorizedError();

  const name = `${firstName.trim()} ${lastName.trim()}`.trim();
  const res = await fetch(
    `${apiBase()}/api/collections/users/records/${encodeURIComponent(session.record.id)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: authToken },
      body: JSON.stringify({ name }),
    },
  );

  if (res.status === 401 || res.status === 403) throw new UnauthorizedError();
  if (!res.ok) {
    throw new Error(await parseError(res, "Couldn't update your name. Please try again."));
  }
}

/** Upload a user-selected profile image to the authenticated PocketBase record. */
export async function uploadProfilePhoto(authToken: string, file: File): Promise<void> {
  const session = readAuthSession();
  if (!session) throw new UnauthorizedError();

  const formData = new FormData();
  formData.append("avatar", file);

  const res = await fetch(
    `${apiBase()}/api/collections/users/records/${encodeURIComponent(session.record.id)}`,
    {
      method: "PATCH",
      headers: { Authorization: authToken },
      body: formData,
    },
  );

  if (res.status === 401 || res.status === 403) throw new UnauthorizedError();
  if (!res.ok) {
    throw new Error(await parseError(res, "Couldn't upload your profile picture. Please try again."));
  }
}

/** Send a verification code to a signed-in user's proposed new email. */
export async function requestEmailChange(authToken: string, email: string): Promise<SendOtpResponse> {
  const res = await fetch(`${apiBase()}/api/v1/account/email/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authToken },
    body: JSON.stringify({ email }),
  });

  if (res.status === 401 || res.status === 403) throw new UnauthorizedError();
  if (res.status === 429) {
    throw new Error(await parseError(res, "Too many attempts. Please try again later."));
  }
  if (!res.ok) {
    throw new Error(await parseError(res, "Couldn't send the verification code."));
  }
  return (await res.json()) as SendOtpResponse;
}

/** Verify the code and replace the authenticated user's email. */
export async function confirmEmailChange(authToken: string, otpId: string, code: string): Promise<EmailChangeResponse> {
  const res = await fetch(`${apiBase()}/api/v1/account/email/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authToken },
    body: JSON.stringify({ otpId, code }),
  });

  if (res.status === 401 || res.status === 403) throw new UnauthorizedError();
  if (!res.ok) {
    throw new Error(await parseError(res, "Invalid or expired code."));
  }
  return (await res.json()) as EmailChangeResponse;
}

/** Verify the current password and replace it for the signed-in account. */
export async function changePassword(
  authToken: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
): Promise<ChangePasswordResponse> {
  const res = await fetch(`${apiBase()}/api/v1/account/password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authToken },
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });

  if (res.status === 401 || res.status === 403) throw new UnauthorizedError();
  if (!res.ok) {
    throw new Error(await parseError(res, "Couldn't change your password."));
  }
  return (await res.json()) as ChangePasswordResponse;
}

/** Create a new named CLI token. The backend generates the token value. */
export async function createToken(authToken: string, name: string): Promise<TokenItem> {
  const res = await fetch(`${apiBase()}/api/v1/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authToken },
    body: JSON.stringify({ name }),
  });

  if (res.status === 401 || res.status === 403) {
    throw new UnauthorizedError();
  }
  if (res.status === 409) {
    throw new Error(await parseError(res, "You already have a token with this name."));
  }
  if (!res.ok) {
    throw new Error(await parseError(res, "Couldn't create the token. Please try again."));
  }

  return (await res.json()) as TokenItem;
}

/** Delete one of the user's CLI tokens by id. */
export async function deleteToken(authToken: string, id: string): Promise<void> {
  const res = await fetch(`${apiBase()}/api/v1/tokens/${id}`, {
    method: "DELETE",
    headers: { Authorization: authToken },
  });

  if (res.status === 401 || res.status === 403) {
    throw new UnauthorizedError();
  }
  if (!res.ok) {
    throw new Error(await parseError(res, "Couldn't delete the token. Please try again."));
  }
}

/** Disconnect an active CLI session for one of the authenticated user's tunnels. */
export async function stopTunnel(authToken: string, subdomain: string): Promise<void> {
  const res = await fetch(
    `${apiBase()}/api/v1/tunnels/${encodeURIComponent(subdomain)}/stop`,
    {
      method: "POST",
      headers: { Authorization: authToken },
    },
  );

  if (res.status === 401 || res.status === 403) throw new UnauthorizedError();
  if (!res.ok) {
    throw new Error(await parseError(res, "Couldn't stop the tunnel."));
  }
}

/** Permanently remove an inactive tunnel and its aggregate traffic history. */
export async function deleteTunnel(authToken: string, subdomain: string): Promise<void> {
  const res = await fetch(
    `${apiBase()}/api/v1/tunnels/${encodeURIComponent(subdomain)}`,
    {
      method: "DELETE",
      headers: { Authorization: authToken },
    },
  );

  if (res.status === 401 || res.status === 403) throw new UnauthorizedError();
  if (!res.ok) {
    throw new Error(await parseError(res, "Couldn't delete the tunnel."));
  }
}

/** Authenticate with email + password against the built-in PocketBase users collection. */
export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const res = await fetch(
    `${apiBase()}/api/collections/users/auth-with-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity: email, password }),
    },
  );

  if (!res.ok) {
    throw new Error(await parseError(res, "Invalid email or password."));
  }

  return (await res.json()) as LoginResponse;
}

/** Start the PocketBase Google OAuth flow in the current browser window. */
export async function startGoogleOAuth(): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("Google sign-in is only available in the browser.");
  }

  const res = await fetch(`${apiBase()}/api/collections/users/auth-methods`);
  if (!res.ok) {
    throw new Error(await parseError(res, "Couldn't start Google sign-in."));
  }

  const methods = (await res.json()) as AuthMethodsResponse;
  const providers = methods.oauth2?.providers ?? methods.authProviders ?? [];
  const google = providers.find((provider) => provider.name === "google");
  const authURL = google?.authURL ?? google?.authUrl;

  if (!methods.oauth2?.enabled || !google || !authURL) {
    throw new Error("Google sign-in is not configured yet.");
  }

  const redirectURL = `${window.location.origin}/auth/google/callback`;
  const session: GoogleOAuthSession = {
    provider: "google",
    state: google.state,
    codeVerifier: google.codeVerifier,
    redirectURL,
  };

  window.sessionStorage.setItem(GOOGLE_OAUTH_SESSION_KEY, JSON.stringify(session));
  window.location.href = withRedirectURL(authURL, redirectURL);
}

export async function completeGoogleOAuth(
  code: string | null,
  state: string | null,
): Promise<LoginResponse> {
  if (typeof window === "undefined") {
    throw new Error("Google sign-in is only available in the browser.");
  }
  if (!code) {
    throw new Error("Google did not return an authorization code.");
  }

  const session = readGoogleOAuthSession();
  if (!session) {
    throw new Error("Google sign-in session expired. Please try again.");
  }
  if (state !== session.state) {
    throw new Error("Google sign-in state mismatch. Please try again.");
  }

  const res = await fetch(`${apiBase()}/api/collections/users/auth-with-oauth2`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      provider: session.provider,
      code,
      codeVerifier: session.codeVerifier,
      redirectURL: session.redirectURL,
    }),
  });

  if (!res.ok) {
    throw new Error(await parseError(res, "Google sign-in failed. Please try again."));
  }

  const auth = (await res.json()) as LoginResponse;
  storeAuthSession(auth);
  window.sessionStorage.removeItem(GOOGLE_OAUTH_SESSION_KEY);
  return auth;
}

function readGoogleOAuthSession(): GoogleOAuthSession | null {
  try {
    const raw = window.sessionStorage.getItem(GOOGLE_OAUTH_SESSION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<GoogleOAuthSession>;
    if (
      parsed.provider !== "google" ||
      !parsed.state ||
      !parsed.codeVerifier ||
      !parsed.redirectURL
    ) {
      return null;
    }

    return parsed as GoogleOAuthSession;
  } catch {
    return null;
  }
}

function withRedirectURL(authURL: string, redirectURL: string): string {
  const encodedRedirect = encodeURIComponent(redirectURL);
  if (authURL.includes("redirect_uri=")) {
    return `${authURL}${encodedRedirect}`;
  }

  const separator = authURL.includes("?") ? "&" : "?";
  return `${authURL}${separator}redirect_uri=${encodedRedirect}`;
}
