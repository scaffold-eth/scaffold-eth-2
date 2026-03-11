# EIP-5792 Batch Token Transfer Implementation

## What was built

An EIP-5792 batch transaction feature that allows users to approve and transfer ERC20 tokens in a single batched call using `wallet_sendCalls`.

## Files created/modified

### Smart Contract
- **`packages/hardhat/contracts/BatchToken.sol`** - An ERC20 token (OpenZeppelin v5) named "BatchToken" (BATCH) with owner-only minting. Deployer receives 1,000,000 tokens as initial supply.

### Deployment Script
- **`packages/hardhat/deploy/01_deploy_batch_token.ts`** - Hardhat-deploy script that deploys BatchToken with the deployer as owner and 1,000,000 token initial supply.

### Frontend Page
- **`packages/nextjs/app/batch-transfer/page.tsx`** - A full-featured page at `/batch-transfer` that:
  - Displays token info (name, symbol, contract address, user balance, current allowance)
  - Provides a form with recipient address input and transfer amount input
  - Uses wagmi's `useSendCalls` hook to batch two ERC20 calls (`approve` + `transfer`) into a single `wallet_sendCalls` request
  - Encodes call data using viem's `encodeFunctionData` with the standard `erc20Abi`
  - Tracks batch transaction status via `useCallsStatus`, displaying the batch ID, status badge, and transaction receipts
  - Includes an explanatory "How It Works" section
  - Uses SE-2 patterns: `useScaffoldReadContract` for token reads, `useDeployedContractInfo` for contract address, `notification` for user feedback, DaisyUI styling, `@scaffold-ui/components` for Address/AddressInput/IntegerInput

### Navigation
- **`packages/nextjs/components/Header.tsx`** - Added "Batch Transfer" link with `ArrowsRightLeftIcon` to the header navigation menu.

## Technical approach

- Uses wagmi v2's `useSendCalls` hook (main export, not experimental) which wraps the EIP-5792 `wallet_sendCalls` JSON-RPC method
- Encodes approve and transfer calls as raw calldata using viem's `encodeFunctionData` with the standard `erc20Abi`
- Both calls are sent as a batch, so compatible wallets can execute them with a single user confirmation
- Uses `useCallsStatus` to poll for batch transaction status updates after submission
