# CLAUDE.md - AI Assistant Guide for Scaffold-ETH 2 Lite

## Project Overview

Scaffold-ETH 2 (SE-2) is a minimal, forkable starter kit for building decentralized applications (dApps) on Ethereum. This is the "lite" version optimized for rapid prototyping.

**Tech Stack:**
- **Smart Contracts:** Hardhat, Solidity 0.8.20, OpenZeppelin, hardhat-deploy
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Web3:** Wagmi 2.x, Viem 2.x, RainbowKit 2.x
- **Styling:** TailwindCSS 4.x, DaisyUI 5.x
- **State:** Zustand, TanStack Query
- **Package Manager:** Yarn 3.x (monorepo workspaces)

## Repository Structure

```
scaffold-eth-2-lite/
├── packages/
│   ├── hardhat/                    # Smart contract development
│   │   ├── contracts/              # Solidity contracts
│   │   ├── deploy/                 # Deployment scripts (hardhat-deploy)
│   │   ├── test/                   # Contract tests (Chai + Hardhat)
│   │   ├── scripts/                # Utility scripts (account management)
│   │   └── hardhat.config.ts       # Hardhat configuration
│   │
│   └── nextjs/                     # Frontend application
│       ├── app/                    # Next.js App Router pages
│       │   ├── page.tsx            # Home page
│       │   ├── debug/              # Contract debug interface
│       │   └── blockexplorer/      # Local block explorer
│       ├── components/             # React components
│       │   └── scaffold-eth/       # SE-2 specific components
│       ├── hooks/scaffold-eth/     # Custom React hooks for contracts
│       ├── contracts/              # Contract ABIs and addresses
│       │   ├── deployedContracts.ts  # Auto-generated (DO NOT EDIT)
│       │   └── externalContracts.ts  # Manual external contracts
│       ├── services/               # Web3 and store configuration
│       ├── utils/scaffold-eth/     # Utility functions
│       └── scaffold.config.ts      # Main app configuration
│
├── .github/workflows/lint.yaml     # CI: lint + type checks
├── .husky/                         # Git hooks (pre-commit)
└── package.json                    # Root workspace config
```

## Essential Commands

### Development Workflow
```bash
# Start local Ethereum network (terminal 1)
yarn chain

# Deploy contracts to local network (terminal 2)
yarn deploy

# Start frontend dev server (terminal 3)
yarn start
```

### Smart Contract Commands
```bash
yarn compile              # Compile Solidity contracts
yarn deploy               # Deploy to local network
yarn deploy --network sepolia  # Deploy to testnet
yarn test                 # Run contract tests
yarn hardhat:verify       # Verify on block explorer
```

### Account Management
```bash
yarn generate             # Generate new deployer account
yarn account:import       # Import existing private key
yarn account              # Show account balances
yarn account:reveal-pk    # Reveal private key
```

### Code Quality
```bash
yarn lint                 # Run all linters
yarn format               # Format all files
yarn next:check-types     # TypeScript type checking
yarn hardhat:check-types  # Hardhat type checking
```

### Deployment
```bash
yarn vercel               # Deploy frontend to Vercel
yarn ipfs                 # Deploy frontend to IPFS
```

## Smart Contract Development

### Contract Location
Place Solidity contracts in `packages/hardhat/contracts/`

### Deployment Scripts
Create deployment scripts in `packages/hardhat/deploy/` following the naming convention:
```
00_deploy_your_contract.ts
01_deploy_another_contract.ts
```

**Deployment script template:**
```typescript
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("ContractName", {
    from: deployer,
    args: [/* constructor args */],
    log: true,
    autoMine: true,
  });
};

export default deployContract;
deployContract.tags = ["ContractName"];
```

### Writing Tests
Test files go in `packages/hardhat/test/`:
```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("ContractName", function () {
  it("should do something", async function () {
    const [owner] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("ContractName");
    const contract = await factory.deploy(owner.address);
    await contract.waitForDeployment();

    expect(await contract.someFunction()).to.equal(expectedValue);
  });
});
```

## Frontend Development

### Key Configuration
Edit `packages/nextjs/scaffold.config.ts` to configure:
- `targetNetworks` - Networks the dApp supports
- `pollingInterval` - RPC polling frequency
- `alchemyApiKey` - Alchemy API key
- `walletConnectProjectId` - WalletConnect project ID
- `onlyLocalBurnerWallet` - Burner wallet visibility

### Contract Interaction Hooks

**IMPORTANT:** Always use these SE-2 hooks for contract interactions, never raw wagmi hooks.

#### Reading Contract Data
```typescript
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const { data, isLoading, error } = useScaffoldReadContract({
  contractName: "YourContract",
  functionName: "greeting",
  args: [], // optional
});
```

#### Writing to Contracts
```typescript
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

const { writeContractAsync } = useScaffoldWriteContract({
  contractName: "YourContract",
});

// Usage:
await writeContractAsync({
  functionName: "setGreeting",
  args: ["Hello!"],
  value: parseEther("0.1"), // optional, for payable functions
});
```

#### Reading Event History
```typescript
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

const { data: events, isLoading } = useScaffoldEventHistory({
  contractName: "YourContract",
  eventName: "GreetingChange",
  watch: true, // optional
});
```

#### Watching Events in Real-time
```typescript
import { useScaffoldWatchContractEvent } from "~~/hooks/scaffold-eth";

useScaffoldWatchContractEvent({
  contractName: "YourContract",
  eventName: "GreetingChange",
  onLogs: (logs) => {
    // Handle new events
  },
});
```

### UI Components

Use components from `@scaffold-ui/components`:

```typescript
import { Address, AddressInput, Balance, EtherInput } from "@scaffold-ui/components";

// Display an address with blockie avatar and copy button
<Address address={userAddress} chain={targetNetwork} />

// Input for Ethereum addresses with ENS resolution
<AddressInput value={address} onChange={setAddress} placeholder="Enter address" />

// Display ETH balance
<Balance address={userAddress} chain={targetNetwork} />

// Input for ETH amounts with USD conversion
<EtherInput value={ethAmount} onChange={setEthAmount} />
```

### Path Aliases
The project uses TypeScript path aliases:
- `~~/` maps to `packages/nextjs/`

Example: `import { useTargetNetwork } from "~~/hooks/scaffold-eth";`

## Environment Variables

### Hardhat (`packages/hardhat/.env`)
```
ALCHEMY_API_KEY=           # For mainnet forking
ETHERSCAN_V2_API_KEY=      # For contract verification
DEPLOYER_PRIVATE_KEY_ENCRYPTED=  # Auto-generated, don't edit manually
```

### NextJS (`packages/nextjs/.env.local`)
```
NEXT_PUBLIC_ALCHEMY_API_KEY=
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=
```

## Code Style & Conventions

### TypeScript
- Strict mode enabled
- Use explicit types for function parameters and return values
- Prefer `const` over `let`

### React
- Use functional components with hooks
- Client components need `"use client"` directive
- Prefer named exports for components

### Solidity
- Use Solidity 0.8.20
- Include SPDX license identifier
- Use NatSpec comments for documentation
- Use OpenZeppelin contracts when possible

### File Naming
- React components: PascalCase (`MyComponent.tsx`)
- Hooks: camelCase with `use` prefix (`useMyHook.ts`)
- Utils: camelCase (`myUtil.ts`)
- Solidity: PascalCase (`MyContract.sol`)

## Important Notes for AI Assistants

1. **Contract ABIs are Auto-Generated:** Never manually edit `packages/nextjs/contracts/deployedContracts.ts`. It's regenerated on every deploy.

2. **Use SE-2 Hooks:** Always use `useScaffoldReadContract`, `useScaffoldWriteContract`, etc., instead of raw wagmi hooks for contract interactions.

3. **App Router Only:** This project uses Next.js App Router, not Pages Router. All pages are in `app/` directory.

4. **Debug Page:** The `/debug` page auto-generates UI for all deployed contracts - useful for testing.

5. **Local Development:** Always run `yarn chain` before `yarn deploy` for local development.

6. **Pre-commit Hooks:** The project uses Husky with lint-staged. Commits will be blocked if linting fails.

7. **Network Configuration:** Target networks are configured in `scaffold.config.ts`, not in environment variables.

8. **Burner Wallet:** The burner wallet only appears when connected to localhost/hardhat network by default.

## Supported Networks

Pre-configured in `hardhat.config.ts`:
- hardhat (local)
- mainnet
- sepolia
- arbitrum / arbitrumSepolia
- optimism / optimismSepolia
- polygon / polygonAmoy
- base / baseSepolia
- scroll / scrollSepolia
- gnosis / chiado
- celo / celoSepolia
- polygonZkEvm / polygonZkEvmCardona

## Troubleshooting

**Contract changes not reflecting in frontend:**
1. Make sure `yarn chain` is running
2. Run `yarn deploy` to redeploy and regenerate ABIs
3. Refresh the browser

**Type errors after contract changes:**
- Run `yarn deploy` to regenerate TypeScript types from ABIs

**Linting errors blocking commit:**
- Run `yarn format` then `yarn lint` to fix issues

**Network connection issues:**
- Check `scaffold.config.ts` has correct `targetNetworks`
- Verify environment variables are set correctly
