"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ArrowLeft, MailCheck, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SocialAuth, AuthDivider } from "@/components/auth/social-auth";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  login,
  forgotPassword,
  resetPassword,
  startGoogleOAuth,
  storeAuthSession,
} from "@/lib/api";
import { PASSWORD_RULES, isPasswordValid } from "@/lib/password";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;

type View = "login" | "forgot" | "reset-otp" | "reset-password" | "reset-done";

export function LoginForm() {
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Reset-flow state
  const [otp, setOtp] = useState("");
  const [otpId, setOtpId] = useState("");
  const [resending, setResending] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const passwordValid = isPasswordValid(newPassword);
  const confirmValid = confirm.length > 0 && newPassword === confirm;
  const canSubmitNewPassword = passwordValid && confirmValid;

  const submitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const auth = await login(email.trim(), password);
      storeAuthSession(auth);
      // Auth succeeded; send the user to their dashboard.
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const submitGoogle = async () => {
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      await startGoogleOAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start Google sign-in.");
      setLoading(false);
    }
  };

  const submitForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      setOtpId(res.otpId);
      setOtp("");
      setView("reset-otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const submitResetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) return;
    // The code is validated server-side when the new password is submitted.
    setError(null);
    setView("reset-password");
  };

  const submitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitNewPassword || loading) return;
    setError(null);
    setLoading(true);
    try {
      await resetPassword(otpId, otp, newPassword);
      setView("reset-done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't reset your password.");
      // A bad/expired code surfaces here; let the user re-enter it.
      setView("reset-otp");
    } finally {
      setLoading(false);
    }
  };

  const resendResetCode = async () => {
    if (resending || loading) return;
    setError(null);
    setNotice(null);
    setResending(true);
    try {
      const res = await forgotPassword(email.trim());
      setOtpId(res.otpId);
      setOtp("");
      setNotice("A new code has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't resend the code.");
    } finally {
      setResending(false);
    }
  };

  // --- Forgot: enter email ---
  if (view === "forgot") {
    return (
      <form onSubmit={submitForgot} className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setView("login");
          }}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to log in
        </button>

        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a code to reset your password.
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

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          disabled={loading || !/\S+@\S+\.\S+/.test(email)}
          className="h-11 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Send reset code
        </Button>
      </form>
    );
  }

  // --- Forgot: enter OTP ---
  if (view === "reset-otp") {
    return (
      <form onSubmit={submitResetOtp} className="flex flex-col gap-6">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setNotice(null);
            setView("forgot");
          }}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
            <MailCheck className="size-5" />
          </div>
          <p className="text-sm text-muted-foreground">
            We sent a {OTP_LENGTH}-digit code to
            <br />
            <span className="font-medium text-foreground">{email}</span>
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <InputOTP
            maxLength={OTP_LENGTH}
            value={otp}
            onChange={setOtp}
            containerClassName="justify-center"
          >
            <InputOTPGroup className="gap-2">
              {Array.from({ length: OTP_LENGTH }, (_, i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="size-12 rounded-md border-border/70 text-lg first:rounded-l-md last:rounded-r-md"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <button
            type="button"
            className="text-xs text-muted-foreground transition-colors hover:text-primary disabled:opacity-50"
            onClick={resendResetCode}
            disabled={resending}
          >
            {resending ? "Resending…" : "Didn't get a code? Resend"}
          </button>
        </div>

        {notice && <p className="text-center text-sm text-primary">{notice}</p>}
        {error && <p className="text-center text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          disabled={otp.length !== OTP_LENGTH}
          className="h-11 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
        >
          Continue
        </Button>
      </form>
    );
  }

  // --- Forgot: set new password ---
  if (view === "reset-password") {
    return (
      <form onSubmit={submitNewPassword} className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setView("reset-otp");
          }}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-lg font-semibold text-foreground">Set a new password</h2>
          <p className="text-sm text-muted-foreground">
            Choose a new password for your account.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="new-password">New password</Label>
          <div className="relative">
            <Input
              id="new-password"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Create a password"
              autoComplete="new-password"
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

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            type={showPassword ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-enter your password"
            autoComplete="new-password"
            className="h-11 bg-background/60"
            required
          />
          {confirm.length > 0 && !confirmValid && (
            <p className="text-xs text-destructive">Passwords don&apos;t match</p>
          )}
        </div>

        <ul className="flex flex-col gap-1.5 rounded-md border border-border/60 bg-background/40 p-3">
          {PASSWORD_RULES.map((rule) => {
            const ok = rule.test(newPassword);
            return (
              <li
                key={rule.id}
                className={cn(
                  "flex items-center gap-2 text-xs transition-colors",
                  ok ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded-full",
                    ok ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  {ok ? <Check className="size-3" /> : <X className="size-3" />}
                </span>
                {rule.label}
              </li>
            );
          })}
        </ul>

        {error && <p className="text-center text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          disabled={!canSubmitNewPassword || loading}
          className="h-11 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Reset password
        </Button>
      </form>
    );
  }

  // --- Forgot: done ---
  if (view === "reset-done") {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
          <MailCheck className="size-6" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Password updated</h2>
        <p className="text-sm text-muted-foreground">
          You can now log in with your new password.
        </p>
        <Button
          type="button"
          onClick={() => {
            setPassword("");
            setNewPassword("");
            setConfirm("");
            setOtp("");
            setError(null);
            setNotice(null);
            setView("login");
          }}
          className="mt-2 h-11 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
        >
          Back to log in
        </Button>
      </div>
    );
  }

  // --- Login ---
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
            onClick={() => {
              setError(null);
              setView("forgot");
            }}
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

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={loading}
        className="h-11 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        Log in
      </Button>

      <AuthDivider />
      <SocialAuth action="Log in" onGoogle={submitGoogle} disabled={loading} />
    </form>
  );
}
