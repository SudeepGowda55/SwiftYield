"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { abi, bytecode } from "./contract";
import { ethers } from "ethers";
import { Magnetic } from "~~/components/motion/Magnetic";
import { Reveal } from "~~/components/motion/Reveal";
import { SplitHeading } from "~~/components/motion/SplitHeading";

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
      n: "01",
      title: "Fund the deployer",
      body: "Before you deploy the contract make sure you have sufficient funds. Get 100 ETH from the faucet.",
      action: "Get funds",
      onClick: getFunds,
      key: "funds" as const,
    },
    {
      n: "02",
      title: "Deploy FlashLoan.sol",
      body: "To run the Flash Loan Arbitrage Bot you need to deploy a FlashLoan contract, and you need to run a bot.",
      action: "Deploy contract",
      onClick: deployContract,
      key: "deploy" as const,
    },
  ];

  return (
    <div className="wrap py-16 sm:py-24">
      <span className="label">04 · Deploy · Tenderly Base vnet</span>
      <SplitHeading
        as="h1"
        text="Deploy your loop contract."
        accent={["loop"]}
        className="font-display mt-4 max-w-4xl text-[10vw] sm:text-6xl lg:text-7xl font-bold leading-[0.95]"
      />

      <Reveal className="mt-12 grid gap-4 md:grid-cols-2">
        {steps.map(s => (
          <div key={s.n} className="ticket flex flex-col">
            <div className="flex items-center justify-between">
              <span className="label">Step {s.n}</span>
              {busy === s.key && <span className="chip !text-[var(--loan)]">Pending…</span>}
            </div>
            <h2 className="font-display mt-6 text-2xl font-bold">{s.title}</h2>
            <p className="flex-1 text-[var(--ink-2)]">{s.body}</p>
            <div>
              <Magnetic>
                <button
                  onClick={s.onClick}
                  disabled={busy !== null}
                  className={`cta ${s.key === "deploy" ? "cta-volt" : ""} disabled:opacity-50`}
                >
                  {s.action} <span aria-hidden>→</span>
                </button>
              </Magnetic>
            </div>
          </div>
        ))}
      </Reveal>

      <Reveal className="mt-4 grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <div className="ticket" style={{ background: "var(--ink)", color: "var(--paper)" }}>
          <span className="label !text-white/50">Your contract</span>
          {contractAddress ? (
            <p className="font-mono text-sm break-all">
              Your Flash Loan contract address is deployed at{" "}
              <Link
                href={`https://dashboard.tenderly.co/explorer/vnet/753ba0a6-023a-4c8d-b3e4-60f03d6dc4b7/tx/${flashLoanTxHash}`}
                target="_blank"
                className="text-[var(--volt)] underline underline-offset-4"
              >
                {contractAddress}
              </Link>
            </p>
          ) : (
            <p className="font-mono text-sm opacity-60">No contract deployed from this browser yet.</p>
          )}
        </div>
        <div className="ticket">
          <span className="label">Step 03 · Run the bot</span>
          <p>
            After the contract is deployed, clone the{" "}
            <Link href={README} target="_blank" className="font-semibold underline underline-offset-4">
              Swift Yield repo
            </Link>
            , then follow the{" "}
            <Link href={README} target="_blank" className="font-semibold underline underline-offset-4">
              instructions for testing the app
            </Link>{" "}
            and provide it with the newly deployed Flash Loan contract address.
          </p>
          <code className="chip">yarn install && yarn bot</code>
        </div>
      </Reveal>
    </div>
  );
};

export default Page;
