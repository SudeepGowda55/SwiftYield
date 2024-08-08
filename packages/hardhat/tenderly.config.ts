type NetworkConfig = {
  url: string;
  chainId: number;
  currency: string;
};

export const virtualNetworks: {
  [networkName: string]: NetworkConfig;
} = {
  virtual_base: {
    url: "https://virtual.base.rpc.tenderly.co/cfbeb8a7-657c-49e4-a7b3-740612a2c4a3",
    chainId: 14355,
    currency: "VETH",
  },
};

// DO NOT DELETE
export function isTenderlyVirtualNetwork(chainId: number) {
  return Object.values(virtualNetworks).filter(chain => chain.chainId == chainId).length > 0;
}
