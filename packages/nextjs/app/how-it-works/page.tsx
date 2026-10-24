import { Metadata } from "next";
import { PayloadBuilder } from "~~/components/PayloadBuilder";
import { Flicker } from "~~/components/motion/Flicker";
import { Reveal } from "~~/components/motion/Reveal";
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
      <section className="page pt-14 pb-12 sm:pt-24">
        <Flicker
          as="h1"
          text="One callback. Two swaps. Nothing left owed."
          hot={["Two"]}
          className="font-display max-w-5xl text-[11vw] font-extrabold leading-[0.82] sm:text-8xl lg:text-[9rem]"
        />
        <p className="max-w-2xl text-lg text-[var(--ink-dim)]">
          The whole trade is a single call into the Balancer Vault. Every step below runs inside it, so either the loop
          closes with the loan repaid, or nothing happens at all.
        </p>
      </section>

      <section className="page pb-20">
        <Reveal className="grid border-t wire md:grid-cols-5">
          {CALLS.map(([fn, body], i) => (
            <div
              key={fn}
              data-cursor
              className={`border-b wire p-5 transition-colors hover:bg-[var(--field-hi)] md:border-b-0 ${
                i ? "md:border-l" : ""
              }`}
            >
              <span className="font-display text-5xl font-extrabold text-[var(--spark)]">{i + 1}</span>
              <div className="font-data mt-4 text-sm">{fn}</div>
              <p className="text-sm text-[var(--ink-dim)]">{body}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="page pb-24">
        <Flicker
          text="Build the route the bot sends"
          className="font-display text-5xl font-extrabold leading-[0.9] sm:text-6xl"
        />
        <p className="max-w-2xl text-[var(--ink-dim)]">
          The bot packs the route into raw bytes, and the contract decodes them in assembly. Pick the DEXs and token to
          see the exact payload it would pass to makeFlashLoan().
        </p>
        <div className="mt-10">
          <PayloadBuilder />
        </div>
      </section>

      <section className="page pb-28">
        <Flicker
          text="Addresses in FlashLoan.sol"
          className="font-display text-4xl font-extrabold leading-[0.9] sm:text-6xl"
        />
        <Reveal className="mt-8 border-t wire">
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
              className="flex flex-col gap-1 border-b wire px-2 py-4 transition-colors hover:bg-[var(--field-hi)] sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-display text-2xl font-extrabold">{name}</span>
              <span className="font-data break-all text-xs text-[var(--ink-dim)]">{addr} ↗</span>
            </a>
          ))}
        </Reveal>
      </section>
    </>
  );
}
