"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ArrowLeft, MailCheck, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { SocialAuth, AuthDivider } from "@/components/auth/social-auth";
import {
  sendOtp,
  verifyOtp,
  completeRegistration,
  EmailRegisteredError,
} from "@/lib/api";
import { PASSWORD_RULES, isPasswordValid } from "@/lib/password";
import { cn } from "@/lib/utils";

const OTP_LENGTH = 6;

type Step = "details" | "otp" | "password" | "done";

export function SignupForm() {
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpId, setOtpId] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const detailsValid =
    name.trim().length > 1 && /\S+@\S+\.\S+/.test(email) && accepted;

  const passwordValid = isPasswordValid(password);
  const confirmValid = confirm.length > 0 && password === confirm;
  const canSubmitPassword = passwordValid && confirmValid;

  const submitDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailsValid || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await sendOtp(email.trim(), name.trim());
      setOtpId(res.otpId);
      setOtp("");
      setStep("otp");
    } catch (err) {
      setError(
        err instanceof EmailRegisteredError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH || loading) return;
    setError(null);
    setLoading(true);
    try {
      await verifyOtp(otpId, otp);
      // Code is valid; move on to set the password.
      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmitPassword || loading) return;
    setError(null);
    setLoading(true);
    try {
      await completeRegistration(otpId, otp, password);
      setStep("done");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Couldn't create your account.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    if (resending || loading) return;
    setError(null);
    setNotice(null);
    setResending(true);
    try {
      const res = await sendOtp(email.trim(), name.trim());
      setOtpId(res.otpId);
      setOtp("");
      setNotice("A new code has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't resend the code.");
    } finally {
      setResending(false);
    }
  };

  // --- Step: OTP ---
  if (step === "otp") {
    return (
      <form onSubmit={submitOtp} className="flex flex-col gap-6">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setNotice(null);
            setStep("details");
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
            onClick={resendCode}
            disabled={resending}
          >
            {resending ? "Resending…" : "Didn't get a code? Resend"}
          </button>
        </div>

        {notice && <p className="text-center text-sm text-primary">{notice}</p>}
        {error && <p className="text-center text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          disabled={otp.length !== OTP_LENGTH || loading}
          className="h-11 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Verify code
        </Button>
      </form>
    );
  }

  // --- Step: Set password ---
  if (step === "password") {
    return (
      <form onSubmit={submitPassword} className="flex flex-col gap-5">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setStep("otp");
          }}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>

        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-lg font-semibold text-foreground">Set your password</h2>
          <p className="text-sm text-muted-foreground">
            Choose a password to finish creating your account.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
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

        {/* Live password requirement checker */}
        <ul className="flex flex-col gap-1.5 rounded-md border border-border/60 bg-background/40 p-3">
          {PASSWORD_RULES.map((rule) => {
            const ok = rule.test(password);
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
          disabled={!canSubmitPassword || loading}
          className="h-11 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Create account
        </Button>
      </form>
    );
  }

  // --- Step: Done ---
  if (step === "done") {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
          <MailCheck className="size-6" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">You&apos;re all set</h2>
        <p className="text-sm text-muted-foreground">
          Your GoPort account is ready. Welcome aboard, {name.split(" ")[0]}.
        </p>
        <Button
          asChild
          className="mt-2 h-11 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Link href="/login">Continue to log in</Link>
        </Button>
      </div>
    );
  }

  // --- Step: Details (name + email) ---
  return (
    <form onSubmit={submitDetails} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ada Lovelace"
          autoComplete="name"
          className="h-11 bg-background/60"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="h-11 bg-background/60"
          required
        />
      </div>

      <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted-foreground">
        <Checkbox
          checked={accepted}
          onCheckedChange={(v) => setAccepted(v === true)}
          className="mt-0.5"
        />
        <span>
          I accept the{" "}
          <a href="#" className="text-primary underline-offset-2 hover:underline">
            Terms of Service
          </a>
        </span>
      </label>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={!detailsValid || loading}
        className="h-11 w-full bg-primary font-medium text-primary-foreground hover:bg-primary/90"
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        Next
      </Button>

      <AuthDivider />
      <SocialAuth action="Sign up" />
    </form>
  );
}
