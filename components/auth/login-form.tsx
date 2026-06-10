"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialAuth, AuthDivider } from "@/components/auth/social-auth";

type View = "login" | "forgot" | "sent";

export function LoginForm() {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    window.setTimeout(() => setLoading(false), 800);
  };

  const submitForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setView("sent");
    }, 800);
  };

  if (view === "forgot") {
    return (
      <form onSubmit={submitForgot} className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => setView("login")}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to log in
        </button>

        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        <div className="flex flex-col gap-2">
          <Label htmlFor="forgot-email">Email</Label>
          <Input
            id="forgot-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="h-11 bg-background/60"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !/\S+@\S+\.\S+/.test(email)}
          className="h-11 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Send reset link
        </Button>
      </form>
    );
  }

  if (view === "sent") {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
          <MailCheck className="size-6" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Check your inbox</h2>
        <p className="text-sm text-muted-foreground">
          We sent a password reset link to{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => setView("login")}
          className="mt-2 h-11 w-full border-border/70 bg-transparent text-foreground hover:bg-white/5"
        >
          Back to log in
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submitLogin} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="login-email">Email</Label>
        <Input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="h-11 bg-background/60"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-password">Password</Label>
          <button
            type="button"
            onClick={() => setView("forgot")}
            className="text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            autoComplete="current-password"
            className="h-11 bg-background/60 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="h-11 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        Log in
      </Button>

      <AuthDivider />
      <SocialAuth action="Log in" />
    </form>
  );
}
