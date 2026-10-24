"use client";

import { useEffect } from "react";
import { getDashboard, readAuthSession } from "@/lib/api";

/** Seconds until the token's exp claim, or null if it can't be read. */
function secondsLeft(token: string): number | null {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const exp = (JSON.parse(atob(payload)) as { exp?: unknown }).exp;
    return typeof exp === "number" ? exp - Date.now() / 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Sends signed-in visitors from the homepage to /dashboard, but only when the
 * session is unexpired and the dashboard actually loads. An expired session or
 * a backend outage leaves them on the homepage.
 */
export function AuthRedirect() {
  useEffect(() => {
    const session = readAuthSession();
    if (!session) return;
    const left = secondsLeft(session.token);
    if (left === null || left < 60) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3000);
    getDashboard(session.token, controller.signal)
      // Full page load, so analytics loaded here don't carry over.
      .then(() => window.location.replace("/dashboard"))
      .catch(() => undefined)
      .finally(() => window.clearTimeout(timeout));

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return null;
}
