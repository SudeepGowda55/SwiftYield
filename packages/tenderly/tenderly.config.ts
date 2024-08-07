type NetworkConfig = {
  url: string;
  chainId: number;
  currency: string;
};

export const virtualNetworks: {
  [networkName: string]: NetworkConfig;
} = {
  "virtual_base": {
    "url": "https://virtual.base.rpc.tenderly.co/a81476b1-8d3c-4a3d-882e-b91321d5292b",
    "chainId": 14355,
    "currency": "VETH"
  }
};

// DO NOT DELETE
export function isTenderlyVirtualNetwork(chainId: number) {
  return Object.values(virtualNetworks).filter(chain => chain.chainId == chainId).length > 0;
}
