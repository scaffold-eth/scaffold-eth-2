# EIP-5792 Batch Transaction Support — Implementation Summary

## What Was Built

An ERC-20 token contract (`BatchToken`) and a frontend page (`/batch-transfer`) that lets users approve and transfer tokens in a single batch transaction using EIP-5792's `wallet_sendCalls` method.

### How It Works

1. **BatchToken contract** mints 1,000,000 BATCH tokens to the deployer on deployment.
2. The **Batch Transfer page** reads the user's token balance, decimals, symbol, and current allowance using scaffold-eth hooks (`useScaffoldReadContract`).
3. When the user fills in a recipient address and amount, the form encodes two ERC-20 calls (`approve` + `transferFrom`) using viem's `encodeFunctionData` with `erc20Abi`.
4. Both calls are submitted as a single batch via wagmi's `useSendCalls` hook, which invokes `wallet_sendCalls` (EIP-5792).
5. After submission, the page tracks the batch status using `useWaitForCallsStatus`, showing the batch ID, confirmation status, and individual transaction receipts.

### EIP-5792 Integration Details

- **`useSendCalls`** (from wagmi) — sends the batch of calls to the wallet via the `wallet_sendCalls` JSON-RPC method.
- **`useWaitForCallsStatus`** (from wagmi) — polls for the batch's confirmation status and retrieves transaction receipts.
- The calls array contains two entries, each with `{ to, data }` where `data` is ABI-encoded using viem's `encodeFunctionData`.
- Wallets that support EIP-5792 will execute both calls atomically. For wallets that don't natively support batching, wagmi/viem provide a fallback that sends the calls sequentially.

## Files Created

| File | Description |
|------|-------------|
| `packages/hardhat/contracts/BatchToken.sol` | ERC-20 token contract (OpenZeppelin v5) |
| `packages/hardhat/deploy/01_deploy_batch_token.ts` | Hardhat deploy script for BatchToken |
| `packages/nextjs/app/batch-transfer/page.tsx` | Next.js page for the batch transfer UI |
| `packages/nextjs/app/batch-transfer/_components/BatchTransferForm.tsx` | Main form component with EIP-5792 batch logic |

## Files Modified

| File | Change |
|------|--------|
| `packages/nextjs/components/Header.tsx` | Added "Batch Transfer" navigation link with QueueListIcon |

## Full File Paths

- `/packages/hardhat/contracts/BatchToken.sol` (created)
- `/packages/hardhat/deploy/01_deploy_batch_token.ts` (created)
- `/packages/nextjs/app/batch-transfer/page.tsx` (created)
- `/packages/nextjs/app/batch-transfer/_components/BatchTransferForm.tsx` (created)
- `/packages/nextjs/components/Header.tsx` (modified)
