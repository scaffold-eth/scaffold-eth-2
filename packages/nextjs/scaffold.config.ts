import { BuidlGuidlLogo } from "./components/assets/BuidlGuidlLogo";
import * as chains from "viem/chains";

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  pollingInterval: number;
  alchemyApiKey: string;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
  projectName: string;
  projectDescription: string;
  projectNameHeader: string;
  projectDescriptionHeader: string;
  projectIconPathHeader: string;
  projectCreator: string;
  projectCreatorSvg: any;
  projectCreatorLink: string;
  projectRepoLink: string;
  projectSupportLink: string;
};

const scaffoldConfig = {
  // The networks on which your DApp is live
  targetNetworks: [chains.hardhat],

  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect if you only target the local network (default is 4000)
  pollingInterval: 30000,

  // This is ours Alchemy's default API key.
  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "oKxs-03sij-U_N0iOlrSsZFr29-IqbuF",

  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  // Only show the Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: true,

  projectNameHeader: "Scaffold-ETH",
  projectDescriptionHeader: "Ethereum dev stack",
  projectIconPathHeader: "/logo.svg",
  projectName: "Scaffold-ETH 2",
  projectDescription: "Built with 🏗 Scaffold-ETH 2",
  projectCreator: "BuidlGuidl",
  projectCreatorSvg: BuidlGuidlLogo,
  projectCreatorLink: "https://buidlguidl.com/",
  projectRepoLink: "https://github.com/scaffold-eth/se-2",
  projectSupportLink: "https://t.me/joinchat/KByvmRe5wkR-8F_zz6AjpA",
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
