"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Staggers direct children up into place as the block enters the viewport. */
export const Reveal = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(ref.current!.children, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
      });
    });
    return () => ctx.revert();
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};
