"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function EarlyAccessForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    // Simulate API call - replace with actual endpoint
    await new Promise((resolve) => setTimeout(resolve, 800));

    // TODO: Connect to your backend to store emails
    // Example: await fetch('/api/waitlist', { method: 'POST', body: JSON.stringify({ email }) })

    setStatus("success");
    setEmail("");
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
        <span className="text-primary">&#10003;</span>
        <span className="text-sm text-foreground">
          You&apos;re on the list. We&apos;ll notify you when GoPort launches.
        </span>
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
        className="h-11 flex-1 border-border bg-card font-mono text-sm placeholder:text-muted-foreground focus-visible:ring-primary"
      />
      <Button
        type="submit"
        disabled={status === "loading"}
        className="h-11 bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/90"
      >
        {status === "loading" ? "..." : "Notify me"}
      </Button>
    </form>
  );
}
