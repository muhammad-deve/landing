"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GoPortLogo } from "@/components/goport-logo";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "#product", label: "Product" },
  { href: "#integrations", label: "Use cases" },
  { href: "#pricing", label: "Pricing" },
  { href: "#docs", label: "Docs" },
  { href: "#quickstart", label: "Quickstart" },
  { href: "#faq", label: "FAQ" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 12);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300", scrolled ? "border-border/90 bg-background/90 backdrop-blur-xl" : "border-transparent bg-background/55 backdrop-blur-md")}>
      <nav className="mx-auto flex h-[4.5rem] w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-7">
        <Link href="/" className="flex shrink-0 items-center transition-opacity hover:opacity-70" aria-label="GoPort home">
          <GoPortLogo className="h-7 w-auto text-foreground" />
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" className="hidden text-muted-foreground hover:bg-secondary hover:text-foreground sm:inline-flex"><Link href="/login">Log in</Link></Button>
          <Button asChild className="h-9 rounded-full bg-primary px-4 text-primary-foreground shadow-none hover:bg-primary/90"><a href="#quickstart">Download</a></Button>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="mobile-navigation" aria-label="Toggle navigation" className="flex size-9 items-center justify-center rounded-full border border-border bg-card/70 text-foreground lg:hidden">
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-navigation" className="border-t border-border bg-background/95 px-5 py-5 backdrop-blur-xl lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-secondary">
                {link.label}
              </a>
            ))}
            <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-secondary sm:hidden">Log in</Link>
          </div>
        </div>
      )}
    </header>
  );
}
