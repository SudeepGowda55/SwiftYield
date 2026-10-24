"use client";

import { ElementType, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Props = { text: string; as?: ElementType; className?: string; delay?: number; accent?: string[] };

/** Word-mask headline reveal; words listed in `accent` get the volt highlight. */
export const SplitHeading = ({ text, as: Tag = "h2", className = "", delay = 0, accent = [] }: Props) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const words = ref.current?.querySelectorAll(".word-mask > span");
    if (!words?.length) return;
    const ctx = gsap.context(() => {
      gsap.from(words, {
        yPercent: 115,
        rotate: 4,
        duration: 0.9,
        ease: "expo.out",
        stagger: 0.06,
        delay,
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
      });
    });
    return () => ctx.revert();
  }, [delay]);

  const parts = text.split(" ");
  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {parts.map((w, i) => (
        <span key={i} aria-hidden>
          <span className="word-mask">
            <span className={accent.includes(w) ? "px-[0.12em] -mx-[0.06em] bg-[var(--volt)]" : undefined}>{w}</span>
          </span>
          {i < parts.length - 1 && " "}
        </span>
      ))}
    </Tag>
  );
};
