"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { loopStore } from "~~/components/hero/LoopScene";
import { Magnetic } from "~~/components/motion/Magnetic";
import { Marquee } from "~~/components/motion/Marquee";
import { TransitionLink } from "~~/components/motion/PageTransition";
import { Reveal } from "~~/components/motion/Reveal";
import { SplitHeading } from "~~/components/motion/SplitHeading";

gsap.registerPlugin(ScrollTrigger);

// start fetching the 3D chunk in parallel with hydration
const sceneImport = typeof window !== "undefined" ? import("~~/components/hero/LoopScene") : null;
const LoopScene = dynamic(() => sceneImport ?? import("~~/components/hero/LoopScene"), { ssr: false });

// One chapter per real state of FlashLoan.sol: borrow, swap on DEX A, swap on DEX B, repay. No filler.
const CHAPTERS = [
  {
    n: "01",
    tag: "Borrow",
    color: "var(--loan)",
    title: "Borrow WETH from the Balancer Vault.",
    body: "makeFlashLoan() asks Balancer for 1 WETH. Balancer charges no flash-loan fee, and no collateral is needed: if the loop can't repay, the whole transaction reverts.",
  },
  {
    n: "02",
    tag: "Buy low",
    color: "var(--ink)",
    title: "Swap into the token where it's cheapest.",
    body: "The bot quotes DIA and ZRO on Uniswap, SushiSwap and PancakeSwap, then the contract buys on the DEX with the lowest price.",
  },
  {
    n: "03",
    tag: "Sell high",
    color: "var(--ink)",
    title: "Sell it back where it's dearer.",
    body: "Still inside the same block, the contract sells the token back to WETH on the DEX quoting more, guarded by minimum-out amounts.",
  },
  {
    n: "04",
    tag: "Repay",
    color: "var(--profit)",
    title: "Repay the vault. Keep the spread.",
    body: "receiveFlashLoan() returns the borrowed amount to the vault. Whatever is left over stays in your contract. You only pay gas.",
  },
];

const STATS = [
  { value: 0, suffix: "%", label: "Balancer flash-loan fee" },
  { value: 1, suffix: "", label: "transaction per arbitrage" },
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
    loopStore.p = 0;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: section.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });
      tl.to(loopStore, { p: 4, duration: 4 }, 0);
      tl.to(".hero-copy", { opacity: 0, y: -60, duration: 0.35 }, 0.05);
      tl.to(".rail-fill", { scaleY: 1, duration: 4 }, 0);
      CHAPTERS.forEach((_, i) => {
        const el = `.chapter-${i}`;
        tl.fromTo(el, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.3 }, i + 0.35);
        tl.to(`.tick-${i}`, { backgroundColor: "#0e0e10", color: "#f7f5ef", duration: 0.1 }, i + 0.35);
        if (i < CHAPTERS.length - 1) tl.to(el, { opacity: 0, y: -50, duration: 0.3 }, i + 1.1);
      });
    }, section);
    return () => {
      ctx.revert();
      loopStore.p = 0;
    };
  }, []);

  return (
    <section ref={section} className="relative" style={{ height: "520vh" }} aria-label="How one arbitrage loop runs">
      <div className="sticky top-16 h-[calc(100svh-4rem)] overflow-hidden">
        <div className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: ready ? 1 : 0 }}>
          <LoopScene onReady={() => setReady(true)} />
        </div>

        <div className="wrap relative h-full pointer-events-none">
          {/* chapter 0: hero */}
          <div className="absolute inset-x-4 sm:inset-x-8 top-[6%] lg:top-1/2 lg:-translate-y-1/2 max-w-2xl">
            <div className="hero-copy pointer-events-auto">
              <span className="chip mb-6">
                <span className="h-2 w-2 rounded-full bg-[var(--profit)] animate-pulse" /> Live on Base · Tenderly vnet
              </span>
              <SplitHeading
                as="h1"
                text="Borrow. Arbitrage. Repay. One block."
                accent={["One"]}
                className="font-display text-[11vw] sm:text-6xl lg:text-7xl font-bold leading-[0.95]"
              />
              <p className="max-w-md text-base sm:text-lg text-[var(--ink-2)]">
                SwiftYield is a no-code flash-loan arbitrage bot. It borrows from Balancer, trades the price gap between
                DEXs and repays the loan in the same transaction.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Magnetic>
                  <TransitionLink href="/authenticate" className="cta">
                    Start arbitrage <span aria-hidden>→</span>
                  </TransitionLink>
                </Magnetic>
                <Magnetic>
                  <TransitionLink href="/how-it-works" className="cta cta-volt">
                    See the mechanism
                  </TransitionLink>
                </Magnetic>
              </div>
              <p className="label mt-10 hidden sm:block">↓ Scroll to run one loop · illustration, not live trades</p>
            </div>
          </div>

          {/* chapters 1-4 */}
          {CHAPTERS.map((c, i) => (
            <div key={c.n} className="absolute inset-x-4 sm:inset-x-8 top-[4%] lg:top-1/2 lg:-translate-y-1/2 max-w-md">
              <div className={`chapter-${i} ticket opacity-0`}>
                <div className="flex items-center justify-between">
                  <span className="label">Step {c.n} / 04</span>
                  <span className="chip" style={{ color: c.color }}>
                    {c.tag}
                  </span>
                </div>
                <h2 className="font-display mt-5 text-2xl sm:text-4xl font-bold leading-tight">{c.title}</h2>
                <p className="text-[var(--ink-2)]">{c.body}</p>
              </div>
            </div>
          ))}

          {/* progress rail */}
          <div className="absolute right-4 sm:right-8 bottom-8 lg:top-1/2 lg:bottom-auto lg:-translate-y-1/2 flex lg:flex-col items-center gap-3">
            <div className="relative hidden lg:block h-40 w-px bg-[var(--line)]">
              <div className="rail-fill absolute inset-0 origin-top scale-y-0 bg-[var(--ink)]" />
            </div>
            {CHAPTERS.map((c, i) => (
              <span key={c.n} className={`tick-${i} chip !px-2`} aria-hidden>
                {c.n}
              </span>
            ))}
          </div>
        </div>
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
        const bar = el.querySelector(".stat-bar")!;
        const target = Number(el.dataset.value);
        const o = { v: 0 };
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: "top 90%", end: "top 45%", scrub: 0.5 } })
          .to(o, { v: target, ease: "none", onUpdate: () => void (num.textContent = String(Math.round(o.v))) }, 0)
          .fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 lg:grid-cols-4 border-t border-l rule">
      {STATS.map(s => (
        <div key={s.label} data-value={s.value} className="stat border-b border-r rule p-6 sm:p-8">
          <div className="font-display text-5xl sm:text-7xl font-bold">
            <span className="stat-num">0</span>
            {s.suffix}
          </div>
          <div className="stat-bar mt-4 h-1.5 origin-left bg-[var(--volt)] outline outline-1 outline-[var(--ink)]" />
          <p className="label !mt-4">{s.label}</p>
        </div>
      ))}
    </div>
  );
};

const Home = () => {
  return (
    <>
      <Story />

      <Marquee
        items={["Balancer Vault", "Uniswap V2", "SushiSwap V2", "PancakeSwap V2", "WETH", "DIA", "ZRO", "Base Mainnet"]}
      />

      <section className="wrap py-24 sm:py-32">
        <span className="label">By the contract</span>
        <SplitHeading
          text="Zero fee capital. One atomic shot."
          accent={["Zero"]}
          className="font-display mt-4 max-w-4xl text-4xl sm:text-6xl font-bold"
        />
        <div className="mt-14">
          <Stats />
        </div>
      </section>

      <section className="wrap pb-24 sm:pb-32">
        <span className="label">Why flash loans</span>
        <SplitHeading
          text="Advantages of the flash loan"
          className="font-display mt-4 text-4xl sm:text-6xl font-bold"
        />
        <Reveal className="mt-12 grid gap-4 md:grid-cols-3">
          {ADVANTAGES.map((a, i) => (
            <article
              key={a.title}
              data-cursor
              className="ticket group transition-transform duration-500 hover:-translate-y-2 hover:bg-[var(--volt)]"
            >
              <span className="label">0{i + 1}</span>
              <h3 className="font-display mt-8 text-2xl font-bold">{a.title}</h3>
              <p className="text-[var(--ink-2)] group-hover:text-[var(--ink)]">{a.body}</p>
            </article>
          ))}
        </Reveal>
      </section>

      <section className="border-y rule" style={{ background: "var(--volt)" }}>
        <div className="wrap grid gap-10 py-20 lg:grid-cols-2 lg:items-end">
          <div>
            <span className="label !text-[var(--ink)]">Run it yourself</span>
            <SplitHeading
              text="Verify, deploy, then let the bot hunt."
              className="font-display mt-4 text-4xl sm:text-6xl font-bold"
            />
          </div>
          <Reveal className="space-y-3">
            {[
              ["Verify", "Prove you're human with World ID."],
              ["Deploy", "Deploy your own FlashLoan contract on the Tenderly Base vnet."],
              ["Run", "Clone the repo, paste the contract address and run yarn bot."],
            ].map(([k, v], i) => (
              <div
                key={k}
                className="flex items-start gap-4 rounded-2xl border border-[var(--ink)] bg-[var(--paper)] p-4"
              >
                <span className="font-display text-2xl font-bold">0{i + 1}</span>
                <div>
                  <div className="font-mono text-xs uppercase tracking-[0.14em]">{k}</div>
                  <div className="text-[var(--ink-2)]">{v}</div>
                </div>
              </div>
            ))}
            <div className="pt-4">
              <Magnetic>
                <TransitionLink href="/authenticate" className="cta">
                  Start arbitrage <span aria-hidden>→</span>
                </TransitionLink>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
};

export default Home;
