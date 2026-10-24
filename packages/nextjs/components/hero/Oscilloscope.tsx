"use client";

import { useEffect, useRef } from "react";
import { DEXES, simLog, storm } from "~~/components/hero/StormScene";

/** Voltage trace running down the hero's right edge: one spike per simulated strike, with the route it took. */
export const Oscilloscope = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const readout = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const c = canvas.current;
    const g = c?.getContext("2d");
    if (!c || !g) return;
    const dpr = Math.min(2, devicePixelRatio);
    const N = 400;
    const buf = new Float32Array(N);
    let head = 0;
    let seen = simLog.n;
    let spike = 0;
    let raf = 0;
    const loop = () => {
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (c.width !== w * dpr || c.height !== h * dpr) {
        c.width = w * dpr;
        c.height = h * dpr;
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (simLog.n !== seen) {
        seen = simLog.n;
        spike = 1;
        if (readout.current)
          readout.current.textContent = `Sim block +${seen} · ${DEXES[simLog.buy]} → ${DEXES[simLog.sell]}`;
      }
      const live = storm.p < 0.02;
      buf[head++ % N] = (Math.random() - 0.5) * 0.1 + (live ? spike * (Math.random() > 0.5 ? 1 : -0.6) : 0);
      spike *= 0.8;

      g.clearRect(0, 0, w, h);
      g.strokeStyle = "rgba(34,7,43,0.2)";
      g.beginPath();
      g.moveTo(w / 2, 0);
      g.lineTo(w / 2, h);
      g.stroke();
      g.strokeStyle = "#22072b";
      g.lineWidth = 1.5;
      g.shadowColor = "#5a17ff";
      g.shadowBlur = 6;
      g.beginPath();
      // newest sample at the top, history flowing down
      for (let i = 0; i < N; i++) {
        const x = w / 2 + buf[(head - 1 - i + N * 2) % N] * w * 0.42;
        const y = (i / (N - 1)) * h;
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
      g.shadowBlur = 0;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-16 border-l wire md:flex">
      <canvas ref={canvas} aria-hidden className="h-full w-full" />
      <div className="absolute inset-y-0 -left-7 flex rotate-180 items-center gap-6 text-xs font-semibold [writing-mode:vertical-rl]">
        <span>
          <span className="mb-2 inline-block h-2 w-2 bg-[var(--spark)]" /> Simulation · one strike per 2 s block
        </span>
        <span ref={readout} className="font-data opacity-80">
          Waiting for first strike…
        </span>
      </div>
    </div>
  );
};
