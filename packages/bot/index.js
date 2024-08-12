const ethers = require("ethers");
const flashLoanABI = require("./abi.json");

const ContractAddress = "0xebfbc0a9c184c349d6d0cf046885b82cf11b8f8e";
const PrivateKey = "0xcd4c30aefc1eb18a75ada590be78aea2f923ec89643bf94f1a850deab0870138";  // public key 0x2BAB1A3b3567D6670Fe85fAAc8434A15e0084b7F
const RPC_URL = "https://virtual.base.rpc.tenderly.co/753ba0a6-023a-4c8d-b3e4-60f03d6dc4b7";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PrivateKey, provider);

const contract = new ethers.Contract(ContractAddress, flashLoanABI, wallet);

async function executeFlashLoan() {

    // Here WETH Base Mainnet address is considered and 1 WETH will be taken as a loan from Balancer
    // But for testing purpose your contract has already received 1000 WETH

    const hello = await contract.hello();
    console.log(hello);

    const res = await contract.makeFlashLoan(["0x4200000000000000000000000000000000000006"], ["1000000000000000000"], "0x010250c5725949A6F0c72E6C4a641F24049A917DB0Cb01010000");
    console.log(res);

    // const uniswap = await contract.uniswapTokens("0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb", "1000000000000000000", "0x4200000000000000000000000000000000000006", "400000000000000")
    // console.log(uniswap);
}

executeFlashLoan();