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

interface ApiError {
  error?: string;
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
