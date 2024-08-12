# Swift Yield

<h4 align="center">
  <a href="https://swiftyield.vercel.app/">Swift Yield Website</a>
</h4>

<br />

![swiftyield](https://github.com/user-attachments/assets/ee3aad79-58d1-4789-9bdc-874bcac50185)

🧪 Swift Yield is an advanced Flash Loan Arbitrage bot that harnesses the power of flash loans from Balancer to perform arbitrage trading across various decentralized exchanges (DEXs) on **Base Mainnet**

Currently, Three Decentralised Exchanges are integrated 

- ✅ **[Uniswap V2](https://app.uniswap.org/?chain=base)**: Factory Contract Address,	V2Router02 Contract Address can be found **[here](https://docs.uniswap.org/contracts/v2/reference/smart-contracts/v2-deployments)**
  
- 🧱 **[Sushiswap V2](https://www.sushi.com/swap)**: Factory Contract Address, V2Router02 Contract Address can be found **[here](https://docs.uniswap.org/contracts/v2/reference/smart-contracts/v2-deployments)**
  
- 🧱 **[Pankcake Swap V2](https://pancakeswap.finance/info/v2)**: Factory Contract Address, V2Router02 Contract Address can be found **[here](https://docs.pancakeswap.finance/developers/smart-contracts/pancakeswap-exchange/v2-contracts)**

Based on Uniswap V2 Code/Smart Contracts there are 643 Forked Protocols. So we can integrate hundreds of DEX into this bot.

The Flash Loan Smart Contract is deployed on **Tenderly's Base Mainnet Virtual Testnet**. 

You can access the **Public Explorer** from here [https://dashboard.tenderly.co/explorer/vnet/753ba0a6-023a-4c8d-b3e4-60f03d6dc4b7/transactions?kind=standard]

<br />

![tenderly explorer](https://github.com/user-attachments/assets/6e1553e4-ec51-4238-85bb-da554580e8ab)

<br />

One more major component here is **World ID**

World ID is a digital identity solution that enables users to anonymize their uniqueness and humanity via zero-knowledge proofs and advanced privacy-preserving cryptography.

<br />

![worldid](https://github.com/user-attachments/assets/da499d64-c0dd-4eb2-ada1-480aa25c0ca7)

<br />

## For Testing the app 

1. Visit https://swiftyield.vercel.app/ and click on start arbitrage, verify yourself with World ID, then deploy the contract.
   
2. After the contract is deployed copy the contract address.
   
3. Clone this repo and run **yarn install** and then update the contract address in **packages/bot/index.js**

4. Then Run
   
```
node packages/bot/index.js
```

You can then check the transaction here [https://dashboard.tenderly.co/explorer/vnet/753ba0a6-023a-4c8d-b3e4-60f03d6dc4b7/transactions?kind=standard]

The Transaction may fail because of the gas fees issue, we are optimizing the contract code, so until then please rerun 

```
node packages/bot/index.js
```

The bot is currently under testing we will provide it soon.

<br />

## For Setting up Dev Environment 

⚙️ This application is built using **Scaffold Eth 2**.

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

To get started with Swift Yield Development, follow the steps below:

1. Install Tenderly CLI

```
curl https://raw.githubusercontent.com/Tenderly/tenderly-cli/master/scripts/install-macos.sh | sh
```

2.  Then login (create an account first)

```
tenderly login
```

3. Clone this repo & install dependencies

```
git clone https://github.com/SudeepGowda55/SwiftYield.git
cd SwiftYield
yarn install
```

4. To deploy the contract to tenderly:

Create packages/tenderly/.env

```
# https://docs.tenderly.co/account/projects/account-project-slug
TENDERLY_ACCOUNT_ID=
TENDERLY_PROJECT_ID=

# https://docs.tenderly.co/account/projects/how-to-generate-api-access-token
TENDERLY_ACCESS_TOKEN=
```

Create packages/hardhat/.env

```
ALCHEMY_API_KEY= # leave empty
# DEPLOYER_PRIVATE_KEY=
ETHERSCAN_API_KEY= # leave empty

# https://docs.tenderly.co/account/projects/account-project-slug
TENDERLY_ACCOUNT_ID=
TENDERLY_PROJECT_ID=
# https://docs.tenderly.co/account/projects/how-to-generate-api-access-token
TENDERLY_ACCESS_TOKEN=
TENDERLY_AUTOMATIC_VERIFICATIONS=true
```

Create a staging environment

Note: use different environment name (test-1) every time

```
cd packages/tenderly
yarn stage:new test-1 8453
yarn stage:activate test-1
yarn stage:connect:hardhat
yarn stage:connect:nextjs
```

Now deploy the contract by running

```
cd packages/hardhat
yarn deploy --network virtual_mainnet
```
Now the contract will be deployed

5. To start NextJS app:

```
cd packages/nextjs
yarn dev
```

Visit the app on: `http://localhost:3000`. You can tweak the app config in `packages/nextjs/scaffold.config.ts`.

6. Now to interact with the smart contract and perform Flash Loan Arbitrage

Note: update your private key and the newly deployed contract address

```
cd packages/bot
node arbitrageBot.js
```
