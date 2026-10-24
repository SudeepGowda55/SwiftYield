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
  buy: "var(--debt)",
  sell: "var(--spark)",
  token: "var(--ink)",
  len1: "rgba(34,7,43,0.55)",
  len2: "rgba(34,7,43,0.55)",
  min1: "var(--debt)",
  min2: "var(--spark)",
};

const toWei = (s: string) => {
  try {
    return /^\d+$/.test(s) ? BigInt(s) : BigInt(0);
  } catch {
    return BigInt(0);
  }
};

// node positions in the route diagram's 300×150 viewBox: vault on top, the three pools below
const NODES = { vault: [150, 18], "01": [40, 128], "02": [150, 128], "03": [260, 128] } as Record<string, number[]>;

const zig = (a: number[], b: number[]) => {
  let d = "";
  for (let i = 1; i <= 7; i++) {
    const t = i / 7;
    const j = i < 7 ? (Math.random() - 0.5) * 16 : 0;
    d += ` L${(a[0] + (b[0] - a[0]) * t + j).toFixed(1)},${(a[1] + (b[1] - a[1]) * t + j * 0.4).toFixed(1)}`;
  }
  return d;
};

/** Route diagram: a bolt redraws vault → buy pool → sell pool → vault whenever the route changes. */
const RouteBolt = ({ buy, sell }: { buy: string; sell: string }) => {
  const path = useRef<SVGPathElement>(null);
  useEffect(() => {
    const p = path.current!;
    const v = NODES.vault;
    p.setAttribute("d", `M${v[0]},${v[1]}` + zig(v, NODES[buy]) + zig(NODES[buy], NODES[sell]) + zig(NODES[sell], v));
    const len = p.getTotalLength();
    gsap.fromTo(
      p,
      { strokeDasharray: len, strokeDashoffset: len },
      { strokeDashoffset: 0, duration: 0.6, ease: "power3.in" },
    );
  }, [buy, sell]);
  return (
    <svg
      viewBox="0 -14 300 176"
      className="w-full"
      role="img"
      aria-label={`Route: vault, then ${buy}, then ${sell}, then vault`}
    >
      <path
        ref={path}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="2"
        strokeLinejoin="bevel"
        style={{ filter: "drop-shadow(0 0 4px #5a17ff)" }}
      />
      {Object.entries(NODES).map(([k, [x, y]]) => (
        <g key={k}>
          <circle
            cx={x}
            cy={y}
            r={k === "vault" ? 9 : 7}
            fill={k === buy ? "var(--debt)" : k === sell ? "var(--spark)" : "var(--field-deep)"}
            stroke="var(--ink)"
          />
          <text x={x} y={k === "vault" ? y - 13 : y + 20} textAnchor="middle" fontSize="10" fill="var(--ink)">
            {k === "vault" ? "Balancer" : CONTRACTS.dexes.find(d => d.id === k)!.name.replace(" V2", "")}
          </text>
        </g>
      ))}
    </svg>
  );
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
      gsap.fromTo(bytes, { opacity: 0.1 }, { opacity: 1, stagger: { each: 0.004, from: "random" }, duration: 0.05 });
  }, [full]);

  const opt = (active: boolean) =>
    `border px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-30 ${
      active ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--field-deep)]" : "wire hover:border-[var(--ink)]"
    }`;

  return (
    <div className="border wire">
      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6">
          <fieldset>
            <legend className="mb-2 text-sm text-[var(--ink-dim)]">Byte 0 · buy low on</legend>
            <div className="flex flex-wrap gap-2">
              {CONTRACTS.dexes.map(d => (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={d.id === buy}
                  className={opt(d.id === buy)}
                  onClick={() => {
                    setBuy(d.id);
                    if (d.id === sell) setSell(d.id === "01" ? "02" : "01");
                  }}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm text-[var(--ink-dim)]">Byte 1 · sell high on</legend>
            <div className="flex flex-wrap gap-2">
              {CONTRACTS.dexes.map(d => (
                <button
                  key={d.id}
                  type="button"
                  disabled={d.id === buy}
                  aria-pressed={d.id === sell}
                  className={opt(d.id === sell)}
                  onClick={() => setSell(d.id)}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm text-[var(--ink-dim)]">Bytes 2–21 · token</legend>
            <div className="flex gap-2">
              {CONTRACTS.tokens.map(t => (
                <button
                  key={t.symbol}
                  type="button"
                  aria-pressed={t.address === token}
                  className={opt(t.address === token)}
                  onClick={() => setToken(t.address)}
                >
                  {t.symbol}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Min token out (wei)", min1, setMin1],
              ["Min WETH back (wei)", min2, setMin2],
            ].map(([label, value, set]) => (
              <label key={label as string} className="block">
                <span className="text-sm text-[var(--ink-dim)]">{label as string}</span>
                <input
                  inputMode="numeric"
                  value={value as string}
                  onChange={e => (set as (v: string) => void)(e.target.value.replace(/\D/g, ""))}
                  className="font-data mt-1 w-full border wire bg-[var(--field-deep)] px-3 py-2 text-sm outline-none focus:border-[var(--spark)]"
                />
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-between gap-6">
          <RouteBolt buy={buy} sell={sell} />
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {parts.map(p => (
              <li key={p.key} className="flex items-center gap-2">
                <span className="h-2 w-2" style={{ background: COLORS[p.key] }} />
                {p.label} · {p.bytes.length / 2} B
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t wire bg-[var(--field-deep)] p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <span className="font-data text-xs text-[var(--ink-dim)]">makeFlashLoan([WETH], [1e18], userData)</span>
          <button
            type="button"
            className="tag hover:border-[var(--ink)]"
            onClick={() => navigator.clipboard?.writeText(full)}
          >
            Copy
          </button>
        </div>
        <div ref={out} className="font-data mt-4 break-all text-sm leading-7" aria-label={`Encoded userData ${full}`}>
          <span className="opacity-50">0x</span>
          {parts.map(p =>
            p.bytes.match(/../g)?.map((b, i) => (
              <span key={p.key + i} className="byte" style={{ color: COLORS[p.key] }}>
                {b}
              </span>
            )),
          )}
        </div>
      </div>
    </div>
  );
};
