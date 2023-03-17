import * as chains from "wagmi/chains";

type ScaffoldConfig = {
  targetNetwork: chains.Chain;
  pollingInterval: number;
  alchemyApiKey: string;
};

const scaffoldConfig: ScaffoldConfig = {
  // The network where your DApp lives in
  targetNetwork: chains.hardhat,

  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect on the local network
  pollingInterval: 30000,

  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF",
} as const;

export default scaffoldConfig;
