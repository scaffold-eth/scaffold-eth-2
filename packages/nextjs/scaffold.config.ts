import * as chain from "wagmi/chains";

type ScaffoldConfig = {
  targetNetwork: chain.Chain;
  pollingInterval: number;
  alchemyApiKey: string;
};

const scaffoldConfig: ScaffoldConfig = {
  // The network where your DApp lives in
  targetNetwork: chain.hardhat,

  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect on the local network
  pollingInterval: 30000,

  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  alchemyApiKey: "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF",
} as const;

export default scaffoldConfig;
