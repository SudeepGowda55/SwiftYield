const { ethers } = require("ethers");
const { routerABI } = require("./abi");

const routerAddress = "0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb";
const fromAddress = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";
const toAddress = "0x4200000000000000000000000000000000000006";

const provider = new ethers.JsonRpcProvider("https://base.gateway.tenderly.co/6vvL0AUXcp7G6EoSj73kb2")

const routerInstance = new ethers.Contract(routerAddress, routerABI, provider)

const priceFetch = async (humanFormat) => {

  const amountIn = ethers.parseUnits(humanFormat, 18).toString();
  const amountsOut = await routerInstance.getAmountsOut(amountIn, [fromAddress, toAddress])

  const humanOutput = ethers.formatUnits(amountsOut[1].toString(), 18)

  console.log("This the number of WETH: ", humanOutput)
}

priceFetch("1")