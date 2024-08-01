type NetworkConfig = {
  url: string;
  chainId: number;
  currency: string;
};

export const virtualNetworks: {
  [networkName: string]: NetworkConfig;
} = {
  virtual_mainnet: {
    url: "https://virtual.mainnet.rpc.tenderly.co/78e26687-be6e-4c3e-8c05-f4e6eb051ab5",
    chainId: 14355,
    currency: "VETH",
  },
};

// DO NOT DELETE
export function isTenderlyVirtualNetwork(chainId: number) {
  return Object.values(virtualNetworks).filter(chain => chain.chainId == chainId).length > 0;
}
