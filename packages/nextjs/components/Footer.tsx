import { hardhat } from "viem/chains";
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
    <footer className="border-t wire bg-[var(--field-deep)]">
      <div className="page grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Bolt className="h-10 w-10" />
            <span className="font-display text-4xl font-extrabold">SwiftYield</span>
          </div>
          <p className="max-w-sm text-[var(--ink-dim)]">{SITE.description}</p>
          {nativeCurrencyPrice > 0 && <span className="tag">ETH ${nativeCurrencyPrice}</span>}
        </div>
        <ul className="space-y-1">
          {NAV.map(n => (
            <li key={n.href}>
              <TransitionLink href={n.href} className="font-display text-2xl font-extrabold hover:text-[var(--spark)]">
                {n.label}
              </TransitionLink>
            </li>
          ))}
        </ul>
        <ul className="space-y-2">
          {[
            ["GitHub", SITE.repo],
            ["Tenderly explorer", SITE.explorer],
            ["Support", `${SITE.repo}/issues`],
          ].map(([label, href]) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noreferrer" className="text-[var(--ink-dim)] hover:text-[var(--ink)]">
                {label} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
      {isLocalNetwork && (
        <div className="fixed bottom-4 right-4 z-10">
          <Faucet />
        </div>
      )}
    </footer>
  );
};
