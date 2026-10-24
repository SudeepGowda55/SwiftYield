"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { abi, bytecode } from "./contract";
import { ethers } from "ethers";
import { Flicker } from "~~/components/motion/Flicker";
import { Magnetic } from "~~/components/motion/Magnetic";
import { Reveal } from "~~/components/motion/Reveal";

const README = "https://github.com/SudeepGowda55/SwiftYield?tab=readme-ov-file#for-testing-the-app";

const Page = () => {
  const provider = new ethers.JsonRpcProvider(
    "https://virtual.base.rpc.tenderly.co/cfbeb8a7-657c-49e4-a7b3-740612a2c4a3",
  );
  const signer = new ethers.Wallet("0xcd4c30aefc1eb18a75ada590be78aea2f923ec89643bf94f1a850deab0870138", provider);
  const userAddress = "0x2BAB1A3b3567D6670Fe85fAAc8434A15e0084b7F";
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [flashLoanTxHash, setFlashLoanTxHash] = useState<string | null>(null);
  const [busy, setBusy] = useState<"funds" | "deploy" | null>(null);

  const deployContract = async () => {
    setBusy("deploy");
    const flashLoanContract = new ethers.ContractFactory(abi, bytecode, signer);
    try {
      const contract = await flashLoanContract.deploy();
      const addr = await contract.getAddress();
      const wethFund = await provider.send("tenderly_setErc20Balance", [
        "0x4200000000000000000000000000000000000006",
        addr,
        "0x21E19E0C9BAB2400000",
      ]);
      console.log("Contract received wethFund", wethFund);
      localStorage.setItem("flashloanAddress", String(contract.target));
      localStorage.setItem("flashloantxhash", String(contract.deploymentTransaction()?.hash));
      alert("Flash Loan contract deployed successfully, Please refresh the page to see the contract address");
    } catch (error) {
      console.error(error);
    } finally {
      setBusy(null);
    }
  };

  const getFunds = async () => {
    setBusy("funds");
    try {
      await provider.send("tenderly_setBalance", [userAddress, "0x56BC75E2D63100000"]);
      alert("Your account received 100 WETH");
    } catch (error) {
      console.error(error);
    } finally {
      setBusy(null);
    }
  };

  useEffect(() => {
    if (localStorage) {
      const addr = localStorage.getItem("flashloanAddress");
      const hash = localStorage.getItem("flashloantxhash");
      if (addr != null && hash != null) {
        setContractAddress(addr);
        setFlashLoanTxHash(hash);
      }
    }
  }, [contractAddress]);

  const steps = [
    {
      n: 1,
      title: "Fund the deployer",
      body: "Before you deploy the contract make sure you have sufficient funds. Get 100 ETH from the faucet.",
      action: "Get funds",
      onClick: getFunds,
      key: "funds" as const,
    },
    {
      n: 2,
      title: "Deploy FlashLoan.sol",
      body: "To run the Flash Loan Arbitrage Bot you need to deploy a FlashLoan contract, and you need to run a bot.",
      action: "Deploy contract",
      onClick: deployContract,
      key: "deploy" as const,
    },
  ];

  return (
    <div className="page py-14 sm:py-24">
      <Flicker
        as="h1"
        text="Build your lightning rod."
        hot={["rod."]}
        className="font-display max-w-5xl text-[11vw] font-extrabold leading-[0.82] sm:text-8xl lg:text-[9rem]"
      />
      <p className="max-w-xl text-lg text-[var(--ink-dim)]">
        Deploy your own FlashLoan contract on the Tenderly Base virtual testnet. Every strike the bot fires runs through
        it.
      </p>

      <Reveal className="mt-12 grid gap-4 md:grid-cols-2">
        {steps.map(s => (
          <div key={s.n} className="plate flex flex-col">
            <span className="font-display text-5xl font-extrabold text-[var(--spark)]">{s.n}</span>
            <h2 className="font-display mt-4 text-2xl sm:text-3xl font-extrabold">{s.title}</h2>
            <p className="flex-1 text-[var(--ink-dim)]">{s.body}</p>
            {/* charging bar while the RPC call is pending */}
            <div className="mb-5 h-1 overflow-hidden bg-[var(--wire)]" aria-hidden>
              {busy === s.key && (
                <div className="h-full w-1/3 animate-[charge_0.9s_ease-in-out_infinite] bg-[var(--spark)]" />
              )}
            </div>
            <div>
              <Magnetic>
                <button
                  onClick={s.onClick}
                  disabled={busy !== null}
                  className={`${s.key === "deploy" ? "strike-btn" : "strike-btn-ghost"} disabled:opacity-50`}
                >
                  {busy === s.key ? "Charging…" : s.action} <span aria-hidden>→</span>
                </button>
              </Magnetic>
            </div>
          </div>
        ))}
      </Reveal>

      <Reveal className="mt-4 grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="border wire bg-[var(--field-deep)] p-6 sm:p-8">
          <h2 className="font-display text-3xl font-extrabold">Your contract</h2>
          {contractAddress ? (
            <p className="font-data break-all text-sm">
              Your Flash Loan contract address is deployed at{" "}
              <Link
                href={`https://dashboard.tenderly.co/explorer/vnet/753ba0a6-023a-4c8d-b3e4-60f03d6dc4b7/tx/${flashLoanTxHash}`}
                target="_blank"
                className="font-bold underline underline-offset-4"
              >
                {contractAddress}
              </Link>
            </p>
          ) : (
            <p className="font-data text-sm text-[var(--ink-dim)]">No contract deployed from this browser yet.</p>
          )}
        </div>
        <div className="plate">
          <h2 className="font-display text-3xl font-extrabold">3 · Run the bot</h2>
          <p>
            After the contract is deployed, clone the{" "}
            <Link href={README} target="_blank" className="font-bold underline underline-offset-4">
              Swift Yield repo
            </Link>
            , then follow the{" "}
            <Link href={README} target="_blank" className="font-bold underline underline-offset-4">
              instructions for testing the app
            </Link>{" "}
            and provide it with the newly deployed Flash Loan contract address.
          </p>
          <code className="font-data tag">yarn install && yarn bot</code>
        </div>
      </Reveal>
    </div>
  );
};

export default Page;
