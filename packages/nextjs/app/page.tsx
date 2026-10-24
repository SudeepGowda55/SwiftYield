"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Oscilloscope } from "~~/components/hero/Oscilloscope";
import { storm } from "~~/components/hero/StormScene";
import { Flicker } from "~~/components/motion/Flicker";
import { Magnetic } from "~~/components/motion/Magnetic";
import { TransitionLink } from "~~/components/motion/PageTransition";
import { Reveal } from "~~/components/motion/Reveal";

gsap.registerPlugin(ScrollTrigger);

// start fetching the 3D chunk in parallel with hydration
const sceneImport = typeof window !== "undefined" ? import("~~/components/hero/StormScene") : null;
const StormScene = dynamic(() => sceneImport ?? import("~~/components/hero/StormScene"), { ssr: false });

// Three real phases of one FlashLoan.sol transaction. Supporting detail lives in the sections below.
const CHAPTERS = [
  {
    title: "Borrow the charge",
    body: "makeFlashLoan() pulls 1 WETH out of the Balancer Vault. No collateral and no flash-loan fee: Balancer only asks for it back before the block ends.",
    status: "Loan outstanding · 1 WETH",
    color: "var(--debt)",
  },
  {
    title: "Strike both pools",
    body: "swap() buys DIA or ZRO on the cheaper DEX and sells it straight back to WETH on the dearer one, guarded by minimum-out amounts.",
    status: "Two swaps · same transaction",
    color: "var(--ink)",
  },
  {
    title: "Ground it. Keep the spark.",
    body: "receiveFlashLoan() repays the vault in full. If it can't, the whole strike reverts. Whatever WETH is left over stays in your contract.",
    status: "Repaid · spread kept",
    color: "var(--spark)",
  },
];

const TRACE = [
  { d: 0, fn: "FlashLoan.makeFlashLoan([WETH], [1e18], userData)", note: "bot fires the strike" },
  { d: 1, fn: "BalancerVault.flashLoan(this, tokens, amounts, userData)", note: "+1 WETH lent" },
  { d: 2, fn: "FlashLoan.receiveFlashLoan(tokens, amounts, fees, userData)", note: "only the vault may call" },
  { d: 3, fn: "FlashLoan.swap(userData)", note: "decode route bytes" },
  { d: 4, fn: "RouterA.swapExactTokensForTokens(WETH → DIA)", note: "buy low" },
  { d: 4, fn: "RouterB.swapExactTokensForTokens(DIA → WETH)", note: "sell high" },
  { d: 3, fn: "WETH.transfer(vault, amount + fee)", note: "fee is 0 on Balancer" },
  { d: 0, fn: "← transaction ends", note: "spread stays in FlashLoan" },
];

const STATS = [
  { value: 0, suffix: "%", label: "Balancer flash-loan fee" },
  { value: 1, suffix: "", label: "Transaction per arbitrage" },
  { value: 3, suffix: "", label: "DEXs wired into the contract" },
  { value: 643, suffix: "", label: "Uniswap V2 forks it could reach" },
];

const ADVANTAGES = [
  {
    title: "Lucrative opportunities",
    body: "Flash-loan arbitrage captures price differences across decentralized exchanges without needing your own capital.",
  },
  {
    title: "Efficient transactions",
    body: "Everything happens inside one transaction, so there's no exposure to prices moving between the buy and the sell.",
  },
  {
    title: "Automated precision",
    body: "The bot scans pairs and routes for you, then fires the contract with the best route it found.",
  },
];

const Story = () => {
  const section = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    storm.p = 0;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });
      tl.to(storm, { p: 3, duration: 3 }, 0);
      tl.to(".hero-copy", { opacity: 0, y: -40, duration: 0.25 }, 0.02);
      tl.fromTo(".fuse", { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.1);
      CHAPTERS.forEach((_, i) => {
        tl.fromTo(`.fuse-fill-${i}`, { scaleX: 0 }, { scaleX: 1, duration: 1 }, i);
        tl.fromTo(`.chapter-${i}`, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.2 }, i + 0.15);
        if (i < CHAPTERS.length - 1) tl.to(`.chapter-${i}`, { opacity: 0, y: -30, duration: 0.2 }, i + 0.85);
      });
    }, section);
    return () => {
      ctx.revert();
      storm.p = 0;
    };
  }, []);

  return (
    <section
      ref={section}
      className="relative"
      style={{ height: "420vh" }}
      aria-label="One flash loan as one lightning strike"
    >
      <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden lg:top-0 lg:h-[100svh]">
        <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: ready ? 1 : 0 }}>
          <StormScene onReady={() => setReady(true)} />
        </div>

        {/* diagonal split: "One block." top-left, "One strike." bottom-right, the bolt between them */}
        <div className="pointer-events-none relative h-full px-4 pt-6 sm:px-10 md:pr-24 lg:pt-10">
          <h1 className="sr-only">One block. One strike.</h1>
          <div className="hero-copy flex h-full flex-col">
            <Flicker
              as="div"
              text="One block."
              className="font-display text-[12vw] font-extrabold leading-[0.9] sm:text-8xl lg:text-[7.5rem]"
            />
            <Flicker
              as="div"
              text="One strike."
              hot={["strike."]}
              delay={0.25}
              className="font-display text-right text-[12vw] font-extrabold leading-[0.9] sm:text-8xl lg:absolute lg:bottom-10 lg:right-28 lg:text-[7.5rem]"
            />
            <div
              className="pointer-events-auto mt-5 max-w-sm lg:absolute lg:left-10 lg:top-[34%] lg:mt-0"
              style={{ textShadow: "0 1px 12px rgba(255,138,61,0.95)" }}
            >
              <p className="!mt-0 text-base font-medium text-[var(--ink-dim)] sm:text-lg">
                SwiftYield is a no-code flash-loan arbitrage bot on Base. It borrows from Balancer, hits the price gap
                between two DEXs and repays the loan, all inside a single transaction.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Magnetic>
                  <TransitionLink href="/authenticate" className="strike-btn">
                    Start arbitrage <span aria-hidden>→</span>
                  </TransitionLink>
                </Magnetic>
                <Magnetic>
                  <TransitionLink href="/how-it-works" className="strike-btn-ghost">
                    See the mechanism
                  </TransitionLink>
                </Magnetic>
              </div>
            </div>
          </div>

          {CHAPTERS.map((c, i) => (
            <div
              key={c.title}
              className={`chapter-${i} absolute left-4 right-4 top-6 max-w-xl opacity-0 sm:left-10 lg:top-[22%]`}
              style={{ textShadow: "0 1px 14px rgba(255,138,61,0.95)" }}
            >
              <div className="text-sm font-bold" style={{ color: c.color }}>
                {c.status}
              </div>
              <h2 className="font-display mt-2 text-5xl font-extrabold leading-[0.9] sm:text-7xl">{c.title}</h2>
              <p className="max-w-md font-medium text-[var(--ink-dim)]">{c.body}</p>
            </div>
          ))}

          {/* three-segment fuse: burns along with the scroll */}
          <div className="fuse absolute left-4 top-2 flex w-60 gap-2 opacity-0 sm:left-10 lg:top-10" aria-hidden>
            {CHAPTERS.map((c, i) => (
              <div key={c.title} className="h-1.5 flex-1 bg-[var(--wire)]">
                <div className={`fuse-fill-${i} h-full origin-left`} style={{ background: c.color }} />
              </div>
            ))}
          </div>
        </div>

        <Oscilloscope />
      </div>
    </section>
  );
};

const Trace = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>(".trace-row");
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: ".trace-list", start: "top 70%", end: "bottom 45%", scrub: 0.4 },
      });
      tl.fromTo(".trace-current", { scaleY: 0 }, { scaleY: 1, duration: rows.length }, 0);
      tl.fromTo(".trace-spark", { top: "0%" }, { top: "100%", duration: rows.length }, 0);
      rows.forEach((r, i) => tl.fromTo(r, { opacity: 0.22 }, { opacity: 1, duration: 0.3 }, i));
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="page grid gap-12 py-24 sm:py-32 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <Flicker text="Inside one strike" className="font-display text-5xl font-extrabold leading-[0.9] sm:text-7xl" />
        <p className="max-w-sm text-[var(--ink-dim)]">
          The real call trace of one arbitrage. Scroll and the current runs through it, top to bottom, inside a single
          Base transaction.
        </p>
      </div>
      <div className="trace-list relative pl-8">
        <div className="absolute left-2 top-0 h-full w-px bg-[var(--wire)]" />
        <div className="trace-current absolute left-2 top-0 h-full w-px origin-top bg-[var(--ink)]" />
        <div className="trace-spark absolute left-2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[var(--spark)] shadow-[0_0_18px_var(--spark)]" />
        <ol className="space-y-3">
          {TRACE.map((t, i) => (
            <li
              key={i}
              className="trace-row flex flex-col gap-1 border-b wire pb-3 sm:flex-row sm:items-baseline sm:justify-between"
            >
              <span className="font-data text-[13px] sm:text-sm" style={{ paddingLeft: `${t.d * 14}px` }}>
                {t.fn}
              </span>
              <span className="shrink-0 text-sm font-bold">{t.note}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};

const Stats = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".stat").forEach(el => {
        const num = el.querySelector(".stat-num")!;
        const o = { v: 0 };
        gsap.to(o, {
          v: Number(el.dataset.value),
          ease: "none",
          onUpdate: () => void (num.textContent = String(Math.round(o.v))),
          scrollTrigger: { trigger: el, start: "top 92%", end: "top 55%", scrub: 0.5 },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 border-y wire lg:grid-cols-4">
      {STATS.map((s, i) => (
        <div
          key={s.label}
          data-value={s.value}
          className={`stat wire px-4 py-10 sm:px-10 ${i % 2 ? "border-l" : ""} ${i ? "lg:border-l" : ""} ${
            i > 1 ? "border-t lg:border-t-0" : ""
          }`}
        >
          <div className="font-display text-5xl font-extrabold leading-none sm:text-7xl">
            <span className="stat-num">0</span>
            <span className="text-[var(--spark)]">{s.suffix}</span>
          </div>
          <p className="!mb-0 text-[var(--ink-dim)]">{s.label}</p>
        </div>
      ))}
    </div>
  );
};

const Home = () => (
  <>
    <Story />
    <Trace />
    <Stats />

    <section className="page py-24 sm:py-32">
      <Flicker text="Why borrow the storm" className="font-display text-5xl font-extrabold leading-[0.9] sm:text-7xl" />
      <Reveal className="mt-12 grid gap-4 md:grid-cols-3">
        {ADVANTAGES.map((a, i) => (
          <article key={a.title} data-cursor className="plate transition-colors hover:bg-[var(--field-hi)]">
            <span className="font-display text-5xl font-extrabold text-[var(--spark)]">{i + 1}</span>
            <h3 className="font-display mt-6 text-2xl sm:text-3xl font-extrabold leading-none">{a.title}</h3>
            <p className="text-[var(--ink-dim)]">{a.body}</p>
          </article>
        ))}
      </Reveal>
    </section>

    <section style={{ background: "var(--ink)", color: "var(--field)" }}>
      <div className="page grid gap-10 py-20 lg:grid-cols-[1fr_1.1fr] lg:items-end">
        <Flicker
          text="Verify. Deploy. Let it strike."
          className="font-display text-5xl font-extrabold leading-[0.9] sm:text-7xl"
        />
        <Reveal className="grid gap-px bg-[var(--field)] sm:grid-cols-3">
          {[
            ["Verify", "Prove you're human with World ID."],
            ["Deploy", "Deploy your own FlashLoan contract on the Tenderly Base vnet."],
            ["Run", "Clone the repo, paste the contract address and run yarn bot."],
          ].map(([k, v], i) => (
            <div key={k} className="bg-[var(--ink)] p-5">
              <div className="font-display text-5xl font-extrabold">{i + 1}</div>
              <div className="font-display mt-2 text-2xl font-extrabold">{k}</div>
              <p className="!mb-0 text-sm text-[var(--cream)]">{v}</p>
            </div>
          ))}
        </Reveal>
        <div className="lg:col-start-2">
          <Magnetic>
            <TransitionLink href="/authenticate" className="strike-btn !bg-[var(--field)] !text-[var(--ink)]">
              Start arbitrage <span aria-hidden>→</span>
            </TransitionLink>
          </Magnetic>
        </div>
      </div>
    </section>
  </>
);

export default Home;
