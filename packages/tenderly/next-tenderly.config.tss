import { Chain } from "viem";

export const virtual_base = {
  id: 14355 as const,
  name: "virtual_base",
  nativeCurrency: { name: "vETH", symbol: "vETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://virtual.base.rpc.tenderly.co/cfbeb8a7-657c-49e4-a7b3-740612a2c4a3"] },
  },
  blockExplorers: {
    default: {
      name: "Tenderly Explorer",
      url: "https://virtual.base.rpc.tenderly.co/cfbeb8a7-657c-49e4-a7b3-740612a2c4a3",
    },
  },
};

type VirtualChains = [typeof virtual_base];
export const virtualChains: VirtualChains = [virtual_base];

export function isTenderlyVirtualNetwork(network: Chain) {
  return virtualChains.map(chain => chain.id as number).indexOf(network.id) > -1;
}
