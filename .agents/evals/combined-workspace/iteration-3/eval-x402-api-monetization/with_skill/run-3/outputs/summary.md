# x402 API Monetization Implementation Summary

## What was built

A complete x402 payment-gated API monetization system for Scaffold-ETH 2. The implementation uses the x402 protocol (by Coinbase) to require a $0.01 USDC micropayment on Base Sepolia before granting access to a premium builder directory API endpoint. The system includes:

- **Next.js middleware** that intercepts requests to protected routes and enforces payment via the x402 protocol flow (402 response -> client signs EIP-712 payment -> facilitator verifies and settles)
- **A protected API route** (`/api/payment/builder`) that returns premium builder data only after payment is verified
- **A protected page route** (`/payment/builder`) with a paywall UI that handles browser-based payment flows
- **A CLI testing script** (`yarn send402request`) for programmatic API access using `@x402/fetch`
- **Navigation integration** with a "Premium API" link in the site header

## Files created

1. **`packages/nextjs/middleware.ts`** — Core x402 middleware using `paymentProxy` from `@x402/next`. Configures the facilitator client, resource server with EVM scheme registration, and paywall UI. Protects `/api/payment/*` (JSON API) and `/payment/*` (HTML pages) routes with $0.01 USDC pricing on Base Sepolia.

2. **`packages/nextjs/.env.development`** — Environment variables for the x402 configuration: facilitator URL (`https://x402.org/facilitator`), payment recipient address, and CAIP-2 network identifier (`eip155:84532` for Base Sepolia).

3. **`packages/nextjs/app/api/payment/builder/route.ts`** — Protected API endpoint that returns a JSON response with sample builder directory data (addresses, names, build counts, reputation scores, specialties). Payment verification happens in middleware before this handler executes.

4. **`packages/nextjs/app/payment/builder/page.tsx`** — Frontend page that fetches and displays premium builder data using DaisyUI components (stats, cards, badges). Uses the `Address` component from `@scaffold-ui/components` for address display.

5. **`packages/hardhat/scripts/send402request.ts`** — CLI script for testing the payment-gated API. Uses SE-2's deployer private key with `@x402/fetch` to automatically handle the 402 payment flow programmatically.

6. **`packages/hardhat/x402.d.ts`** — TypeScript type declarations for `@x402/fetch` and `@x402/evm/exact/client` modules to resolve ESM/CJS compatibility issues in the Hardhat environment.

## Files modified

7. **`packages/nextjs/scaffold.config.ts`** — Changed `targetNetworks` from `[chains.hardhat]` to `[chains.baseSepolia]` since x402 requires a real chain for the facilitator to verify and settle payments.

8. **`packages/nextjs/package.json`** — Added x402 dependencies: `@x402/core`, `@x402/evm`, `@x402/next`, `@x402/paywall` (all `^2.2.0`).

9. **`packages/hardhat/package.json`** — Added `send402request` script and x402 dependencies: `@x402/core`, `@x402/evm`, `@x402/fetch` (all `^2.2.0`).

10. **`packages/nextjs/components/Header.tsx`** — Added "Premium API" navigation link with `CurrencyDollarIcon` pointing to `/payment/builder`.

11. **`package.json`** (root) — Added `send402request` script that delegates to the hardhat workspace.

## Full file paths

- `/packages/nextjs/middleware.ts` (created)
- `/packages/nextjs/.env.development` (created)
- `/packages/nextjs/app/api/payment/builder/route.ts` (created)
- `/packages/nextjs/app/payment/builder/page.tsx` (created)
- `/packages/hardhat/scripts/send402request.ts` (created)
- `/packages/hardhat/x402.d.ts` (created)
- `/packages/nextjs/scaffold.config.ts` (modified)
- `/packages/nextjs/package.json` (modified)
- `/packages/hardhat/package.json` (modified)
- `/packages/nextjs/components/Header.tsx` (modified)
- `/package.json` (modified)

## How to test

1. Set `RESOURCE_WALLET_ADDRESS` in `packages/nextjs/.env.development` to your wallet address
2. Run `yarn install` to install x402 dependencies
3. Run `yarn start` to start the Next.js dev server
4. Visit `http://localhost:3000/payment/builder` in a browser — the x402 paywall UI will appear
5. Use `curl http://localhost:3000/api/payment/builder` to see the 402 response with payment instructions
6. Run `yarn send402request` to test programmatic paid access (requires a funded wallet on Base Sepolia with test USDC from the Circle faucet)
