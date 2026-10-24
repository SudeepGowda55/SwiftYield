export const SITE = {
  name: "SwiftYield",
  url: "https://swiftyield.vercel.app",
  repo: "https://github.com/SudeepGowda55/SwiftYield",
  explorer:
    "https://dashboard.tenderly.co/explorer/vnet/753ba0a6-023a-4c8d-b3e4-60f03d6dc4b7/transactions?kind=standard",
  tagline: "Flash-loan arbitrage in one block",
  description:
    "No-code flash-loan arbitrage on Base: borrow WETH from Balancer at zero fee, swap across Uniswap, SushiSwap and PancakeSwap, repay in the same transaction.",
};

export const OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 627,
  alt: "SwiftYield — flash-loan arbitrage in one block",
};

export const NAV = [
  { label: "Strike", href: "/" },
  { label: "Mechanism", href: "/how-it-works" },
  { label: "Verify", href: "/authenticate" },
  { label: "Deploy", href: "/arbitrage/base-tenderly" },
];

// Addresses hard-coded in packages/hardhat/contracts/FlashLoan.sol and packages/bot/arbitrageBot.js
export const CONTRACTS = {
  vault: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
  weth: "0x4200000000000000000000000000000000000006",
  dexes: [
    { id: "01", name: "Uniswap V2", router: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24" },
    { id: "02", name: "SushiSwap V2", router: "0x6BDED42c6DA8FBf0d2bA55B2fa120C5e0c8D7891" },
    { id: "03", name: "PancakeSwap V2", router: "0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb" },
  ],
  tokens: [
    { symbol: "DIA", address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb" },
    { symbol: "ZRO", address: "0x6985884C4392D348587B19cb9eAAf157F13271cd" },
  ],
};
