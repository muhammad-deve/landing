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
  userId: string;
  email: string;
  name: string;
  verified: boolean;
  message: string;
}

interface ApiError {
  error?: string;
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

/** Request an OTP code for the given email. Creates the user if needed. */
export async function sendOtp(
  email: string,
  name: string,
): Promise<SendOtpResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
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
    throw new Error(await parseError(res, "Failed to send code. Please try again."));
  }

  return (await res.json()) as SendOtpResponse;
}

/** Verify a previously issued OTP code. */
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
