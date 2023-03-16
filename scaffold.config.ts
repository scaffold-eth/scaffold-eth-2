import * as chain from "@wagmi/chains";

type ScaffoldConfig = {
  targetNetwork: chain.Chain;
  pollingInterval: number;
  deployerPrivateKey: string;
  etherscanApiKey: string;
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

  // hardhat account[0] private key
  deployerPrivateKey:
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",

  // Etherscan API key for verifying contracts
  etherscanApiKey: "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW",
} as const;

export default scaffoldConfig;
