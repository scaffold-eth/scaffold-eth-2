# EIP-5792 Batch Transaction Support

## What was built

Added EIP-5792 `wallet_sendCalls` support to an SE-2 dApp, allowing users to approve and transfer ERC-20 tokens in a single batch transaction.

## Files created/modified

### Smart Contract

- **`packages/hardhat/contracts/BatchToken.sol`** — A simple ERC-20 token (`BatchToken` / `BATCH`) built on OpenZeppelin v5. Mints 1,000,000 tokens to the deployer on construction. Serves as the token used in the batch transaction demo.

### Deployment Script

- **`packages/hardhat/deploy/01_deploy_batch_token.ts`** — Hardhat deploy script for the BatchToken contract. Tagged with `"BatchToken"` for selective deployment via `yarn deploy --tags BatchToken`.

### Frontend Page

- **`packages/nextjs/app/batch-transfer/page.tsx`** — Full-featured batch transfer page that:
  - Displays token info (name, symbol, balance, current allowance) using `useScaffoldReadContract`
  - Provides inputs for spender address, recipient address, and token amount using SE-2 UI components (`AddressInput`, `IntegerInput`)
  - Sends a batch of two calls (approve + transfer) via wagmi's `useSendCalls` hook, which invokes `wallet_sendCalls` (EIP-5792)
  - Encodes call data using viem's `encodeFunctionData` with the standard `erc20Abi`
  - Tracks batch status using `useWaitForCallsStatus`, showing the batch call ID, confirmation status, and individual transaction receipts
  - Includes an educational "How It Works" section explaining EIP-5792

### Navigation

- **`packages/nextjs/components/Header.tsx`** — Added a "Batch Transfer" link with an `ArrowsRightLeftIcon` to the header navigation menu.

## Technical approach

- Used wagmi's `useSendCalls` hook (stable API in wagmi 2.19.5, not experimental) which wraps the EIP-5792 `wallet_sendCalls` RPC method
- Used `useWaitForCallsStatus` to poll for batch transaction confirmation and display receipts
- Encoded ERC-20 function calls with viem's `encodeFunctionData` and standard `erc20Abi` for maximum compatibility
- Followed SE-2 patterns: `useScaffoldReadContract` for reading contract state, `useDeployedContractInfo` for contract address, DaisyUI classes for styling, `notification` utility for user feedback
