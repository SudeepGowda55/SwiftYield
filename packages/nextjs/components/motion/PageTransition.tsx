"use client";

import { AnchorHTMLAttributes, createContext, useCallback, useContext, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

const LABELS: Record<string, string> = {
  "/": "The strike",
  "/how-it-works": "Mechanism",
  "/authenticate": "Verify",
  "/arbitrage/base-tenderly": "Deploy",
};

// a forked bolt from the click point down to the bottom edge, as an SVG path
const boltPath = (x: number, y: number, w: number, h: number) => {
  const end = Math.max(40, Math.min(w - 40, x + (Math.random() - 0.5) * w * 0.4));
  const steps = 14;
  let d = `M${x},${y}`;
  let fork = "";
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const px = x + (end - x) * t + (i < steps ? (Math.random() - 0.5) * 90 : 0);
    const py = y + (h - y) * t;
    d += ` L${px.toFixed(1)},${py.toFixed(1)}`;
    if (i === 5 || i === 9) {
      const fx = px + (Math.random() > 0.5 ? 1 : -1) * (60 + Math.random() * 90);
      fork += ` M${px.toFixed(1)},${py.toFixed(1)} L${((px + fx) / 2 + (Math.random() - 0.5) * 30).toFixed(1)},${(
        py + 50
      ).toFixed(1)} L${fx.toFixed(1)},${(py + 110).toFixed(1)}`;
    }
  }
  return d + fork;
};

const Ctx = createContext<(href: string, x?: number, y?: number) => void>(() => undefined);

/** Route change as a lightning strike: the bolt draws from the click, the screen flashes, the new page is lit. */
export const PageTransitionProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const root = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const pending = useRef(false);

  const go = useCallback(
    (href: string, x = innerWidth / 2, y = 0) => {
      if (href === pathname || pending.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return router.push(href);
      pending.current = true;
      const w = innerWidth;
      const h = innerHeight;
      svg.current!.setAttribute("viewBox", `0 0 ${w} ${h}`);
      path.current!.setAttribute("d", boltPath(x, y, w, h));
      const len = path.current!.getTotalLength();
      label.current!.textContent = LABELS[href] ?? "Next";
      gsap
        .timeline()
        .set(root.current, { display: "block" })
        .set(svg.current, { opacity: 1 })
        .set(flash.current, { opacity: 0 })
        .fromTo(
          path.current,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 0.2, ease: "power2.in" },
        )
        .set(flash.current, { opacity: 1 })
        .set(flash.current, { opacity: 0.25 }, "+=0.05")
        .set(flash.current, { opacity: 1 }, "+=0.06")
        .add(() => router.push(href), "+=0.12");
    },
    [pathname, router],
  );

  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    gsap
      .timeline({ delay: 0.15 })
      .to(svg.current, { opacity: 0, duration: 0.2 }, 0)
      .to(flash.current, { opacity: 0, duration: 0.7, ease: "power2.out" }, 0)
      .set(root.current, { display: "none" });
  }, [pathname]);

  return (
    <Ctx.Provider value={go}>
      {children}
      <div ref={root} aria-hidden className="pointer-events-none fixed inset-0 z-[90] hidden">
        <div ref={flash} className="absolute inset-0 flex items-end p-6 sm:p-12" style={{ background: "var(--cream)" }}>
          <span
            ref={label}
            className="font-display text-7xl sm:text-[10rem] font-extrabold leading-none text-[var(--ink)]"
          />
        </div>
        <svg ref={svg} className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          <path
            ref={path}
            fill="none"
            stroke="#5a17ff"
            strokeWidth="3"
            strokeLinejoin="bevel"
            style={{ filter: "drop-shadow(0 0 8px #5a17ff)" }}
          />
        </svg>
      </div>
    </Ctx.Provider>
  );
};

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export const TransitionLink = ({ href, onClick, children, ...rest }: Props) => {
  const go = useContext(Ctx);
  return (
    <Link
      href={href}
      {...rest}
      onClick={e => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || href.startsWith("http")) return;
        e.preventDefault();
        go(href, e.clientX || undefined, e.clientY || undefined);
      }}
    >
      {children}
    </Link>
  );
};
