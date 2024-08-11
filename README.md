# Swift Yield

<h4 align="center">
  <a href="https://swiftyield.vercel.app/">Swift Yield Website</a>
</h4>

🧪 Swift Yield is an advanced Flash Loan Arbitrage bot that harnesses the power of flash loans from Balancer to perform arbitrage trading across various decentralized exchanges (DEXs) on **Base Mainnet**

Currently, Three Decentralised Exchanges are integrated 
- ✅ **[Uniswap V2](https://app.uniswap.org/?chain=base)**
      Factory Contract Address,	V2Router02 Contract Address can be found here [https://docs.uniswap.org/contracts/v2/reference/smart-contracts/v2-deployments]
  
- 🧱 **[Sushiswap V2](https://www.sushi.com/swap)**
      Factory Contract Address, V2Router02 Contract Address can be found here [https://docs.uniswap.org/contracts/v2/reference/smart-contracts/v2-deployments]
  
- 🧱 [**Pankcake Swap V2**](https://pancakeswap.finance/info/v2)
      Factory Contract Address, V2Router02 Contract Address can be found here [https://docs.pancakeswap.finance/developers/smart-contracts/pancakeswap-exchange/v2-contracts]

Based on Uniswap V2 Code/Smart Contracts there are 643 Forked Protocols. So we can integrate hundreds of DEX into this bot.

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and Typescript.

The Flash Loan Smart Contract is deployed on Tenderly's Base Mainnet Virtual Testnet. You can access the Public Explorer from here[https://dashboard.tenderly.co/explorer/vnet/753ba0a6-023a-4c8d-b3e4-60f03d6dc4b7/transactions?kind=standard]

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Scaffold-ETH 2, follow the steps below:

1. Clone this repo & install dependencies

```
git clone https://github.com/scaffold-eth/scaffold-eth-2.git
cd scaffold-eth-2
yarn install
```

2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network using Hardhat. The network runs on your local machine and can be used for testing and development. You can customize the network configuration in `hardhat.config.ts`.

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

**What's next**:

- Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`
- Edit your frontend homepage at `packages/nextjs/app/page.tsx`. For guidance on [routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes) and configuring [pages/layouts](https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts) checkout the Next.js documentation.
- Edit `packages/hardhat/hardhat.config.ts` to enable [verification on Tenderly](https://docs.tenderly.co/contract-verification/hardhat) (`automaticVerifications: true`).
- Edit your deployment scripts in `packages/hardhat/deploy`
- Edit your smart contract test in: `packages/hardhat/test`. To run test use `yarn hardhat:test`

## Connecting to Tenderly TestNet

1. Clone this repo & install dependencies

```
git clone https://github.com/scaffold-eth/scaffold-eth-2.git
cd scaffold-eth-2
yarn install
```

2. Configure the TestNet

- Edit `packages/hardhat/hardhat.config.ts` and copy the correct snippet from [**Virtual TestNets > Integrations**](https://dashboard.tenderly.co/project/virtual-testnets/integrations)
- 

3. 
