"use client";

import React from "react";
import { abi, bytecode } from "./contract";
import { ethers } from "ethers";

const page = () => {
  const provider = new ethers.JsonRpcProvider("https://sepolia.gateway.tenderly.co/6peYyd1tySn6BPMqtUs4OE");
  const signer = new ethers.Wallet("cd4c30aefc1eb18a75ada590be78aea2f923ec89643bf94f1a850deab0870138", provider);

  // public address 0x2BAB1A3b3567D6670Fe85fAAc8434A15e0084b7F

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
