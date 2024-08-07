import { Chain } from "viem";

export const virtual_base = {
  id: 14355 as const,
  name: "virtual_base",
  nativeCurrency: { name: "vETH", symbol: "vETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://virtual.base.rpc.tenderly.co/a81476b1-8d3c-4a3d-882e-b91321d5292b"] },
  },
  blockExplorers: {
    default: {
      name: "Tenderly Explorer",
      url: "https://virtual.base.rpc.tenderly.co/a81476b1-8d3c-4a3d-882e-b91321d5292b",
    },
  },
};

type VirtualChains = [typeof virtual_base];
export const virtualChains: VirtualChains = [virtual_base];

export function isTenderlyVirtualNetwork(network: Chain) {
  return virtualChains.map(chain => chain.id as number).indexOf(network.id) > -1;
}
