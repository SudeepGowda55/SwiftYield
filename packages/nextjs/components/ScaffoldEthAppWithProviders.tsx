"use client";

import { useEffect } from "react";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { WagmiProvider } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { ArcCursor } from "~~/components/motion/ArcCursor";
import { PageTransitionProvider } from "~~/components/motion/PageTransition";
import { SmoothScroll } from "~~/components/motion/SmoothScroll";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { ProgressBar } from "~~/components/scaffold-eth/ProgressBar";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  const price = useNativeCurrencyPrice();
  const setNativeCurrencyPrice = useGlobalState(state => state.setNativeCurrencyPrice);

  useEffect(() => {
    if (price > 0) {
      setNativeCurrencyPrice(price);
    }
  }, [setNativeCurrencyPrice, price]);

  return (
    <PageTransitionProvider>
      <SmoothScroll />
      <Header />
      <div className="flex min-h-screen flex-col lg:pl-[var(--rail)]">
        <main className="relative flex flex-1 flex-col">{children}</main>
        <Footer />
      </div>
      <ArcCursor />
      <Toaster />
    </PageTransitionProvider>
  );
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// RainbowKit in the storm palette: sharp corners, sunk-orange plates, plum ink
const walletTheme = (() => {
  const t = lightTheme({ accentColor: "#22072b", accentColorForeground: "#ff6a13", borderRadius: "none" });
  t.colors.connectButtonBackground = "#e8530a";
  t.colors.connectButtonText = "#22072b";
  t.colors.modalBackground = "#fff3e2";
  t.shadows.connectButton = "0 0 0 1px rgba(34,7,43,0.24)";
  return t;
})();

export const ScaffoldEthAppWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ProgressBar />
        <RainbowKitProvider avatar={BlockieAvatar} theme={walletTheme}>
          <ScaffoldEthApp>{children}</ScaffoldEthApp>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
