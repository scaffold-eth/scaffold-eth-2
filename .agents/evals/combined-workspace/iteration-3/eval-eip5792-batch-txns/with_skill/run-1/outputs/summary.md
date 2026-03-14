# EIP-5792 Batch Token Transfer Implementation

## What was built

An ERC-20 token contract ("BatchToken") and a frontend page that lets users approve and transfer tokens in a single batch transaction using EIP-5792's `wallet_sendCalls`, following the patterns from the EIP-5792 skill file.

### Smart Contract

- **BatchToken** (`ERC20`): A standard OpenZeppelin v5 ERC-20 token with 18 decimals, owner-restricted minting, and an initial supply of 1000 BATCH tokens minted to the deployer. Deployed via Hardhat deploy script with the `BatchToken` tag.

### Frontend

- **/batch page**: A full-featured batch transfer page with:
  - **Token info card**: Displays token name, symbol, total supply, and connected user's balance using `useScaffoldReadContract`.
  - **Wallet capability detection**: Uses `useCapabilities` from `wagmi/experimental` to detect EIP-5792 support and paymaster availability, displaying badges for each.
  - **Batch approve + transfer**: Uses `useWriteContracts` from `wagmi/experimental` to send `approve` and `transfer` as a single batched `wallet_sendCalls` request. Only enabled when the wallet supports EIP-5792.
  - **Fallback individual transactions**: For non-EIP-5792 wallets, provides a two-step approve-then-transfer flow using `useScaffoldWriteContract`.
  - **AddressInput** from `@scaffold-ui/components` for recipient input with validation and ENS resolution.
  - Notification feedback via SE-2's `notification` utility.
  - DaisyUI styling throughout (cards, badges, buttons, form controls, dividers).

### Navigation

- Added "Batch Transfer" link to the site header with an `ArrowPathRoundedSquareIcon` icon.

## Files created

| File | Full Path |
|------|-----------|
| BatchToken.sol | `/packages/hardhat/contracts/BatchToken.sol` |
| Deploy script | `/packages/hardhat/deploy/01_deploy_batch_token.ts` |
| Batch page | `/packages/nextjs/app/batch/page.tsx` |

## Files modified

| File | Full Path | Change |
|------|-----------|--------|
| Header.tsx | `/packages/nextjs/components/Header.tsx` | Added "Batch Transfer" navigation link with icon |

## Verification

- Solidity contracts compile successfully (`yarn compile` passes with 8 files)
- TypeScript type-checking passes (`yarn next:check-types` clean)
- ESLint/Prettier linting passes (`yarn next:lint` clean, `yarn next:format` applied)
