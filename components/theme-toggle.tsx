"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useGoPortTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useGoPortTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // The saved theme is read before React hydrates. Keep this first render
  // identical to SSR, then show the actual saved theme after mounting.
  const isDark = !mounted || theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Toggle theme"}
      className="group relative flex size-9 items-center justify-center rounded-full border border-border bg-card/70 text-muted-foreground shadow-sm transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {isDark ? <Sun className="size-4 transition-transform group-hover:rotate-12" /> : <Moon className="size-4 transition-transform group-hover:-rotate-12" />}
    </button>
  );
}
