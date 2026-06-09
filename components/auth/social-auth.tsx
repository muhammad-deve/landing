"use client";

import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/icons";

interface SocialAuthProps {
  /** "Sign up" | "Log in" wording. */
  action: string;
  onGoogle?: () => void;
}

export function SocialAuth({ action, onGoogle }: SocialAuthProps) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={onGoogle}
      className="h-11 w-full border-border/70 bg-transparent font-medium text-foreground hover:bg-white/5"
    >
      <GoogleIcon className="size-4" />
      {action} with Google
    </Button>
  );
}

export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <span className="h-px flex-1 bg-border/60" />
      <span className="text-xs uppercase tracking-wider text-muted-foreground">or</span>
      <span className="h-px flex-1 bg-border/60" />
    </div>
  );
}
