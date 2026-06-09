"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GoPortLogo } from "@/components/goport-logo";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      setScrolled(y > 12);

      // The navbar only lives at the very top of the page. The moment you
      // leave the top it hides and stays hidden — small upward scrolls no
      // longer flash it back in. Scroll back to the top to bring it back.
      setHidden(y >= 80);

      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        hidden ? "-translate-y-full" : "translate-y-0",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6 pt-3 sm:h-24 sm:pt-4">
        <Link href="/" className="flex items-center transition-opacity hover:opacity-80">
          <GoPortLogo className="h-7 w-auto text-foreground" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="relative text-sm text-muted-foreground transition-colors hover:text-foreground after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            className="text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            <Link href="/login">Log in</Link>
          </Button>
          <Button
            asChild
            className="bg-primary text-primary-foreground shadow-[0_0_24px_-6px] shadow-primary/50 transition-all hover:bg-primary/90 hover:shadow-primary/70"
          >
            <Link href="/signup">Sign up</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
