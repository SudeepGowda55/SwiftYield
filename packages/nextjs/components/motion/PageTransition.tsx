"use client";

import { AnchorHTMLAttributes, createContext, useCallback, useContext, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";

const LABELS: Record<string, string> = {
  "/": "Loop",
  "/how-it-works": "Mechanism",
  "/authenticate": "Verify",
  "/arbitrage/base-tenderly": "Deploy",
};

const Ctx = createContext<(href: string) => void>(() => undefined);

/**
 * Curtain transition: a volt panel wipes up like a block being sealed, the route changes
 * underneath, then the panel wipes away.
 */
export const PageTransitionProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const curtain = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const pending = useRef(false);

  const go = useCallback(
    (href: string) => {
      if (href === pathname || pending.current) return;
      const el = curtain.current;
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return router.push(href);
      pending.current = true;
      if (label.current) label.current.textContent = LABELS[href] ?? "Next block";
      gsap
        .timeline()
        .set(el, { display: "flex", yPercent: 100 })
        .to(el, { yPercent: 0, duration: 0.55, ease: "expo.inOut" })
        .fromTo(label.current, { yPercent: 100 }, { yPercent: 0, duration: 0.4, ease: "expo.out" }, "-=0.2")
        .add(() => router.push(href));
    },
    [pathname, router],
  );

  useEffect(() => {
    const el = curtain.current;
    if (!pending.current || !el) return;
    pending.current = false;
    gsap
      .timeline()
      .to(label.current, { yPercent: -100, duration: 0.3, ease: "expo.in", delay: 0.1 })
      .to(el, { yPercent: -100, duration: 0.65, ease: "expo.inOut" })
      .set(el, { display: "none" });
  }, [pathname]);

  return (
    <Ctx.Provider value={go}>
      {children}
      <div
        ref={curtain}
        aria-hidden
        className="fixed inset-0 z-[90] hidden flex-col items-start justify-end p-6 sm:p-12"
        style={{ background: "var(--volt)", color: "var(--ink)" }}
      >
        <span className="label !text-[var(--ink)]">Sealing block · routing to</span>
        <span className="overflow-hidden">
          <span ref={label} className="font-display block text-6xl sm:text-9xl font-bold">
            Loop
          </span>
        </span>
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
        go(href);
      }}
    >
      {children}
    </Link>
  );
};
