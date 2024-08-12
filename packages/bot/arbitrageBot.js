import { ethers } from "ethers";

const routerABI = ["function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)"]
const provider = new ethers.JsonRpcProvider("https://virtual.base.rpc.tenderly.co/753ba0a6-023a-4c8d-b3e4-60f03d6dc4b7");

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

  // Ensure amountsOut[1] is a BigNumber and format it
  //   const humanOutput = ethers.formatUnits(amountsOut[1], 18);
  //   let result;

  //   if (flag === 0) {
  //     //console.log("Human-readable output:", humanOutput);
  //     result = humanOutput;
  //     console.log(
  //       `${humanFormat} ${token[fromAddress]} = ${humanOutput} ${token[toAddress]} on ${exchange[routerAddress]}`
  //     );
  //   } else {
  //     result = 1.0 / humanOutput;
  //   }

  //   return result;
  let humanOutput = ethers.formatUnits(amountsOut[1].toString(), 18);
  let result = humanOutput * 100.0;
  console.log(
    `${humanFormat} ${token[fromAddress]} = ${result} ${token[toAddress]} on ${exchange[routerAddress]}`
  );

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

    // Subtract the current value from the minimum DIA value
    const remainingValue = currentValue - minPrices.DIA.value;
    console.log(`Remaining Value after DIA swap: ${remainingValue}`);
    return remainingValue;
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

    // Subtract the current value from the minimum ZRO value
    const remainingValue = currentValue - minPrices.ZRO.value;
    console.log(`Remaining Value after ZRO swap: ${remainingValue}`);
    return remainingValue;
  }

  // If no matching token is found, return the original current value
  return currentValue;
}

// async function executeSwap(bestOption) {
//   const [exchange, token] = bestOption.split(/(?=[A-Z])/);

//   const toAddress = token === "Dia" ? DIA_ADDRESS : ZRO_ADDRESS;
//   const fromAddress = WETH_ADDRESS;

//   console.log(`${fromAddress} to ${toAddress} with ${exchange}`);
//   return { exchange, toAddress };
// }

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

    // Estimate gas cost for the backward swap (replace with actual implementation)
    const gasCost2 = 0.00002;
    currentValue = bestReturnOption.toString();
    temp = temp = parseFloat(currentValue);
    result = temp - gasCost2;
    console.log("Final remaining:", result);
    console.log("Current Value: ", currentValue);
    const [exchange2, token2] = bestOption.split(/(?=[A-Z])/);
    const toAddress2 = token === "Dia" ? DIA_ADDRESS : ZRO_ADDRESS;
    console.log(`${toAddress2} to ${WETH_ADDRESS} with ${exchange2}`);
    currentToken = toAddress2;
    currentValue = await getPriceFromDex(
      currentValue,
      currentToken,
      WETH_ADDRESS,
      {
        uniswap: UNISWAP_ROUTER_ADDRESS,
        sushiswap: SUSHISWAP_ROUTER_ADDRESS,
        pancakeswap: PANCAKESWAP_ROUTER_ADDRESS,
      }[exchange2],
      1
    );

    temp = parseFloat(currentValue);
    result = temp - gasCost2;
    currentValue = result.toString();
    console.log("Gas price - 2: ", gasCost2);
    console.log("Final current value:", currentValue);

    console.log(
      "--------------------------------------------------------------"
    );
  }
}

main().catch(console.error);
