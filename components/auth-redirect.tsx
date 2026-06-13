"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { readAuthSession } from "@/lib/api";

/**
 * If the user already has a valid auth session in localStorage,
 * redirect them to /dashboard instead of showing the landing page.
 */
export function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const session = readAuthSession();
    if (session) {
      router.replace("/dashboard");
    }
  }, [router]);

  return null;
}
