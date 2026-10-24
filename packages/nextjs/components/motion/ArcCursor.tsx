"use client";

import { useEffect, useRef } from "react";

type Pt = { x: number; y: number };

// jagged segment a→b, re-randomised every frame so it crackles
const jag = (a: Pt, b: Pt, n: number, amp: number) => {
  const pts: Pt[] = [a];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const o = (Math.random() - 0.5) * amp * Math.sin(Math.PI * t) * 2;
    pts.push({ x: a.x + dx * t + nx * o, y: a.y + dy * t + ny * o });
  }
  pts.push(b);
  return pts;
};

/**
 * Pointer life: a live filament trails the pointer, arcs to whatever control it hovers,
 * and discharges a burst of embers on press. Desktop pointers only.
 */
export const ArcCursor = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c || !window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const g = c.getContext("2d");
    if (!g) return;
    const dpr = Math.min(2, window.devicePixelRatio);
    const size = () => {
      c.width = innerWidth * dpr;
      c.height = innerHeight * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    const pos: Pt = { x: -100, y: -100 };
    const trail: Pt[] = [];
    let hot: Element | null = null;
    const bursts: { x: number; y: number; t: number }[] = [];
    let raf = 0;

    const move = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      hot = (e.target as Element).closest?.("a,button,input,select,[data-cursor]") ?? null;
    };
    const down = (e: PointerEvent) => bursts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    const line = (pts: Pt[], width: number, color: string) => {
      g.beginPath();
      pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)));
      g.lineWidth = width;
      g.strokeStyle = color;
      g.stroke();
    };

    const loop = () => {
      g.clearRect(0, 0, innerWidth, innerHeight);
      trail.push({ ...pos });
      if (trail.length > 9) trail.shift();
      g.shadowColor = "#5a17ff";
      g.shadowBlur = 10;
      g.lineCap = "round";

      const fil = trail.map((p, i) => ({
        x: p.x + (Math.random() - 0.5) * i * 0.8,
        y: p.y + (Math.random() - 0.5) * i * 0.8,
      }));
      line(fil, 1.8, "rgba(255,255,255,0.95)");
      g.beginPath();
      g.arc(pos.x, pos.y, 2.6, 0, Math.PI * 2);
      g.fillStyle = "#ffffff";
      g.fill();

      if (hot) {
        const r = hot.getBoundingClientRect();
        const inside = pos.x > r.left && pos.x < r.right && pos.y > r.top && pos.y < r.bottom;
        const target = inside
          ? {
              x: r.left + r.width / 2 + (Math.random() - 0.5) * r.width * 0.8,
              y: Math.random() > 0.5 ? r.top : r.bottom,
            }
          : { x: Math.max(r.left, Math.min(pos.x, r.right)), y: Math.max(r.top, Math.min(pos.y, r.bottom)) };
        if (Math.hypot(target.x - pos.x, target.y - pos.y) < 160)
          line(jag(pos, target, 7, 9), 1.2, "rgba(255,255,255,0.9)");
      }

      const now = performance.now();
      g.shadowColor = "#22072b";
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        const k = (now - b.t) / 280;
        if (k >= 1) {
          bursts.splice(i, 1);
          continue;
        }
        for (let r = 0; r < 7; r++) {
          const a = (r / 7) * Math.PI * 2 + b.t;
          const L = 14 + 34 * k;
          line(jag(b, { x: b.x + Math.cos(a) * L, y: b.y + Math.sin(a) * L }, 4, 7), 1.4, `rgba(90,23,255,${1 - k})`);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("resize", size);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[95] h-full w-full" />;
};
