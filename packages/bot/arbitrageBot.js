import { ethers } from "ethers";
import fs from "fs";
import { contractAddress, privateKey } from "./userDetails.js";
import { fecthData } from "./contractCall.js";

const routerABI = [
  "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
];

const provider = new ethers.JsonRpcProvider(
  "https://base.gateway.tenderly.co/6vvL0AUXcp7G6EoSj73kb2"
);

let count = 7;
let entry = 0;

// Tokens and router addresses
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
const DIA_ADDRESS = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";
const ZRO_ADDRESS = "0x6985884C4392D348587B19cb9eAAf157F13271cd";

const PANCAKESWAP_ROUTER_ADDRESS = "0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb";
const SUSHISWAP_ROUTER_ADDRESS = "0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891";
const UNISWAP_ROUTER_ADDRESS = "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24";

const minPrices = {
  DIA: {
    value: Number.POSITIVE_INFINITY,
    exchange: null,
  },
  ZRO: {
    value: Number.POSITIVE_INFINITY,
    exchange: null,
  },
};

let uniswapReverseCal = 0;
let sushiReverseCal = 0;
let pancakeReverseCal = 0;

async function getPriceFromDex(
  humanFormat,
  fromAddress,
  toAddress,
  routerAddress,
  flag
) {
  const routerInstance = new ethers.Contract(
    routerAddress,
    routerABI,
    provider
  );

  const token = {
    "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb": "DIA",
    "0x4200000000000000000000000000000000000006": "WETH",
    "0x6985884C4392D348587B19cb9eAAf157F13271cd": "ZRO",
  };

  const exchange = {
    "0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb": "PANCAKE",
    "0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891": "SUSHISWAP",
    "0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24": "UNISWAP",
  };

  const amountIn = ethers.parseUnits(humanFormat, 18);
  const amountsOut = await routerInstance.getAmountsOut(amountIn, [
    fromAddress,
    toAddress,
  ]);

  let humanOutput = ethers.formatUnits(amountsOut[1].toString(), 18);

  if (count > 0) {
    let result = humanOutput * 100.0;
    if (token[fromAddress] !== "DIA") {
      console.log(
        `${humanFormat * 100.0} ${token[fromAddress]} = ${result} ${
          token[toAddress]
        } on ${exchange[routerAddress]}`
      );
    }
    count -= 1;

    const zero_zero_one_weth_uni = result.toFixed(3);

    const one_dai_uni = 0.01 / result.toFixed(2);

    const completePrice = one_dai_uni * zero_zero_one_weth_uni;
    //console.log(completePrice);
    entry = entry + 1;
    if (entry == 1) uniswapReverseCal = completePrice;
    else if (entry == 2) sushiReverseCal = completePrice;
    else if (entry == 3) pancakeReverseCal = completePrice;

    return result;
  } else {
    let result = humanOutput * 1.0;
    if (token[fromAddress] !== "DIA") {
      console.log(
        `${humanFormat} ${token[fromAddress]} = ${result} ${token[toAddress]} on ${exchange[routerAddress]}`
      );
    }

    const zero_zero_one_weth_uni = result.toFixed(3);

    const one_dai_uni = humanFormat / result.toFixed(2);

    const completePrice = one_dai_uni * zero_zero_one_weth_uni;
    entry = entry + 1;
    if (entry == (entry % 4 == 0)) uniswapReverseCal = completePrice;
    else if (entry == (entry % 5 == 0)) sushiReverseCal = completePrice;
    else if (entry == (entry % 6 == 0)) pancakeReverseCal = completePrice;

    return result;
  }
}

async function getPriceFromDexReverse(humanFormat) {
  const result = 1.0 / humanFormat;

  return result;
}

async function getPrice(humanFormat, fromToken, toToken, routerAddress, flag) {
  const price = await getPriceFromDex(
    humanFormat,
    fromToken,
    toToken,
    routerAddress,
    flag
  );
  return parseFloat(price); // Convert to number for further calculations
}

async function findBestSwapForward(currentValue) {
  const prices = {};

  prices.uniswapDia = await getPrice(
    currentValue,
    WETH_ADDRESS,
    DIA_ADDRESS,
    UNISWAP_ROUTER_ADDRESS,
    0
  );
  prices.sushiswapDia = await getPrice(
    currentValue,
    WETH_ADDRESS,
    DIA_ADDRESS,
    SUSHISWAP_ROUTER_ADDRESS,
    0
  );
  prices.pancakeswapDia = await getPrice(
    currentValue,
    WETH_ADDRESS,
    DIA_ADDRESS,
    PANCAKESWAP_ROUTER_ADDRESS,
    0
  );

  prices.uniswapZro = await getPrice(
    currentValue,
    WETH_ADDRESS,
    ZRO_ADDRESS,
    UNISWAP_ROUTER_ADDRESS,
    0
  );
  prices.sushiswapZro = await getPrice(
    currentValue,
    WETH_ADDRESS,
    ZRO_ADDRESS,
    SUSHISWAP_ROUTER_ADDRESS,
    0
  );
  prices.pancakeswapZro = await getPrice(
    currentValue,
    WETH_ADDRESS,
    ZRO_ADDRESS,
    PANCAKESWAP_ROUTER_ADDRESS,
    0
  );

  if (prices.uniswapDia < minPrices.DIA.value) {
    minPrices.DIA.value = prices.uniswapDia;
    minPrices.DIA.exchange = "UNISWAP";
  }
  if (prices.sushiswapDia < minPrices.DIA.value) {
    minPrices.DIA.value = prices.sushiswapDia;
    minPrices.DIA.exchange = "SUSHISWAP";
  }
  if (prices.pancakeswapDia < minPrices.DIA.value) {
    minPrices.DIA.value = prices.pancakeswapDia;
    minPrices.DIA.exchange = "PANCAKESWAP";
  }

  if (prices.uniswapZro < minPrices.ZRO.value) {
    minPrices.ZRO.value = prices.uniswapZro;
    minPrices.ZRO.exchange = "UNISWAP";
  }
  if (prices.sushiswapZro < minPrices.ZRO.value) {
    minPrices.ZRO.value = prices.sushiswapZro;
    minPrices.ZRO.exchange = "SUSHISWAP";
  }
  if (prices.pancakeswapZro < minPrices.ZRO.value) {
    minPrices.ZRO.value = prices.pancakeswapZro;
    minPrices.ZRO.exchange = "PANCAKESWAP";
  }

  const maxPriceKey = Object.keys(prices).reduce((maxKey, key) =>
    prices[key] > prices[maxKey] ? key : maxKey
  );

  return maxPriceKey;
}

async function findBestSwapBackward(currentValue, fromToken) {
  const prices = {};

  if (fromToken === DIA_ADDRESS) {
    prices.uniswapDia = await getPrice(
      currentValue,
      DIA_ADDRESS,
      WETH_ADDRESS,
      UNISWAP_ROUTER_ADDRESS,
      1
    );
    prices.sushiswapDia = await getPrice(
      currentValue,
      DIA_ADDRESS,
      WETH_ADDRESS,
      SUSHISWAP_ROUTER_ADDRESS,
      1
    );
    prices.pancakeswapDia = await getPrice(
      currentValue,
      DIA_ADDRESS,
      WETH_ADDRESS,
      PANCAKESWAP_ROUTER_ADDRESS,
      1
    );

    const minDiaValue = minPrices.DIA.value;
    const bestExchange = minPrices.DIA.exchange;

    console.log(
      `Best exchange for DIA swap: ${bestExchange} with value: ${minDiaValue}`
    );
    return { bestExchange, minDiaValue };
  } else if (fromToken === ZRO_ADDRESS) {
    prices.uniswapZro = await getPrice(
      currentValue,
      ZRO_ADDRESS,
      WETH_ADDRESS,
      UNISWAP_ROUTER_ADDRESS,
      1
    );
    prices.sushiswapZro = await getPrice(
      currentValue,
      ZRO_ADDRESS,
      WETH_ADDRESS,
      SUSHISWAP_ROUTER_ADDRESS,
      1
    );
    prices.pancakeswapZro = await getPrice(
      currentValue,
      ZRO_ADDRESS,
      WETH_ADDRESS,
      PANCAKESWAP_ROUTER_ADDRESS,
      1
    );

    // Find the exchange with the minimum ZRO value
    const minZroValue = Math.min(
      prices.uniswapZro,
      prices.sushiswapZro,
      prices.pancakeswapZro
    );
    let bestExchange = "";

    switch (minZroValue) {
      case prices.uniswapZro:
        bestExchange = "Uniswap";
        break;
      case prices.sushiswapZro:
        bestExchange = "Sushiswap";
        break;
      case prices.pancakeswapZro:
        bestExchange = "Pancakeswap";
        break;
    }

    console.log(
      `Best exchange for ZRO swap: ${bestExchange} with value: ${minZroValue}`
    );
    return { bestExchange, minZroValue };
  }

  // If no matching token is found, return the original current value
  return currentValue;
}

async function main() {
  let currentToken = WETH_ADDRESS;
  let currentValue = "0.0001";

  while (true) {
    const bestOption = await findBestSwapForward(currentValue);
    console.log("Best swap forward:", bestOption);

    // Estimate gas cost (replace with actual implementation)
    const gasCost1 = 0.00001;
    console.log("Current value: ", currentValue);
    const [exchange1, token] = bestOption.split(/(?=[A-Z])/);
    const toAddress1 = token === "Dia" ? DIA_ADDRESS : ZRO_ADDRESS;
    console.log(`${WETH_ADDRESS} to ${toAddress1} with ${exchange1}`);
    currentToken = toAddress1;

    currentValue = await getPriceFromDex(
      currentValue,
      WETH_ADDRESS,
      toAddress1,
      {
        uniswap: UNISWAP_ROUTER_ADDRESS,
        sushiswap: SUSHISWAP_ROUTER_ADDRESS,
        pancakeswap: PANCAKESWAP_ROUTER_ADDRESS,
      }[exchange1],
      0
    );

    console.log("Current Value: ", currentValue);

    let temp = parseFloat(currentValue);
    let result = temp - gasCost1;
    currentValue = result.toString();
    console.log("Gas price - 1: ", gasCost1);
    console.log("Current value after forward swap:", currentValue);

    const bestReturnOption = await findBestSwapBackward(
      currentValue,
      toAddress1
    );
    console.log("Best swap backward:", bestReturnOption);

    console.log(`${currentValue} DIA = ${uniswapReverseCal} WETH on UNISWAP`);
    console.log(`${currentValue} DIA = ${sushiReverseCal} WETH on SUSHISWAP`);
    console.log(`${currentValue} DIA = ${pancakeReverseCal} WETH on PANCAKE`);

    const gasCost2 = 0.00002;
    const exchange2 = bestReturnOption.bestExchange;
    console.log(exchange2);
    const toAddress2 = token === "Dia" ? DIA_ADDRESS : ZRO_ADDRESS;
    console.log(`${toAddress2} to ${WETH_ADDRESS} with ${exchange2}`);
    currentToken = toAddress2;

    temp = parseFloat(currentValue);
    result = temp - gasCost2;
    currentValue = result.toString();
    console.log("Gas price - 2: ", gasCost2);

    if (exchange2 === "PANCAKESWAP") {
      currentValue = uniswapReverseCal.toString();
    } else if (exchange2 === "SUSHISWAP") {
      currentValue = sushiReverseCal.toString();
    } else if (exchange2 === "UNISWAP") {
      currentValue = uniswapReverseCal.toString();
    }

    console.log("Final current value:", currentValue);

    //hex string code
    let firstExchange;
    let secondExchange;

    if (exchange1 === "uniswap") {
      firstExchange = "01";
    } else if (exchange1 === "sushiswap") {
      firstExchange = "02";
    } else if (exchange1 === "pancakeswap") {
      firstExchange = "03";
    }

    if (bestReturnOption.bestExchange === "UNISWAP") {
      secondExchange = "01";
    } else if (bestReturnOption.bestExchange === "SUSHISWAP") {
      secondExchange = "02";
    } else if (bestReturnOption.bestExchange === "PANCAKESWAP") {
      secondExchange = "03";
    }

    const SLIPPAGE_TOLERANCE = 0.000009;

    // Then modify these lines
    let token1Expect;
    let token2Expect;

    //bestoption = uniswapDia or uniswapZro

    let tokenNameForContract = bestOption.split("uniswap")[1];
    let swapTokenAddress;
    if (tokenNameForContract === "Dia") {
      swapTokenAddress = "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb";
      token1Expect = Math.floor(26.296235211008788 * 1e18 * SLIPPAGE_TOLERANCE);
      token2Expect = Math.floor(
        (0.00999847908745333 - gasCost2) * 1e18 * SLIPPAGE_TOLERANCE
      );
    } else if (tokenNameForContract === "Zro") {
      swapTokenAddress = "0x6985884C4392D348587B19cb9eAAf157F13271cd";
      token1Expect = Math.floor(26.296345211008788 * 1e18 * SLIPPAGE_TOLERANCE);
      token2Expect = Math.floor(
        (0.00999847908745333 - gasCost2) * 1e18 * SLIPPAGE_TOLERANCE
      );
    }

    console.log("Token1 Expect:", token1Expect);
    console.log("Token2 Expect:", token2Expect);

    let token1ExpectHex = token1Expect.toString(16);

    if (token1ExpectHex.length % 2 !== 0) {
      token1ExpectHex = "0" + token1ExpectHex;
    }

    let token2ExpectHex = token2Expect.toString(16);

    if (token2ExpectHex.length % 2 !== 0) {
      token2ExpectHex = "0" + token2ExpectHex;
    }

    let token1ExpectHexLength =
      token1ExpectHex.length / 2 < 10
        ? "0" + String(token1ExpectHex.length / 2)
        : String(token1ExpectHex.length / 2);
    let token2ExpectHexLength =
      token2ExpectHex.length / 2 < 10
        ? "0" + String(token2ExpectHex.length / 2)
        : String(token2ExpectHex.length / 2);

    const userData =
      "0x" +
      firstExchange +
      secondExchange +
      swapTokenAddress.slice(2) +
      token1ExpectHexLength +
      token2ExpectHexLength +
      token1ExpectHex +
      token2ExpectHex;

    console.log(userData);

    console.log("Hex String", userData);

      try {
      await fetchData(userData.toString(), contractAddress, privateKey);
    } catch (error) {
      console.error(`An error occurred: ${error.message}`);
    }

    console.log(
      "--------------------------------------------------------------"
    );
  }
}

main().catch(console.error);
