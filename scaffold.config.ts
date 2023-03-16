import * as chain from "@wagmi/chains";

type ScaffoldConfig = {
  targetNetwork: chain.Chain;
  pollingInterval: number;
  deployerPrivateKey: string;
  etherscanApiKey: string;
  providerApiKey: string;
};

const scaffoldConfig: ScaffoldConfig = {
  targetNetwork: chain.hardhat,
  pollingInterval: 30000,
  // hardhat account[0] private key
  deployerPrivateKey:
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  etherscanApiKey: "DNXJA8RX2Q3VZ4URQIWP7Z68CJXQZSC6AW",
  providerApiKey: "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF",
} as const;

export default scaffoldConfig;
