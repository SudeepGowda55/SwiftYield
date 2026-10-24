"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { verify } from "../api/verify";
import { IDKitWidget, type ISuccessResult, VerificationLevel } from "@worldcoin/idkit";
import { Flicker } from "~~/components/motion/Flicker";
import { Magnetic } from "~~/components/motion/Magnetic";
import { TransitionLink } from "~~/components/motion/PageTransition";
import { Reveal } from "~~/components/motion/Reveal";

/** Plasma orb: arcs crackle out of the sphere and reach for the pointer, a human conductor. */
const PlasmaOrb = () => {
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const el = svg.current!;
    const arcs = Array.from(el.querySelectorAll<SVGPathElement>(".arc"));
    const aim = { x: 200, y: 40 };
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const move = (e: PointerEvent) => {
      const b = el.getBoundingClientRect();
      aim.x = ((e.clientX - b.left) / b.width) * 400;
      aim.y = ((e.clientY - b.top) / b.height) * 400;
    };
    const draw = () => {
      const base = Math.atan2(aim.y - 200, aim.x - 200);
      arcs.forEach((p, i) => {
        const a = base + (i - (arcs.length - 1) / 2) * 0.42 + (Math.random() - 0.5) * 0.3;
        const reach = 150 + Math.random() * 30;
        let d = `M${200 + Math.cos(a) * 46},${200 + Math.sin(a) * 46}`;
        for (let k = 1; k <= 8; k++) {
          const r = 46 + ((reach - 46) * k) / 8;
          const w = a + (Math.random() - 0.5) * 0.35;
          d += ` L${(200 + Math.cos(w) * r).toFixed(1)},${(200 + Math.sin(w) * r).toFixed(1)}`;
        }
        p.setAttribute("d", d);
      });
    };
    draw();
    if (reduce) return;
    const id = setInterval(draw, 70);
    window.addEventListener("pointermove", move);
    return () => {
      clearInterval(id);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <svg
      ref={svg}
      viewBox="0 0 400 400"
      className="w-full max-w-[440px]"
      role="img"
      aria-label="Plasma orb whose arcs reach toward your pointer"
    >
      <circle cx="200" cy="200" r="182" fill="none" stroke="var(--wire)" />
      <circle cx="200" cy="200" r="182" fill="none" stroke="var(--ink)" strokeDasharray="1 9" />
      {Array.from({ length: 5 }, (_, i) => (
        <path
          key={i}
          className="arc"
          fill="none"
          stroke="var(--ink)"
          strokeWidth={i === 2 ? 2 : 1.2}
          strokeLinejoin="bevel"
          style={{ filter: "drop-shadow(0 0 5px #5a17ff)" }}
        />
      ))}
      <circle cx="200" cy="200" r="46" fill="var(--ink)" />
      <circle cx="200" cy="200" r="20" fill="var(--spark)" />
    </svg>
  );
};

const Worldcoin = () => {
  const router = useRouter();

  const onSuccess = () => {
    router.push("/arbitrage/base-tenderly");
  };

  const handleProof = async (result: ISuccessResult) => {
    console.log("Proof received from IDKit, sending to backend: \n", JSON.stringify(result));
    const data = await verify(result); // sending the data to web backend
    if (data.success) {
      console.log("Successful response from backend:\n", JSON.stringify(data)); // Log the response from our backend for visibility
    } else {
      throw new Error(`Verification failed: ${data.detail}`);
    }
  };

  return (
    <div className="page py-14 sm:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <Flicker
            as="h1"
            text="Only humans hold the charge."
            hot={["humans"]}
            className="font-display text-[11vw] font-extrabold leading-[0.82] sm:text-8xl lg:text-[8.5rem]"
          />
          <p className="max-w-lg text-lg text-[var(--ink-dim)]">
            Please confirm your identity by verifying that you are a human. This step helps us prevent automated access
            and maintain security.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <IDKitWidget
              app_id="app_staging_1c7e9401f6b5e43c4f649812c0c4ef76"
              action="cloud-verification"
              onSuccess={onSuccess}
              handleVerify={handleProof}
              verification_level={VerificationLevel.Orb}
            >
              {({ open }) => (
                <Magnetic>
                  <button className="strike-btn" onClick={open}>
                    Verify with World ID <span aria-hidden>→</span>
                  </button>
                </Magnetic>
              )}
            </IDKitWidget>
            <Link href={"https://simulator.worldcoin.org/id/0x18310f83"} target="_blank" className="strike-btn-ghost">
              Worldcoin simulator ↗
            </Link>
          </div>
        </div>
        <div className="flex justify-center">
          <PlasmaOrb />
        </div>
      </div>

      <Reveal className="mt-16 grid gap-4 md:grid-cols-3">
        <div className="plate">
          <span className="font-display text-5xl font-extrabold text-[var(--spark)]">1</span>
          <h2 className="font-display mt-4 text-3xl font-extrabold">Worldcoin verification</h2>
          <p className="text-[var(--ink-dim)]">
            Verify your identity using the Worldcoin simulator. It checks the authenticity of user identities with
            zero-knowledge proofs.
          </p>
        </div>
        <div className="plate">
          <span className="font-display text-5xl font-extrabold text-[var(--spark)]">2</span>
          <h2 className="font-display mt-4 text-3xl font-extrabold">Scan or paste the code</h2>
          <p className="text-[var(--ink-dim)]">
            Scan the QR code from the simulator, or click the QR code to copy it, choose paste code in the simulator,
            pick verify with orb and wait until verification is done.
          </p>
        </div>
        <div className="plate !bg-[var(--ink)] text-[var(--cream)]">
          <span className="font-display text-5xl font-extrabold">3</span>
          <h2 className="font-display mt-4 text-3xl font-extrabold">Orb and device verified</h2>
          <p>
            Make sure the identity is orb and device verified. If you can&apos;t verify right now, skip to the{" "}
            <TransitionLink href="/arbitrage/base-tenderly" className="font-bold underline underline-offset-4">
              Flash Loan contract deploy page
            </TransitionLink>
            .
          </p>
        </div>
      </Reveal>
    </div>
  );
};

export default Worldcoin;
