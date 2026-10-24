import { Metadata } from "next";
import { PayloadBuilder } from "~~/components/PayloadBuilder";
import { Reveal } from "~~/components/motion/Reveal";
import { SplitHeading } from "~~/components/motion/SplitHeading";
import { CONTRACTS, OG_IMAGE, SITE } from "~~/components/site";

const title = "Mechanism";
const description =
  "How SwiftYield's FlashLoan contract borrows, swaps across two DEXs and repays inside one transaction.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/how-it-works" },
  openGraph: { title: `${title} · ${SITE.name}`, description, url: "/how-it-works", images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title: `${title} · ${SITE.name}`, description, images: [OG_IMAGE.url] },
};

const CALLS = [
  ["bot", "Quotes getAmountsOut() for WETH ↔ DIA / ZRO on all three routers and picks the widest spread."],
  ["makeFlashLoan()", "Your contract asks the Balancer Vault for 1 WETH and passes the encoded route as userData."],
  ["receiveFlashLoan()", "The vault sends the WETH and calls back. Only the vault may call this function."],
  ["swap(userData)", "Decodes the route, buys the token on DEX A, then sells it back to WETH on DEX B."],
  ["transfer()", "Returns amount + fee (0 on Balancer) to the vault. Anything left over is profit."],
];

const basescan = (a: string) => `https://basescan.org/address/${a}`;

export default function HowItWorks() {
  return (
    <>
      <section className="wrap pt-16 pb-12 sm:pt-24">
        <span className="label">02 · Mechanism</span>
        <SplitHeading
          as="h1"
          text="One callback. Two swaps. Zero leftovers owed."
          accent={["Two"]}
          className="font-display mt-4 max-w-5xl text-[10vw] sm:text-6xl lg:text-7xl font-bold leading-[0.95]"
        />
        <p className="max-w-2xl text-lg text-[var(--ink-2)]">
          The whole trade is a single call into the Balancer Vault. Every step below runs inside it, so either the loop
          closes with the loan repaid, or nothing happens at all.
        </p>
      </section>

      <section className="wrap pb-20">
        <Reveal className="grid gap-px overflow-hidden rounded-[22px] border rule bg-[var(--line)] md:grid-cols-5">
          {CALLS.map(([fn, body], i) => (
            <div key={fn} className="bg-[var(--paper)] p-6 transition-colors hover:bg-[var(--volt)]" data-cursor>
              <span className="label">0{i + 1}</span>
              <div className="mt-6 font-mono text-sm font-medium">{fn}</div>
              <p className="text-sm text-[var(--ink-2)]">{body}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="wrap pb-24">
        <span className="label">Try the encoder</span>
        <SplitHeading
          text="Build the route the bot sends."
          className="font-display mt-4 text-4xl sm:text-5xl font-bold"
        />
        <p className="max-w-2xl text-[var(--ink-2)]">
          The bot packs the route into raw bytes, and the contract decodes them in assembly. Pick the DEXs and token to
          see the exact payload it would pass to makeFlashLoan().
        </p>
        <div className="mt-10">
          <PayloadBuilder />
        </div>
      </section>

      <section className="wrap pb-28">
        <span className="label">Addresses in FlashLoan.sol · Base</span>
        <Reveal className="mt-6 divide-y divide-[var(--line)] rounded-[22px] border rule bg-[var(--paper)]">
          {[
            ["Balancer Vault", CONTRACTS.vault],
            ["WETH", CONTRACTS.weth],
            ...CONTRACTS.dexes.map(d => [`${d.name} router · 0x${d.id}`, d.router]),
            ...CONTRACTS.tokens.map(t => [t.symbol, t.address]),
          ].map(([name, addr]) => (
            <a
              key={addr}
              href={basescan(addr)}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col gap-1 px-6 py-4 transition-colors hover:bg-[var(--volt)] sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-display text-sm font-semibold">{name}</span>
              <span className="break-all font-mono text-xs text-[var(--ink-2)]">{addr} ↗</span>
            </a>
          ))}
        </Reveal>
      </section>
    </>
  );
}
