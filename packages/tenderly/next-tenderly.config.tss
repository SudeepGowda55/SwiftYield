import { Chain } from "viem";

export const virtual_mainnet = {
  id: 14355 as const,
  name: "virtual_mainnet",
  nativeCurrency: { name: "vETH", symbol: "vETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://virtual.mainnet.rpc.tenderly.co/78e26687-be6e-4c3e-8c05-f4e6eb051ab5"] },
  },
  blockExplorers: {
    default: {
      name: "Tenderly Explorer",
      url: "https://virtual.mainnet.rpc.tenderly.co/78e26687-be6e-4c3e-8c05-f4e6eb051ab5",
    },
  },
};

type VirtualChains = [typeof virtual_mainnet];
export const virtualChains: VirtualChains = [virtual_mainnet];

export function isTenderlyVirtualNetwork(network: Chain) {
  return virtualChains.map(chain => chain.id as number).indexOf(network.id) > -1;
}
