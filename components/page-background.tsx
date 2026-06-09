"use client";

import { useEffect, useRef } from "react";

/**
 * Minimal, cursor-reactive dot grid rendered on a canvas.
 *
 * Each dot is drawn at a fixed grid position; its brightness/size is a
 * function of its distance to the cursor, so dots clearly "light up" green
 * as the pointer passes over them and fade back to a faint neutral otherwise.
 *
 * Performance: the grid only redraws on pointer movement (rAF-throttled) and
 * on resize — there is no idle animation loop. It's a FIXED,
 * pointer-events-none layer behind content (-z-10), so it can never block
 * clicks or affect hydration.
 */
export function PageBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const GAP = 30; // grid spacing in px
    const RADIUS = 130; // cursor influence radius
    const BASE = "rgba(148, 163, 184, 0.10)"; // faint idle dot
    // GoPort green (oklch 0.85 0.2 155) ≈ this rgb
    const GLOW_R = 74;
    const GLOW_G = 222;
    const GLOW_B = 128;

    let width = 0;
    let height = 0;
    let dpr = 1;
    // start off-screen so nothing is lit until the user moves
    const mouse = { x: -9999, y: -9999 };
    let raf = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let x = GAP; x < width; x += GAP) {
        for (let y = GAP; y < height; y += GAP) {
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < RADIUS) {
            const t = 1 - dist / RADIUS; // 0..1, brighter near cursor
            const alpha = 0.12 + t * 0.7;
            const r = 1 + t * 1.6;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${GLOW_R}, ${GLOW_G}, ${GLOW_B}, ${alpha})`;
            ctx.fill();
          } else {
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fillStyle = BASE;
            ctx.fill();
          }
        }
      }
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        draw();
        raf = 0;
      });
    };

    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      draw();
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#070b10]"
    >
      {/* interactive dot grid */}
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
