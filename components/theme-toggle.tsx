"use client";

import { Moon, Sun } from "lucide-react";
import { useGoPortTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useGoPortTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      className="group relative flex size-9 items-center justify-center rounded-full border border-border bg-card/70 text-muted-foreground shadow-sm transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {isDark ? <Sun className="size-4 transition-transform group-hover:rotate-12" /> : <Moon className="size-4 transition-transform group-hover:-rotate-12" />}
    </button>
  );
}
