"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { CONTRACTS } from "~~/components/site";

// Same encoding as packages/bot/arbitrageBot.js, decoded by FlashLoan.sol swap()
export const encodeUserData = (buy: string, sell: string, token: string, min1: bigint, min2: bigint) => {
  const hex = (v: bigint) => {
    const h = v.toString(16);
    return h.length % 2 ? "0" + h : h;
  };
  // the bot writes the byte length as a 2-digit decimal string, identical to hex below 10 bytes
  const len = (h: string) => String(h.length / 2).padStart(2, "0");
  const a = hex(min1);
  const b = hex(min2);
  return [
    { key: "buy", label: "Buy on", bytes: buy },
    { key: "sell", label: "Sell on", bytes: sell },
    { key: "token", label: "Token", bytes: token.slice(2).toLowerCase() },
    { key: "len1", label: "len(min₁)", bytes: len(a) },
    { key: "len2", label: "len(min₂)", bytes: len(b) },
    { key: "min1", label: "Min token out", bytes: a },
    { key: "min2", label: "Min WETH back", bytes: b },
  ];
};

const COLORS: Record<string, string> = {
  buy: "var(--loan)",
  sell: "var(--profit)",
  token: "var(--ink)",
  len1: "var(--ink-2)",
  len2: "var(--ink-2)",
  min1: "var(--loan)",
  min2: "var(--profit)",
};

const toWei = (s: string) => {
  try {
    return /^\d+$/.test(s) ? BigInt(s) : BigInt(0);
  } catch {
    return BigInt(0);
  }
};

export const PayloadBuilder = () => {
  const [buy, setBuy] = useState("01");
  const [sell, setSell] = useState("02");
  const [token, setToken] = useState(CONTRACTS.tokens[0].address);
  // defaults are the bot's DIA minimums (26.296… DIA and 0.00998 WETH, times its slippage factor)
  const [min1, setMin1] = useState("236666116899079");
  const [min2, setMin2] = useState("89806311787");
  const out = useRef<HTMLDivElement>(null);

  const parts = useMemo(
    () => encodeUserData(buy, sell, token, toWei(min1), toWei(min2)),
    [buy, sell, token, min1, min2],
  );
  const full = "0x" + parts.map(p => p.bytes).join("");

  useEffect(() => {
    const bytes = out.current?.querySelectorAll(".byte");
    if (bytes?.length)
      gsap.fromTo(
        bytes,
        { yPercent: 60, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: 0.006, duration: 0.35, ease: "expo.out" },
      );
  }, [full]);

  const dexName = (id: string) => CONTRACTS.dexes.find(d => d.id === id)!.name;
  const pick = (id: string, active: string, set: (v: string) => void, disabled?: string) => (
    <button
      key={id}
      type="button"
      disabled={id === disabled}
      aria-pressed={id === active}
      onClick={() => set(id)}
      className={`rounded-full border px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] transition-colors disabled:opacity-30 ${
        id === active ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]" : "rule hover:bg-[var(--volt)]"
      }`}
    >
      {dexName(id)}
    </button>
  );

  return (
    <div className="ticket !p-0 overflow-hidden">
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-2">
        <div className="space-y-5">
          <div>
            <div className="label mb-2">Byte 0 · buy low on</div>
            <div className="flex flex-wrap gap-2">
              {CONTRACTS.dexes.map(d =>
                pick(d.id, buy, v => (setBuy(v), v === sell && setSell(v === "01" ? "02" : "01"))),
              )}
            </div>
          </div>
          <div>
            <div className="label mb-2">Byte 1 · sell high on</div>
            <div className="flex flex-wrap gap-2">{CONTRACTS.dexes.map(d => pick(d.id, sell, setSell, buy))}</div>
          </div>
          <div>
            <div className="label mb-2">Bytes 2–21 · token</div>
            <div className="flex gap-2">
              {CONTRACTS.tokens.map(t => (
                <button
                  key={t.symbol}
                  type="button"
                  aria-pressed={t.address === token}
                  onClick={() => setToken(t.address)}
                  className={`rounded-full border px-3 py-1.5 font-mono text-xs tracking-[0.12em] ${
                    t.address === token
                      ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]"
                      : "rule hover:bg-[var(--volt)]"
                  }`}
                >
                  {t.symbol}
                </button>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="label">Min token out (wei)</span>
              <input
                inputMode="numeric"
                value={min1}
                onChange={e => setMin1(e.target.value.replace(/\D/g, ""))}
                className="mt-1 w-full rounded-xl border rule bg-[var(--bone)] px-3 py-2 font-mono text-sm"
              />
            </label>
            <label className="block">
              <span className="label">Min WETH back (wei)</span>
              <input
                inputMode="numeric"
                value={min2}
                onChange={e => setMin2(e.target.value.replace(/\D/g, ""))}
                className="mt-1 w-full rounded-xl border rule bg-[var(--bone)] px-3 py-2 font-mono text-sm"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="label mb-2">Route</div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase">
            <span className="chip">Balancer</span>→<span className="chip !text-[var(--loan)]">{dexName(buy)}</span>→
            <span className="chip !text-[var(--profit)]">{dexName(sell)}</span>→<span className="chip">Balancer</span>
          </div>
          <div className="label mt-6 mb-2">userData legend</div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px]">
            {parts.map(p => (
              <li key={p.key} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[p.key] }} />
                {p.label} · {p.bytes.length / 2}B
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t rule p-6 sm:p-8" style={{ background: "var(--ink)", color: "var(--paper)" }}>
        <div className="flex items-center justify-between">
          <span className="label !text-white/50">makeFlashLoan([WETH], [1e18], userData)</span>
          <button
            type="button"
            className="chip !bg-transparent !text-[var(--paper)] !border-white/20"
            onClick={() => navigator.clipboard?.writeText(full)}
          >
            Copy
          </button>
        </div>
        <div ref={out} className="mt-4 break-all font-mono text-sm leading-7" aria-label={`Encoded userData ${full}`}>
          <span className="opacity-50">0x</span>
          {parts.map(p =>
            p.bytes.match(/../g)?.map((b, i) => (
              <span
                key={p.key + i}
                className="byte inline-block"
                style={{
                  color: p.key === "token" ? "#f7f5ef" : COLORS[p.key] === "var(--ink-2)" ? "#9a9aa2" : COLORS[p.key],
                }}
              >
                {b}
              </span>
            )),
          )}
        </div>
      </div>
    </div>
  );
};
