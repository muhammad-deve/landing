"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function EarlyAccessForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submittedEmail = email.trim();
    if (!submittedEmail) return;

    setStatus("loading");
    setEmail("");
    window.setTimeout(() => setStatus("success"), 700);

    void fetch("/api/early-access", {
      method: "POST",
      keepalive: true,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: submittedEmail }),
    }).catch((error) => {
      console.error("Unable to save early access email", error);
    });
  };

  if (status === "success") {
    return (
      <div className="flex w-full max-w-md flex-col gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2">
          <span className="text-primary">&#10003;</span>
          <span className="text-sm text-foreground">
          You&apos;re on the list. We&apos;ll notify you when GoPort launches.
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setStatus("idle")}
          className="h-8 px-2 text-xs text-primary hover:bg-primary/10 hover:text-primary"
        >
          Add another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <Input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="min-h-12 flex-1 border-border bg-card px-4 py-3 font-mono text-base leading-normal placeholder:text-muted-foreground focus-visible:ring-primary sm:min-h-11 sm:py-2 sm:text-sm"
      />
      <Button
        type="submit"
        disabled={status === "loading"}
        className="h-12 bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/90 sm:h-11"
      >
        {status === "loading" && (
          <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
        )}
        <span>{status === "loading" ? "Submitting" : "Notify me"}</span>
      </Button>
    </form>
  );
}
