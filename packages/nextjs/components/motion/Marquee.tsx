"use client";

import { useEffect, useRef } from "react";

/** Endless ticker whose speed and direction follow scroll velocity. */
export const Marquee = ({ items }: { items: string[] }) => {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0;
    let lastY = window.scrollY;
    let boost = 0;
    let raf = 0;
    const loop = () => {
      const y = window.scrollY;
      boost += ((y - lastY) * 0.6 - boost) * 0.12;
      lastY = y;
      x -= 0.6 + Math.abs(boost);
      const half = el.scrollWidth / 2;
      if (-x >= half) x += half;
      el.style.transform = `translate3d(${x}px,0,0) skewX(${Math.max(-12, Math.min(12, -boost * 0.4))}deg)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const row = items.map((t, i) => (
    <span key={i} className="flex items-center gap-8 pr-8">
      <span>{t}</span>
      <span
        aria-hidden
        className="inline-block h-3 w-3 rotate-45"
        style={{ background: "var(--volt)", outline: "1px solid var(--ink)" }}
      />
    </span>
  ));

  return (
    <div className="overflow-hidden border-y rule py-5" style={{ background: "var(--ink)", color: "var(--paper)" }}>
      <div
        ref={track}
        className="flex w-max whitespace-nowrap font-display text-3xl sm:text-5xl font-semibold will-change-transform"
      >
        {row}
        {row}
      </div>
    </div>
  );
};
