import { Extension } from "./types";

export const createEthExtensions: Extension[] = [
  {
    extensionFlagValue: "subgraph",
    description:
      "Adds support for building, testing, and deploying subgraphs locally, with seamless front-end integration and easy deployment to Subgraph Studio.",
    repository: "https://github.com/scaffold-eth/create-eth-extensions",
    branch: "subgraph",
  },
  {
    extensionFlagValue: "x402",
    description: "Adds support for monetizing APIs and pages with x402 protocol micropayments.",
    repository: "https://github.com/scaffold-eth/create-eth-extensions",
    branch: "x402",
  },
  {
    extensionFlagValue: "eip-712",
    description: "Provides EIP-712 typed message signing, sending, and verification in a user-friendly way.",
    repository: "https://github.com/scaffold-eth/create-eth-extensions",
    branch: "eip-712",
  },
  {
    extensionFlagValue: "ponder",
    description: "Provides a pre-configured setup for ponder.sh, helping you get started quickly with event indexing.",
    repository: "https://github.com/scaffold-eth/create-eth-extensions",
    branch: "ponder",
  },
  {
    extensionFlagValue: "erc-20",
    description: "Adds support for ERC-20 token contracts, including balance checks and token transfers.",
    repository: "https://github.com/scaffold-eth/create-eth-extensions",
    branch: "erc-20",
  },
  {
    extensionFlagValue: "eip-5792",
    description:
      "Provides EIP-5792 wallet capabilities, allowing multiple calls and status checks via new JSON-RPC methods.",
    repository: "https://github.com/scaffold-eth/create-eth-extensions",
    branch: "eip-5792",
  },
  {
    extensionFlagValue: "randao",
    description: "Provides on-chain randomness using RANDAO for unpredictable random sources.",
    repository: "https://github.com/scaffold-eth/create-eth-extensions",
    branch: "randao",
  },
  {
    extensionFlagValue: "erc-721",
    description: "Adds support for ERC-721 NFT contracts, including supply, balance, listing, and transfer features.",
    repository: "https://github.com/scaffold-eth/create-eth-extensions",
    branch: "erc-721",
  },
  {
    extensionFlagValue: "porto",
    description: "This extension brings porto.sh SDK to Scaffold-ETH 2.",
    repository: "https://github.com/scaffold-eth/create-eth-extensions",
    branch: "porto",
  },
  {
    extensionFlagValue: "envio",
    description:
      "This extension integrates Envio Indexer, it makes indexing your deployed smart contracts as simple as possible",
    repository: "https://github.com/scaffold-eth/create-eth-extensions",
    branch: "envio",
  },
  {
    extensionFlagValue: "drizzle-neon",
    description:
      "This extension sets up a local database with Drizzle ORM. Optimized to work using Neon as the database provider.",
    repository: "https://github.com/scaffold-eth/create-eth-extensions",
    branch: "drizzle-neon",
  },
];
