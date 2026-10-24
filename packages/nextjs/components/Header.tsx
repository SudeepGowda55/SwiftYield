"use client";

import React, { useCallback, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { Bars2Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { TransitionLink } from "~~/components/motion/PageTransition";
import { FaucetButton } from "~~/components/scaffold-eth";
import { NAV, SITE } from "~~/components/site";
import { useOutsideClick } from "~~/hooks/scaffold-eth";

export const Bolt = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden>
    <path d="M18 2 6 18h8l-3 12 15-18h-9z" fill="var(--ink)" />
    <circle cx="25" cy="25" r="3" fill="var(--spark)" />
  </svg>
);

const GitHubButton = () => (
  <a
    href={SITE.repo}
    target="_blank"
    rel="noreferrer"
    aria-label="GitHub repository"
    className="grid h-10 w-10 shrink-0 place-items-center rounded-full border wire text-[var(--ink-dim)] transition-colors hover:text-[var(--ink)] hover:border-[var(--ink)]"
  >
    <svg viewBox="0 0 16 16" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  </a>
);

/**
 * Site navigation: a vertical rail on desktop, a top bar with a drop menu on mobile.
 */
export const Header = () => {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
    <>
      {/* desktop rail */}
      <nav
        aria-label="Primary"
        className="fixed inset-y-0 left-0 z-40 hidden w-[var(--rail)] flex-col items-center justify-between border-r wire bg-[var(--field-deep)] py-6 lg:flex"
      >
        <TransitionLink href="/" aria-label="SwiftYield home">
          <Bolt className="h-9 w-9" />
        </TransitionLink>
        <ul className="flex flex-col items-center gap-2">
          {NAV.map(({ label, href }) => {
            const active = pathname === href;
            return (
              <li key={href} className="relative">
                {active && <span className="absolute -left-[19px] top-0 h-full w-[3px] bg-[var(--spark)]" />}
                <TransitionLink
                  href={href}
                  className={`rail-link font-display block rotate-180 px-2 py-4 text-lg font-extrabold tracking-wide [writing-mode:vertical-rl] transition-colors ${
                    active ? "text-[var(--spark)]" : "text-[var(--ink-dim)] hover:text-[var(--ink)]"
                  }`}
                >
                  {label}
                </TransitionLink>
              </li>
            );
          })}
        </ul>
        <GitHubButton />
      </nav>

      {/* desktop wallet cluster */}
      <div data-og-hide className="fixed right-6 top-5 z-40 hidden items-center gap-2 lg:flex">
        <ConnectButton chainStatus="icon" showBalance={false} accountStatus="address" />
        <FaucetButton />
      </div>

      {/* mobile bar */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-2 border-b wire bg-[var(--field-deep)] px-4 lg:hidden">
        <TransitionLink href="/" className="flex items-center gap-2" aria-label="SwiftYield home">
          <Bolt className="h-8 w-8" />
          <span className="font-display text-lg font-extrabold">SwiftYield</span>
        </TransitionLink>
        <div className="flex items-center gap-2">
          <ConnectButton chainStatus="none" showBalance={false} accountStatus="avatar" />
          <GitHubButton />
          <div className="relative" ref={burgerMenuRef}>
            <button
              aria-label={isDrawerOpen ? "Close menu" : "Open menu"}
              aria-expanded={isDrawerOpen}
              className="grid h-10 w-10 place-items-center border wire"
              onClick={() => setIsDrawerOpen(o => !o)}
            >
              {isDrawerOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars2Icon className="h-5 w-5" />}
            </button>
            {isDrawerOpen && (
              <ul className="absolute right-0 top-12 w-56 border wire bg-[var(--field-deep)] p-2">
                {NAV.map(({ label, href }) => (
                  <li key={href}>
                    <TransitionLink
                      href={href}
                      onClick={() => setIsDrawerOpen(false)}
                      className={`font-display block px-3 py-2 text-2xl font-extrabold ${
                        pathname === href ? "text-[var(--spark)]" : "hover:text-[var(--spark)]"
                      }`}
                    >
                      {label}
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
