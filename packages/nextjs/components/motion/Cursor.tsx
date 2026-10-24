"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/** Ink dot + volt ring that swells over interactive elements. Desktop pointers only. */
export const Cursor = () => {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const d = dot.current!;
    const r = ring.current!;
    gsap.set([d, r], { xPercent: -50, yPercent: -50 });
    const dx = gsap.quickTo(d, "x", { duration: 0.08 });
    const dy = gsap.quickTo(d, "y", { duration: 0.08 });
    const rx = gsap.quickTo(r, "x", { duration: 0.45, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.45, ease: "power3" });
    const move = (e: PointerEvent) => {
      gsap.set([d, r], { opacity: 1 });
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
      const hot = (e.target as HTMLElement).closest("a,button,[data-cursor]");
      gsap.to(r, {
        scale: hot ? 1.9 : 1,
        backgroundColor: hot ? "rgba(217,255,61,.55)" : "rgba(0,0,0,0)",
        duration: 0.3,
      });
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <>
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] h-9 w-9 rounded-full border opacity-0"
        style={{ borderColor: "var(--ink)" }}
      />
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 rounded-full opacity-0"
        style={{ background: "var(--ink)" }}
      />
    </>
  );
};
