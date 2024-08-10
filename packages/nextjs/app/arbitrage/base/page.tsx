"use client";

import React from "react";
import { abi, bytecode } from "./contract";
import { ethers } from "ethers";

const page = () => {
  const provider = new ethers.JsonRpcProvider("https://sepolia.gateway.tenderly.co/6peYyd1tySn6BPMqtUs4OE");
  const signer = new ethers.Wallet("", provider);

  const deployContract = async () => {
    const flashLoanContract = new ethers.ContractFactory(abi, bytecode, signer);
    try {
      const contract = await flashLoanContract.deploy();
      console.log(await contract.deploymentTransaction()?.wait());
      console.log(await contract.getAddress);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div>
        <button onClick={deployContract}>Deploy</button>
      </div>
    </div>
  );
};

export default page;
