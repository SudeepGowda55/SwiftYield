"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { abi, bytecode } from "./contract";
import { ethers } from "ethers";

const Page = () => {
  const provider = new ethers.JsonRpcProvider(
    "https://virtual.base.rpc.tenderly.co/cfbeb8a7-657c-49e4-a7b3-740612a2c4a3",
  );
  const signer = new ethers.Wallet("0xcd4c30aefc1eb18a75ada590be78aea2f923ec89643bf94f1a850deab0870138", provider);
  const userAddress = "0x2BAB1A3b3567D6670Fe85fAAc8434A15e0084b7F";
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [flashLoanTxHash, setFlashLoanTxHash] = useState<string | null>(null);

  const deployContract = async () => {
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
    }
  };

  const getFunds = async () => {
    try {
      await provider.send("tenderly_setBalance", [userAddress, "0x56BC75E2D63100000"]);
      alert("Your account received 100 WETH");
    } catch (error) {
      console.error(error);
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

  return (
    <div className="p-6 font-sans min-h-screen flex flex-col justify-center items-center">
      {/* Grid Layout for Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {/* Left Section */}
        <div className="flex flex-col items-center gap-4">
          {/* Instructions */}
          <div className="p-4 border rounded shadow-md bg-white text-black w-full flex-1">
            <p className="text-lg font-bold">To run the Flash Loan Arbitrage Bot</p>
            <p>You need to deploy a FlashLoan Contract</p>
            <p>And you need to run a bot</p>
          </div>

          {/* Deploy Contract Button */}
          <button
            onClick={deployContract}
            className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            Deploy contract
          </button>
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-center gap-4">
          {/* Funds Instructions */}
          <div className="p-4 border rounded shadow-md bg-white text-black w-full flex-1">
            <p>Before you deploy the contract make sure you have sufficient funds</p>
            <p>Get 100 ETH from the faucet</p>
          </div>

          {/* Get Funds Button */}
          <button onClick={getFunds} className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
            Get funds
          </button>
        </div>
      </div>

      {/* Additional Content Centered */}
      <div className="mt-8 text-center max-w-2xl">
        <p>
          After the contract is deployed, you need to run this bot script and provide it with the Flash Loan contract
          address and a private key that has sufficient ETH to fund transaction gas fees.
        </p>
        {contractAddress && (
          <p className="mt-4">
            Your Flash Loan contract address is deployed at{" "}
            <Link
              href={`https://dashboard.tenderly.co/explorer/vnet/753ba0a6-023a-4c8d-b3e4-60f03d6dc4b7/tx/${flashLoanTxHash}`}
              target="_blank"
              className="text-blue-500 underline"
            >
              {contractAddress}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Page;
