"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");

  const setTheme = useCallback((nextTheme: Theme) => {
    const root = document.documentElement;
    root.classList.toggle("dark", nextTheme === "dark");
    root.classList.toggle("light", nextTheme === "light");
    root.style.colorScheme = nextTheme;
    try {
      window.localStorage.setItem("goport-theme", nextTheme);
    } catch {
      // Theme still works when storage is unavailable.
    }
    setThemeState(nextTheme);
  }, []);

  useEffect(() => {
    let savedTheme: string | null = null;
    try {
      savedTheme = window.localStorage.getItem("goport-theme");
    } catch {
      savedTheme = null;
    }
    if (savedTheme === "light") {
      setTheme("light");
      return;
    }
    setTheme("dark");
  }, [setTheme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useGoPortTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useGoPortTheme must be used inside ThemeProvider");
  return context;
}
