"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive dark-mode background:
 *  - a dotted grid + soft ambient glows (static, decorative)
 *  - a spotlight that follows the cursor
 *  - a thin layer of drifting particles that gently lean toward the cursor
 *
 * Everything is purely decorative and respects prefers-reduced-motion.
 */
export function PageBackground() {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Cursor-following spotlight (cheap, no re-render).
  useEffect(() => {
    const el = spotlightRef.current;
    if (!el) return;

    let raf = 0;
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight * 0.3;
    let x = targetX;
    let y = targetY;

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const tick = () => {
      x += (targetX - x) * 0.08;
      y += (targetY - y) * 0.08;
      el.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Particle field that reacts to the cursor.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const COUNT = Math.min(70, Math.floor((width * height) / 26000));
    const mouse = { x: width / 2, y: height / 2, active: false };

    type P = { x: number; y: number; vx: number; vy: number; r: number };
    const particles: P[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.6,
    }));

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
    };

    const LINK_DIST = 130;
    const MOUSE_DIST = 200;

    let raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        // drift
        p.x += p.vx;
        p.y += p.vy;

        // gentle pull toward cursor
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MOUSE_DIST && dist > 0.01) {
            const force = (1 - dist / MOUSE_DIST) * 0.4;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        // wrap around edges
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(110, 231, 183, 0.5)";
        ctx.fill();
      }

      // link nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(52, 211, 153, ${0.12 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // link to cursor
        if (mouse.active) {
          const a = particles[i];
          const dx = a.x - mouse.x;
          const dy = a.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MOUSE_DIST) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(52, 211, 153, ${0.18 * (1 - dist / MOUSE_DIST)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    if (!reduce) {
      window.addEventListener("resize", onResize);
      window.addEventListener("mousemove", onMove, { passive: true });
      window.addEventListener("mouseleave", onLeave);
      raf = requestAnimationFrame(draw);
    } else {
      // still render a single static frame of dots
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(110, 231, 183, 0.4)";
        ctx.fill();
      }
    }

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base */}
      <div className="absolute inset-0 bg-background" />

      {/* dotted grid */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(circle, var(--border) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 70% at 50% 0%, black 30%, transparent 100%)",
        }}
      />

      {/* interactive particle field */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* ambient glows */}
      <div className="absolute left-1/2 top-[-15%] h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />
      <div className="absolute right-[-10%] top-[40%] h-[400px] w-[500px] rounded-full bg-emerald-500/5 blur-[160px]" />

      {/* cursor spotlight */}
      <div
        ref={spotlightRef}
        className="absolute left-0 top-0 h-[420px] w-[420px] rounded-full will-change-transform"
        style={{
          marginLeft: "-210px",
          marginTop: "-210px",
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--primary) 14%, transparent) 0%, transparent 65%)",
        }}
      />
    </div>
  );
}
