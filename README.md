# Swift Yield

<h4 align="center">
  <a href="https://swiftyield.vercel.app/">Swift Yield Website</a>
</h4>

🧪 Swift Yield is an advanced Flash Loan Arbitrage bot that harnesses the power of flash loans from Balancer to perform arbitrage trading across various decentralized exchanges (DEXs) on **Base Mainnet**

Currently, Three Decentralised Exchanges are integrated 

- ✅ **[Uniswap V2](https://app.uniswap.org/?chain=base)**: Factory Contract Address,	V2Router02 Contract Address can be found **[here](https://docs.uniswap.org/contracts/v2/reference/smart-contracts/v2-deployments)**
  
- 🧱 **[Sushiswap V2](https://www.sushi.com/swap)**: Factory Contract Address, V2Router02 Contract Address can be found **[here](https://docs.uniswap.org/contracts/v2/reference/smart-contracts/v2-deployments)**
  
- 🧱 **[Pankcake Swap V2](https://pancakeswap.finance/info/v2)**: Factory Contract Address, V2Router02 Contract Address can be found **[here](https://docs.pancakeswap.finance/developers/smart-contracts/pancakeswap-exchange/v2-contracts)**

Based on Uniswap V2 Code/Smart Contracts there are 643 Forked Protocols. So we can integrate hundreds of DEX into this bot.

The Flash Loan Smart Contract is deployed on **Tenderly's Base Mainnet Virtual Testnet**. 

You can access the **Public Explorer** from here [https://dashboard.tenderly.co/explorer/vnet/753ba0a6-023a-4c8d-b3e4-60f03d6dc4b7/transactions?kind=standard]

One more major component here is **World ID**

World ID is a digital identity solution that enables users to anonymize their uniqueness and humanity via zero-knowledge proofs and advanced privacy-preserving cryptography.

## For Testing the app 

1. Visit https://swiftyield.vercel.app/ and click on start arbitrage, verify yourself with World ID, then deploy the contract.
   
2. After the contract is deployed refresh the page, and copy the contract address.
   
3. Clone this repo and run **yarn install** and then update the contract address in **packages/bot/index.js**

4. Run **node packages/bot/index.js**

You can then check the transaction here [https://dashboard.tenderly.co/explorer/vnet/753ba0a6-023a-4c8d-b3e4-60f03d6dc4b7/transactions?kind=standard]

The Transaction may fail because of the gas fees issue, we are optimizing the contract code, so until then please rerun **node packages/bot/index.js**

The bot is currently under testing.

## For Setting up Dev Environment 

⚙️ This application is built using **Scaffold Eth 2**.

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Swift Yield, follow the steps below:

1. Install Tenderly CLI

```
   curl https://raw.githubusercontent.com/Tenderly/tenderly-cli/master/scripts/install-macos.sh | sh
```

3.  Then login (create account first)

```
 tenderly login
```

1. Clone this repo & install dependencies

```
git clone https://github.com/SudeepGowda55/SwiftYield.git
cd SwiftYield
yarn install
```

2. To deploy the contract to tenderly:

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
