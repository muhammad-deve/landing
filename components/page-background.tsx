"use client";

import { useEffect, useRef } from "react";

/**
 * Minimal, cursor-reactive dot grid with a gravity well.
 *
 * Each dot has a fixed "home" position on a grid. The cursor acts as a
 * gravity point: nearby dots are pulled toward it (and brighten green),
 * then spring back to home when the cursor moves away.
 *
 * Performance: a single rAF loop runs only while dots are still settling or
 * the cursor is active; it idles out once everything is at rest. It's a
 * FIXED, pointer-events-none layer behind content (-z-10), so it can never
 * block clicks or affect hydration.
 */
export function PageBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const GAP = 22; // grid spacing (smaller = more dots)
    const RADIUS = 160; // cursor influence radius
    const PULL = 0.32; // how strongly dots are pulled toward the cursor
    const EASE = 0.12; // how quickly dots move toward their target
    const SPRING = 0.12; // how quickly dots return home
    const GLOW = "74, 222, 128"; // GoPort green rgb

    type Dot = { hx: number; hy: number; x: number; y: number };
    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let dpr = 1;
    const mouse = { x: -9999, y: -9999, active: false };
    let raf = 0;

    // How strongly the cursor interaction shows, based on scroll position.
    // 1 at the very top (hero) and eases toward ~0 by the time you reach the
    // bottom (FAQ), so the hover effect is barely noticeable down there.
    let influence = 1;

    const computeInfluence = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      // ease-out: stays lively near the top, fades quickly lower down.
      const eased = Math.pow(1 - Math.min(Math.max(progress, 0), 1), 1.6);
      influence = eased;
    };

    const buildGrid = () => {
      dots = [];
      for (let x = GAP; x < width; x += GAP) {
        for (let y = GAP; y < height; y += GAP) {
          dots.push({ hx: x, hy: y, x, y });
        }
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
      renderStatic();
    };

    // One static frame (used for reduced-motion or when at rest).
    const renderStatic = () => {
      ctx.clearRect(0, 0, width, height);
      for (const d of dots) {
        ctx.beginPath();
        ctx.arc(d.hx, d.hy, 1, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(148, 163, 184, 0.10)";
        ctx.fill();
      }
    };

    const step = () => {
      ctx.clearRect(0, 0, width, height);
      let moving = false;

      for (const d of dots) {
        let tx = d.hx;
        let ty = d.hy;
        let lit = 0;

        if (mouse.active) {
          const dx = mouse.x - d.hx;
          const dy = mouse.y - d.hy;
          const dist = Math.hypot(dx, dy);
          if (dist < RADIUS) {
            const t = (1 - dist / RADIUS) * influence; // 0..1, faded by scroll
            lit = t;
            // pull the dot's target toward the cursor (gravity)
            tx = d.hx + dx * PULL * t;
            ty = d.hy + dy * PULL * t;
          }
        }

        // ease current position toward target (or spring home)
        const k = lit > 0 ? EASE : SPRING;
        d.x += (tx - d.x) * k;
        d.y += (ty - d.y) * k;

        if (Math.abs(tx - d.x) > 0.05 || Math.abs(ty - d.y) > 0.05) moving = true;

        const alpha = 0.1 + lit * 0.75;
        const r = 1 + lit * 1.8;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fillStyle = lit > 0 ? `rgba(${GLOW}, ${alpha})` : "rgba(148, 163, 184, 0.10)";
        ctx.fill();
      }

      // keep animating while the cursor is active or dots are still settling
      if (mouse.active || moving) {
        raf = requestAnimationFrame(step);
      } else {
        raf = 0;
        renderStatic();
      }
    };

    const ensureLoop = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      if (!reduce) ensureLoop();
    };

    const onLeave = () => {
      mouse.active = false;
      if (!reduce) ensureLoop();
    };

    const onScroll = () => {
      computeInfluence();
      if (!reduce && mouse.active) ensureLoop();
    };

    computeInfluence();
    resize();
    window.addEventListener("resize", resize);
    if (!reduce) {
      window.addEventListener("mousemove", onMove, { passive: true });
      document.addEventListener("mouseleave", onLeave);
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#070b10]"
    >
      {/* interactive gravity dot grid */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* soft ambient glow at the top */}
      <div className="absolute left-1/2 top-[-20%] h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-primary/8 blur-[130px]" />

      {/* gentle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 100% at 50% 35%, transparent 55%, #070b10 95%)",
        }}
      />
    </div>
  );
}
