"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { abi, bytecode } from "./contract";
import { ethers } from "ethers";

const Page = () => {
  const provider = new ethers.JsonRpcProvider(
    "https://virtual.base.rpc.tenderly.co/cfbeb8a7-657c-49e4-a7b3-740612a2c4a3",
  );
  const signer = new ethers.Wallet("cd4c30aefc1eb18a75ada590be78aea2f923ec89643bf94f1a850deab0870138", provider);
  const userAddress = "0x2BAB1A3b3567D6670Fe85fAAc8434A15e0084b7F";
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [flashLoanTxHash, setFlashLoanTxHash] = useState<string | null>(null);

  const deployContract = async () => {
    const flashLoanContract = new ethers.ContractFactory(abi, bytecode, signer);
    try {
      const contract = await flashLoanContract.deploy();
      console.log(contract.deploymentTransaction()?.hash);
      // console.log(await contract.deploymentTransaction()?.wait());
      console.log("printing address", contract.target);
      localStorage.setItem("flashloanAddress", String(contract.target));
      localStorage.setItem("flashloantxhash", String(contract.deploymentTransaction()?.hash));
    } catch (error) {
      console.error(error);
    }
  };

  const getFunds = async () => {
    try {
      const funds = await provider.send("tenderly_setBalance", [userAddress, "0x56BC75E2D63100000"]);
      console.log("sent 100 eth", funds);
      const wethFund = await provider.send("tenderly_setErc20Balance", [
        "0x4200000000000000000000000000000000000006",
        userAddress,
        "0xDE0B6B3A7640000",
      ]);
      console.log("received wethFund", wethFund);
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
    <div>
      <div>
        <p>To run the Flash Loan Arbitrage Bot</p>
        <p> You need to deploy a FlashLoan Contract</p>
        <p>And you need to run a bot</p>
      </div>

      <div>
        <p>Before you deploy the contract make sure you have sufficinet funds </p>
        <p> Get 100 ETH from the faucet</p>
      </div>
      <div>
        <button onClick={deployContract}>Deploy contract</button>
      </div>
      <div>
        <div>
          {contractAddress != null ? (
            <p>
              {" "}
              Your Flash Loan contract address is deployed at{" "}
              <Link
                href={`https://dashboard.tenderly.co/explorer/vnet/753ba0a6-023a-4c8d-b3e4-60f03d6dc4b7/tx/${flashLoanTxHash}`}
                target="_blank"
              >
                {contractAddress}
              </Link>
            </p>
          ) : (
            ""
          )}
        </div>
      </div>
      <div>
        <button onClick={getFunds}>Get funds</button>
      </div>
      <div>
        <div>
          After the contract is deployed you need to this bot script and provide it with Flash Loan contract address and
          private key which has sufficient eth to fund transaction gas fee
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default Page;
