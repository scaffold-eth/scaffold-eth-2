/**
 * Shared constants for add-extension skill
 */

export const CREATE_ETH_REPO = 'https://raw.githubusercontent.com/scaffold-eth/create-eth/main';

// All extension registry files
export const REGISTRY_URLS = [
  'https://raw.githubusercontent.com/scaffold-eth/create-eth/main/src/extensions/create-eth-extensions.ts',
  'https://raw.githubusercontent.com/scaffold-eth/create-eth/main/src/extensions/challenges.ts',
  'https://raw.githubusercontent.com/scaffold-eth/create-eth/main/src/extensions/organizations.ts'
];

// Default repo for fallback registry
export const DEFAULT_EXTENSIONS_REPO = 'https://github.com/scaffold-eth/create-eth-extensions';

export const VALID_FRAMEWORKS = ['hardhat', 'foundry'];

// Fallback for offline mode
export const FALLBACK_EXTENSIONS = [
  // Core extensions (11)
  'subgraph', 'x402', 'eip-712', 'ponder', 'erc-20',
  'eip-5792', 'randao', 'erc-721', 'porto', 'envio', 'drizzle-neon',
  // Challenge extensions (13)
  'challenge-tokenization', 'challenge-crowdfunding', 'challenge-token-vendor',
  'challenge-dice-game', 'challenge-dex', 'challenge-state-channels',
  'challenge-multisig', 'challenge-svg-nft', 'challenge-oracles',
  'challenge-over-collateralized-lending', 'challenge-prediction-markets',
  'challenge-stablecoins', 'challenge-zk-voting',
  // Organization extensions (4)
  'metamask/erc-7715-extension', 'metamask/gator-extension',
  'signinwithethereum/scaffold-siwe-ext', 'ethereumidentitykit/scaffold-efp-ext'
];
