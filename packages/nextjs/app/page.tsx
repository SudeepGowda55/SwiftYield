"use client";

import Link from "next/link";
import type { NextPage } from "next";
// import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

//import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  return (
    <>
      <div className="bg-black">
        <div className="max-w-7xl mx-auto pt-20 px-6">
          <div className="flex flex-col items-center mt-6 lg:mt-20">
            <h1 className="text-4xl sm:text-6xl lg:text-8xl text-center tracking-wide font-bold text-slate-300">
              {" "}
              Welcome to{" "}
              <span className="bg-gradient-to-r from-blue-500 to-blue-700 text-transparent bg-clip-text">
                {" "}
                FlashBot!
              </span>{" "}
            </h1>

            <p className="mt-10 text-2xl text-center text-gray-400">
              FlashBot is a pioneering no-code arbitrage trading bot designed to harness the power of flash loans. It
              offers a seamless and risk-free way to capitalize on on-chain arbitrage opportunities. With FlashBot,
              users benefit from automatic pair matching and efficient routing, ensuring optimal execution of trades.
            </p>
            <div className="flex justify-center my-10 sm:w-full md:w-full">
              <a
                href="/authenticate"
                className=" text-xl bg-black text-white py-6 px-8 mx-6 border rounded-2xl hover:bg-slate-500"
              >
                {" "}
                Start Arbitrage{" "}
              </a>
            </div>
          </div>
        </div>
        <div className="bg-black flex justify-center">
          <img
            src="https://pandatechie.in/wp-content/uploads/2021/10/Flash-Loans.png"
            className="w-screen h-auto p-10 m-6"
            alt="flashloan image"
          />
        </div>

        <div className="flex flex-col w-full items-center text-center mt-6">
          <h1 className="text-6xl bg-gradient-to-r from-white to-slate-200 text-transparent bg-clip-text">
            Advantages
          </h1>
          <h1 className="bg-gradient-to-r from-blue-500 to-blue-700 text-5xl text-transparent bg-clip-text p-4">
            Flash Loan
          </h1>
          <p className="text-gray-400 text-2xl">
            {" "}
            Just select a network (ETH or Base) and enter a token address to launch this arbitrage finder
          </p>

          <div className="bg-black lg:mx-20 mx-10">
            <div className="text-center">
              <div className="py-12 w-full flex flex-col gap-4 lg:flex-row lg:gap-8 justify-items-center">
                <div className="w-full lg:w-1/3 border border-gray-200 bg-white px-4 py-6 text-black rounded-xl hover:border-2 hover:border-blue-600 hover:shadow-blue-500/50 transition-all">
                  <h2 className="p-4 text-3xl sm:text-4xl font-bold">Add Icon</h2>
                  <h2 className="p-4 text-3xl sm:text-4xl font-bold">Lucrative Opportunities</h2>
                  <p className="text-base sm:text-lg md:text-xl text-slate-800">
                    Flash Loan Arbitrage bots capitalize on price differences across decentralized platforms, offering a
                    high potential for profit without substantial capital investment.
                  </p>
                </div>
                <div className="w-full lg:w-1/3 border border-gray-200 bg-white px-4 py-6 text-black rounded-xl hover:border-2 hover:border-blue-600 hover:shadow-blue-500/50 transition-all">
                  <h2 className="p-4 text-3xl sm:text-4xl font-bold">Add Icon</h2>
                  <h2 className="p-4 text-3xl sm:text-4xl font-bold">Efficient Transactions</h2>
                  <p className="text-base sm:text-lg md:text-xl text-slate-800">
                    Flash loans enable swift arbitrage operations within a single blockchain transaction, minimizing
                    exposure to price fluctuations and enhancing operational efficiency.
                  </p>
                </div>
                <div className="w-full lg:w-1/3 border border-gray-200 bg-white px-4 py-6 text-black rounded-xl hover:border-2 hover:border-blue-600 hover:shadow-blue-500/50 transition-all">
                  <h2 className="p-4 text-3xl sm:text-4xl font-bold">Add Icon</h2>
                  <h2 className="p-4 text-3xl sm:text-4xl font-bold">Automated Precision</h2>
                  <p className="text-base sm:text-lg md:text-xl text-slate-800">
                    Using bots automates the process, allowing for the swift execution of arbitrage strategies with
                    minimal human involvement, and provides adaptability to changing market conditions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black py-20">
          <div className="text-center">
            <span className="text-white text-4xl sm:text-5xl md:text-6xl tracking-wide mt-10 mx-4 lg:mx-0">
              Why you should consider taking{" "}
              <span className="bg-gradient-to-r from-blue-500 to-blue-700 text-transparent bg-clip-text">
                Flash Loans
              </span>{" "}
              from us
            </span>
            <div className="py-12 lg:px-20 px-4 w-full flex flex-col lg:flex-row justify-evenly text-xl">
              <div className="lg:m-10 m-6 lg:flex-1">
                <img
                  src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.cryptopolitan.com%2Fwp-content%2Fuploads%2F2023%2F02%2FEG-203_What-are-Flash-Loans.jpg&f=1&nofb=1&ipt=f443b670cbe2e7af431da848fcbb3c4f34479d1f9bc2dc315f1281549beb589c&ipo=images"
                  alt="flashloan2"
                  className="w-full max-w-xl mx-auto lg:mx-0 lg:mr-auto"
                />
              </div>
              <div className="lg:m-8 m-6 text-white lg:flex-1 lg:text-left">
                <h2 className="text-3xl sm:text-4xl font-bold lg:text-left text-center">Get Loan for the Arbitrage</h2>
                <p className="py-4 sm:py-6 text-lg sm:text-xl lg:text-left text-center max-w-xl lg:mx-0 mx-auto">
                  Once you have identified a profitable arbitrage opportunity, you can secure a flash loan from various
                  platforms, such as Multiplier-Finance, PancakeSwap, or Uniswap, allowing you to leverage large amounts
                  of capital without the need for upfront collateral.
                </p>
                <div className="font-bold text-3xl sm:text-4xl bg-gradient-to-r from-slate-400 to-slate-600 text-transparent bg-clip-text lg:text-left text-center">
                  At 0 Platform fee
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-col justify-between text-align-center flex-grow pt-10 bg-black text-2xl">
          <div className="flex-grow bg-black w-full mt-16 px-8 py-12">
            <div className="flex justify-center items-center gap-20 flex-col sm:flex-row">
              <div className="flex flex-col bg-black text-white border px-10 py-10 text-center items-center max-w-xl rounded-3xl">
                <BugAntIcon className="h-8 w-8 fill-secondary" />
                <p>
                  Tinker with your smart contract using the{" "}
                  <Link
                    href="/debug"
                    passHref
                    className="link bg-gradient-to-r from-blue-500 to-blue-700 text-transparent bg-clip-text"
                  >
                    Debug Contracts
                  </Link>{" "}
                  tab.
                </p>
              </div>
              <div className="flex flex-col px-10 py-10 text-center items-center max-w-xl rounded-3xl bg-white">
                <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
                <p>
                  Explore your local transactions with the{" "}
                  <Link
                    href="/blockexplorer"
                    className="link bg-gradient-to-r from-blue-700 to-blue-900 text-transparent bg-clip-text"
                  >
                    Block Explorer
                  </Link>{" "}
                  tab.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
