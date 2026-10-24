"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/** Pulls its child toward the pointer like a charged plate; the press discharge is drawn by ArcCursor. */
export const Magnetic = ({ children, strength = 0.28 }: { children: React.ReactNode; strength?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const x = gsap.quickTo(el, "x", { duration: 0.35, ease: "power4.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.35, ease: "power4.out" });
    const move = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      x((e.clientX - b.left - b.width / 2) * strength);
      y((e.clientY - b.top - b.height / 2) * strength);
    };
    const leave = () => {
      x(0);
      y(0);
    };
    const down = () => gsap.fromTo(el, { scale: 0.94 }, { scale: 1, duration: 0.4, ease: "elastic.out(1.2, 0.35)" });
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerdown", down);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerdown", down);
    };
  }, [strength]);

  return (
    <span ref={ref} className="inline-block">
      {children}
    </span>
  );
};
