"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { verify } from "../api/verify";
import { IDKitWidget, type ISuccessResult, VerificationLevel } from "@worldcoin/idkit";
import gsap from "gsap";
import { Magnetic } from "~~/components/motion/Magnetic";
import { TransitionLink } from "~~/components/motion/PageTransition";
import { Reveal } from "~~/components/motion/Reveal";
import { SplitHeading } from "~~/components/motion/SplitHeading";

/** Orb that watches the pointer: World ID's iris scan, drawn in ink and volt. */
const Orb = () => {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current!;
    const ctx = gsap.context(() => {
      gsap.to(".orb-ring", {
        rotate: i => (i % 2 ? -360 : 360),
        duration: i => 18 + i * 6,
        repeat: -1,
        ease: "none",
        svgOrigin: "200 200",
      });
      gsap.to(".orb-scan", { attr: { y: 300 }, duration: 2.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
    }, svg);
    const px = gsap.quickTo(svg.querySelector(".orb-pupil"), "x", { duration: 0.6, ease: "power3" });
    const py = gsap.quickTo(svg.querySelector(".orb-pupil"), "y", { duration: 0.6, ease: "power3" });
    const move = (e: PointerEvent) => {
      const b = svg.getBoundingClientRect();
      const dx = e.clientX - (b.left + b.width / 2);
      const dy = e.clientY - (b.top + b.height / 2);
      const k = Math.min(1, 300 / Math.hypot(dx, dy || 1));
      px(dx * 0.06 * k);
      py(dy * 0.06 * k);
    };
    window.addEventListener("pointermove", move);
    return () => {
      ctx.revert();
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <svg
      ref={ref}
      viewBox="0 0 400 400"
      className="w-full max-w-[420px]"
      role="img"
      aria-label="Animated orb scanning for proof of personhood"
    >
      <defs>
        <clipPath id="orb-clip">
          <circle cx="200" cy="200" r="110" />
        </clipPath>
      </defs>
      {[180, 150, 128].map((r, i) => (
        <circle
          key={r}
          className="orb-ring"
          cx="200"
          cy="200"
          r={r}
          fill="none"
          stroke="#0e0e10"
          strokeWidth={i === 0 ? 1 : 2}
          strokeDasharray={i === 0 ? "2 10" : i === 1 ? "60 14" : "4 6"}
        />
      ))}
      <circle cx="200" cy="200" r="110" fill="#f7f5ef" stroke="#0e0e10" strokeWidth="2" />
      <g clipPath="url(#orb-clip)">
        <g className="orb-pupil">
          <circle cx="200" cy="200" r="58" fill="#d9ff3d" stroke="#0e0e10" strokeWidth="2" />
          <circle cx="200" cy="200" r="26" fill="#0e0e10" />
          <circle cx="212" cy="188" r="7" fill="#f7f5ef" />
        </g>
        <rect className="orb-scan" x="80" y="100" width="240" height="3" fill="#ff5a1f" opacity="0.8" />
      </g>
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
    <div className="wrap py-16 sm:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="label">03 · Verify</span>
          <SplitHeading
            as="h1"
            text="Prove you're human. Then the loop is yours."
            accent={["human."]}
            className="font-display mt-4 text-[10vw] sm:text-6xl font-bold leading-[0.95]"
          />
          <p className="max-w-lg text-lg text-[var(--ink-2)]">
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
                  <button className="cta" onClick={open}>
                    Verify with World ID <span aria-hidden>→</span>
                  </button>
                </Magnetic>
              )}
            </IDKitWidget>
            <Link href={"https://simulator.worldcoin.org/id/0x18310f83"} target="_blank" className="ghost-link">
              Worldcoin simulator ↗
            </Link>
          </div>
        </div>
        <div className="flex justify-center">
          <Orb />
        </div>
      </div>

      <Reveal className="mt-16 grid gap-4 md:grid-cols-3">
        <div className="ticket">
          <span className="label">01 · Simulator</span>
          <h2 className="font-display mt-6 text-xl font-bold">Worldcoin verification</h2>
          <p className="text-[var(--ink-2)]">
            Verify your identity using the Worldcoin simulator. It checks the authenticity of user identities with
            zero-knowledge proofs.
          </p>
        </div>
        <div className="ticket">
          <span className="label">02 · Scan</span>
          <h2 className="font-display mt-6 text-xl font-bold">Scan or paste the code</h2>
          <p className="text-[var(--ink-2)]">
            Scan the QR code from the simulator, or click the QR code to copy it, choose paste code in the simulator,
            pick verify with orb and wait until verification is done.
          </p>
        </div>
        <div className="ticket" style={{ background: "var(--volt)" }}>
          <span className="label !text-[var(--ink)]">03 · Requirement</span>
          <h2 className="font-display mt-6 text-xl font-bold">Orb and device verified</h2>
          <p>
            Make sure the identity is orb and device verified. If you can&apos;t verify right now, skip to the{" "}
            <TransitionLink href="/arbitrage/base-tenderly" className="font-semibold underline underline-offset-4">
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
