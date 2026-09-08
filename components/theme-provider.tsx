"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useMemo } from "react";

export type Theme = "light" | "dark";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="goport-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

export function useGoPortTheme() {
  const { theme, setTheme } = useTheme();

  return useMemo(
    () => ({
      // `next-themes` is undefined only before client hydration. Dark matches
      // the server default and keeps the toggle interactive without a flash.
      theme: (theme === "light" ? "light" : "dark") as Theme,
      setTheme: (nextTheme: Theme) => setTheme(nextTheme),
    }),
    [theme, setTheme],
  );
}
