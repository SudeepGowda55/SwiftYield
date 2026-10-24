"use client";

import React, { useCallback, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { TransitionLink } from "~~/components/motion/PageTransition";
import { FaucetButton } from "~~/components/scaffold-eth";
import { NAV, SITE } from "~~/components/site";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

export const Bolt = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden>
    <path
      d="M13.5 2 4 13.5h6.5L9 22l11-12.5h-6.8z"
      fill="var(--volt)"
      stroke="var(--ink)"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

const GitHubButton = () => (
  <a
    href={SITE.repo}
    target="_blank"
    rel="noreferrer"
    aria-label="GitHub repository"
    className="grid h-10 w-10 shrink-0 place-items-center rounded-full border rule text-[var(--ink-2)] transition-colors hover:text-[var(--ink)] hover:bg-[var(--volt)]"
  >
    <svg viewBox="0 0 16 16" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  </a>
);

/**
 * Site header
 */
export const Header = () => {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  const links = NAV.map(({ label, href }, i) => {
    const active = pathname === href;
    return (
      <li key={href}>
        <TransitionLink
          href={href}
          onClick={() => setIsDrawerOpen(false)}
          className={`group flex items-baseline gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs uppercase tracking-[0.14em] transition-colors ${
            active ? "bg-[var(--ink)] text-[var(--paper)]" : "hover:bg-[var(--volt)]"
          }`}
        >
          <span className="opacity-50">0{i + 1}</span>
          {label}
        </TransitionLink>
      </li>
    );
  });

  return (
    <header className="sticky top-0 z-40 border-b rule bg-[var(--bone)]">
      <div className="wrap flex h-16 items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="lg:hidden relative" ref={burgerMenuRef}>
            <button
              aria-label={isDrawerOpen ? "Close menu" : "Open menu"}
              aria-expanded={isDrawerOpen}
              className="grid h-10 w-10 place-items-center rounded-full border rule"
              onClick={() => setIsDrawerOpen(o => !o)}
            >
              {isDrawerOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
            </button>
            {isDrawerOpen && (
              <ul className="absolute left-0 top-12 flex w-56 flex-col gap-1 rounded-2xl border rule bg-[var(--paper)] p-2 shadow-xl">
                {links}
              </ul>
            )}
          </div>
          <TransitionLink href="/" className="flex items-center gap-2" aria-label="SwiftYield home">
            <Bolt className="h-7 w-7" />
            <span className="font-display text-lg font-bold hidden sm:inline">SwiftYield</span>
          </TransitionLink>
        </div>
        <ul className="hidden lg:flex items-center gap-1">{links}</ul>
        <div className="flex items-center gap-2">
          <ConnectButton
            chainStatus={{ smallScreen: "none", largeScreen: "icon" }}
            showBalance={false}
            accountStatus={{ smallScreen: "avatar", largeScreen: "address" }}
          />
          <FaucetButton />
          <GitHubButton />
        </div>
      </div>
    </header>
  );
};
