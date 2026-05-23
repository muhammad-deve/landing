"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxVaHc0ZZSK6Md9k0qI-BH_fvZbvWYe603gcAcA-C4h07y0wBpqmZSA3vX8CBlgrpb7FQ/exec";

export function EarlyAccessForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      // Format date as DD/MM/YYYY HH:MM
      const now = new Date();
      const date = now.toLocaleDateString("en-GB"); // DD/MM/YYYY
      const time = now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const datetime = `${date} ${time}`;

      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, date: datetime }),
      });

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
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
      {status === "error" && (
        <p className="text-xs text-red-500">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
