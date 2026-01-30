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

// Fallback for offline mode (subset of most common extensions)
export const FALLBACK_EXTENSIONS = [
  'subgraph', 'x402', 'eip-712', 'ponder', 'erc-20',
  'eip-5792', 'randao', 'erc-721', 'porto', 'envio', 'drizzle-neon',
  'challenge-token-vendor', 'challenge-dice-game', 'challenge-dex'
];
