"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeGoogleOAuth } from "@/lib/api";

export function GoogleCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const providerError = searchParams.get("error_description") ?? searchParams.get("error");
    if (providerError) {
      setError(
        providerError === "access_denied"
          ? "Google sign-in was canceled."
          : providerError,
      );
      return;
    }

    let active = true;

    completeGoogleOAuth(searchParams.get("code"), searchParams.get("state"))
      .then(() => {
        if (active) router.replace("/");
      })
      .catch((err) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Google sign-in failed.");
      });

    return () => {
      active = false;
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex size-12 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive">
          <AlertCircle className="size-5" />
        </div>
        <p className="text-sm text-destructive">{error}</p>
        <Button
          asChild
          className="h-11 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Link href="/login">Try again</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <Loader2 className="size-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Signing you in...</p>
    </div>
  );
}
