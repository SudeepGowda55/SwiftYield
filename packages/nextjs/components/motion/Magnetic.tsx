"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/** Pulls its single child toward the pointer and drops a ripple on press. */
export const Magnetic = ({ children, strength = 0.3 }: { children: React.ReactNode; strength?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "elastic.out(1, 0.4)" });
    const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "elastic.out(1, 0.4)" });
    const move = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      x((e.clientX - b.left - b.width / 2) * strength);
      y((e.clientY - b.top - b.height / 2) * strength);
    };
    const leave = () => {
      x(0);
      y(0);
    };
    const down = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      const s = document.createElement("span");
      const size = Math.max(b.width, b.height) * 2.2;
      s.className = "ripple";
      Object.assign(s.style, {
        left: `${e.clientX - b.left}px`,
        top: `${e.clientY - b.top}px`,
        width: `${size}px`,
        height: `${size}px`,
      });
      (el.firstElementChild ?? el).appendChild(s);
      setTimeout(() => s.remove(), 650);
    };
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
