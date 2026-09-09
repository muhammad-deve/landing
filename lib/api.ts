// Base URL of the GoPort backend (PocketBase + custom API).
// Override per-environment with NEXT_PUBLIC_API_BASE_URL.
//   - local dev:   http://localhost:8090
//   - production:  https://back.goport.uz
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8090";

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
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/send-otp`, {
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
    const retryAfter = res.headers.get("Retry-After");
    throw new Error(
      retryAfter
        ? `Too many requests. Try again in ${retryAfter}s.`
        : "Too many requests. Please try again later.",
    );
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
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/verify-otp`, {
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
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/complete-registration`, {
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
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (res.status === 429) {
    const retryAfter = res.headers.get("Retry-After");
    throw new Error(
      retryAfter
        ? `Too many requests. Try again in ${retryAfter}s.`
        : "Too many requests. Please try again later.",
    );
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
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
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
}

export interface BillingCard {
  id: string;
  brand: string;
  last4: string;
  expiresMonth: number;
  expiresYear: number;
  isDefault: boolean;
}

export interface BillingTransaction {
  id: string;
  amountCents: number;
  currency: string;
  description: string;
  status: "paid" | "pending" | "failed" | "refunded";
  chargedAt: string;
  cardBrand: string;
  cardLast4: string;
}

export interface BillingSubscription {
  id: string;
  planName: string;
  status: "active" | "trialing" | "past_due" | "canceled";
  amountCents: number;
  currency: string;
  interval: "month" | "year";
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  freeMonthOfferUsed: boolean;
  nextChargeAmountCents?: number;
}

export interface BillingData {
  subscription: BillingSubscription | null;
  cards: BillingCard[];
  transactions: BillingTransaction[];
}

export interface DashboardData {
  name: string;
  email: string;
  avatar: string;
  totalRequests: number;
  totalBytes: number;
  domains: DashboardDomain[];
  tokens: TokenItem[];
  billing?: BillingData;
}

/** Thrown when the dashboard request is rejected for an expired/invalid session. */
export class UnauthorizedError extends Error {
  constructor(message = "Your session has expired. Please log in again.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** Fetch the authenticated user's dashboard (profile, tokens, stats, domains). */
export async function getDashboard(token: string): Promise<DashboardData> {
  const res = await fetch(`${API_BASE_URL}/api/v1/dashboard`, {
    headers: { Authorization: token },
  });

  if (res.status === 401 || res.status === 403) {
    throw new UnauthorizedError();
  }
  if (!res.ok) {
    throw new Error(await parseError(res, "Couldn't load your dashboard. Please try again."));
  }

  return (await res.json()) as DashboardData;
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
    `${API_BASE_URL}/api/collections/users/records/${encodeURIComponent(session.record.id)}`,
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
    `${API_BASE_URL}/api/collections/users/records/${encodeURIComponent(session.record.id)}`,
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
  const res = await fetch(`${API_BASE_URL}/api/v1/account/email/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authToken },
    body: JSON.stringify({ email }),
  });

  if (res.status === 401 || res.status === 403) throw new UnauthorizedError();
  if (res.status === 429) {
    const retryAfter = res.headers.get("Retry-After");
    throw new Error(retryAfter ? `Try again in ${retryAfter}s.` : "Too many requests. Try again later.");
  }
  if (!res.ok) {
    throw new Error(await parseError(res, "Couldn't send the verification code."));
  }
  return (await res.json()) as SendOtpResponse;
}

/** Verify the code and replace the authenticated user's email. */
export async function confirmEmailChange(authToken: string, otpId: string, code: string): Promise<EmailChangeResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/account/email/confirm`, {
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
  const res = await fetch(`${API_BASE_URL}/api/v1/account/password`, {
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
  const res = await fetch(`${API_BASE_URL}/api/v1/tokens`, {
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
  const res = await fetch(`${API_BASE_URL}/api/v1/tokens/${id}`, {
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
    `${API_BASE_URL}/api/v1/tunnels/${encodeURIComponent(subdomain)}/stop`,
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
    `${API_BASE_URL}/api/v1/tunnels/${encodeURIComponent(subdomain)}`,
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
    `${API_BASE_URL}/api/collections/users/auth-with-password`,
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

  const res = await fetch(`${API_BASE_URL}/api/collections/users/auth-methods`);
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

  const res = await fetch(`${API_BASE_URL}/api/collections/users/auth-with-oauth2`, {
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
