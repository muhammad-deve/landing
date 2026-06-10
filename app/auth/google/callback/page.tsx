import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { GoogleCallbackClient } from "./google-callback-client";

export default function GoogleCallbackPage() {
  return (
    <AuthShell
      title="Google sign-in"
      subtitle="Finishing your Google authentication."
      footer={
        <Link href="/login" className="text-primary underline-offset-2 hover:underline">
          Back to log in
        </Link>
      }
    >
      <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Finishing sign-in...</p>}>
        <GoogleCallbackClient />
      </Suspense>
    </AuthShell>
  );
}
