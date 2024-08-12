import { ethers } from "ethers";
import fs from "fs";

const RPC_URL =
  "https://virtual.base.rpc.tenderly.co/753ba0a6-023a-4c8d-b3e4-60f03d6dc4b7";

const abi = JSON.parse(fs.readFileSync("abi.json"));

const provider = new ethers.JsonRpcProvider(RPC_URL);

export async function fecthData(hexData, contractAddress, privateKey) {
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  const hello = await contract.hello();
  console.log(hello);

  const res = await contract.makeFlashLoan(
    ["0x4200000000000000000000000000000000000006"],
    ["1000000000000000000"],
    hexData
  );
  console.log(res);
}
