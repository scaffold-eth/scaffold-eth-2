# EIP-5792 Batch Transfer Implementation Summary

## What was built

An EIP-5792 batch transaction feature for Scaffold-ETH 2 that allows users to approve and transfer ERC-20 tokens in a single wallet interaction using `wallet_sendCalls`. The implementation includes a custom ERC-20 token contract, a deployment script, and a full-featured frontend page.

### Smart Contract: BatchToken (ERC-20)

A simple ERC-20 token with open minting, built on OpenZeppelin's ERC20 base. The deployer receives 1000 tokens on deployment, and anyone can mint more tokens for testing. The contract provides all standard ERC-20 functions (approve, transfer, transferFrom, balanceOf, allowance) needed for the batch demo.

### Frontend: Batch Transfer Page

The `/batch-transfer` page demonstrates EIP-5792 by combining approve + transfer into a single batch call:

- **Wallet capability detection** using `useCapabilities` from `wagmi/experimental` to check EIP-5792 support
- **Batch transaction** using `useWriteContracts` from `wagmi/experimental` to send approve + transfer as one `wallet_sendCalls` request
- **Individual fallback** using `useScaffoldWriteContract` for wallets that don't support EIP-5792
- **Token minting** so users can get test tokens
- **Live state display** showing balance, allowance, token info using `useScaffoldReadContract`
- **DaisyUI styling** with card components, badges, and responsive layout

### Key EIP-5792 patterns used

1. `useCapabilities` to detect wallet support and show appropriate UI
2. `useWriteContracts` (from `wagmi/experimental`) to batch approve + transfer
3. `useDeployedContractInfo` to get the contract ABI and address for the batch call
4. Graceful degradation with individual `useScaffoldWriteContract` calls as fallback

## Files created

| File | Full Path |
|------|-----------|
| BatchToken.sol (ERC-20 contract) | `packages/hardhat/contracts/BatchToken.sol` |
| Deploy script | `packages/hardhat/deploy/01_deploy_batch_token.ts` |
| Batch Transfer page | `packages/nextjs/app/batch-transfer/page.tsx` |

## Files modified

| File | Full Path | Change |
|------|-----------|--------|
| Header.tsx | `packages/nextjs/components/Header.tsx` | Added "Batch Transfer" navigation link with ArrowsRightLeftIcon |

## Build verification

- Solidity compilation: successful (8 files compiled)
- Next.js production build: successful, `/batch-transfer` route at 3.14 kB
- No TypeScript errors
