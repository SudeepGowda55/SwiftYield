"use client";

import { ElementType, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Props = { text: string; as?: ElementType; className?: string; delay?: number; hot?: string[] };

/** Headline whose letters strike on like a lamp catching current: flash, drop, hold, with a cooling glow. */
export const Flicker = ({ text, as: Tag = "h2", className = "", delay = 0, hot = [] }: Props) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const chars = Array.from(el.querySelectorAll<HTMLElement>(".flicker-char"));
    const ctx = gsap.context(() => {
      gsap.set(chars, { opacity: 0 });
      const tl = gsap.timeline({ delay, scrollTrigger: { trigger: el, start: "top 90%", once: true } });
      chars.forEach(c => {
        const t = Math.random() * 0.75;
        tl.set(c, { opacity: 1, textShadow: "0 0 26px rgba(255,243,226,1)" }, t)
          .set(c, { opacity: 0.12 }, t + 0.05)
          .set(c, { opacity: 1 }, t + 0.09 + Math.random() * 0.12)
          .to(c, { textShadow: "0 0 0px rgba(255,243,226,0)", duration: 0.7, ease: "power2.out" }, t + 0.2);
      });
    }, el);
    return () => ctx.revert();
  }, [delay]);

  const words = text.split(" ");
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden>
          <span
            className="inline-block whitespace-nowrap"
            style={hot.includes(w) ? { color: "var(--spark)" } : undefined}
          >
            {Array.from(w).map((ch, j) => (
              <span key={j} className="flicker-char">
                {ch}
              </span>
            ))}
          </span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
};
