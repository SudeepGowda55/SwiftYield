import { hardhat } from "viem/chains";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { Bolt } from "~~/components/Header";
import { TransitionLink } from "~~/components/motion/PageTransition";
import { Faucet } from "~~/components/scaffold-eth";
import { NAV, SITE } from "~~/components/site";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useGlobalState } from "~~/services/store/store";

/**
 * Site footer
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrencyPrice);
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === hardhat.id;

  return (
    <footer className="border-t rule" style={{ background: "var(--ink)", color: "var(--paper)" }}>
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <Bolt className="h-8 w-8" />
            <span className="font-display text-2xl font-bold">SwiftYield</span>
          </div>
          <p className="max-w-sm text-sm opacity-70">{SITE.description}</p>
          {nativeCurrencyPrice > 0 && (
            <span className="chip !bg-transparent !text-[var(--paper)] !border-white/20">
              <CurrencyDollarIcon className="h-4 w-4" /> ETH {nativeCurrencyPrice}
            </span>
          )}
        </div>
        <ul className="space-y-2 font-mono text-xs uppercase tracking-[0.14em]">
          {NAV.map(n => (
            <li key={n.href}>
              <TransitionLink href={n.href} className="opacity-70 hover:opacity-100 hover:text-[var(--volt)]">
                {n.label}
              </TransitionLink>
            </li>
          ))}
        </ul>
        <ul className="space-y-2 font-mono text-xs uppercase tracking-[0.14em]">
          <li>
            <a
              href={SITE.repo}
              target="_blank"
              rel="noreferrer"
              className="opacity-70 hover:opacity-100 hover:text-[var(--volt)]"
            >
              GitHub ↗
            </a>
          </li>
          <li>
            <a
              href={SITE.explorer}
              target="_blank"
              rel="noreferrer"
              className="opacity-70 hover:opacity-100 hover:text-[var(--volt)]"
            >
              Tenderly explorer ↗
            </a>
          </li>
          <li>
            <a
              href={`${SITE.repo}/issues`}
              target="_blank"
              rel="noreferrer"
              className="opacity-70 hover:opacity-100 hover:text-[var(--volt)]"
            >
              Support ↗
            </a>
          </li>
        </ul>
      </div>
      {isLocalNetwork && (
        <div className="fixed bottom-4 left-4 z-10">
          <Faucet />
        </div>
      )}
      <div className="wrap border-t border-white/10 py-5 font-mono text-[11px] uppercase tracking-[0.18em] opacity-50">
        Built on Base · Balancer · Uniswap V2 forks
      </div>
    </footer>
  );
};
