# x402 API Monetization Implementation Summary

## Overview

Implemented a payment-gated API endpoint using the x402 protocol, enabling USDC micropayments on Base Sepolia for API access. The x402 protocol leverages HTTP 402 "Payment Required" to create a seamless pay-per-request model without subscriptions, accounts, or OAuth flows.

## Architecture

The implementation follows a server-side middleware pattern:

1. **Client** requests the protected API endpoint
2. **Middleware** intercepts the request, returns HTTP 402 with payment instructions (amount, network, payTo address)
3. **Client** (via `x402-fetch`) reads the 402 response, prompts user wallet to sign a USDC payment, and retries with a payment header
4. **Facilitator** (external service at `x402.org/facilitator`) verifies and settles the payment on-chain
5. **API route** handler executes and returns premium data

## Files Created

| File | Purpose |
|------|---------|
| `packages/nextjs/x402.config.ts` | Central x402 configuration: payTo address, facilitator URL, route pricing |
| `packages/nextjs/middleware.ts` | Next.js middleware using `x402-next` to enforce payments on protected API routes |
| `packages/nextjs/app/api/premium-data/route.ts` | Payment-gated API endpoint returning sample on-chain analytics data |
| `packages/nextjs/hooks/scaffold-eth/useX402Payment.ts` | Custom React hook wrapping `x402-fetch` for client-side payment handling with wagmi wallet integration |
| `packages/nextjs/app/x402-demo/page.tsx` | Demo page with UI to test the payment flow, displays premium data after successful payment |

## Files Modified

| File | Change |
|------|--------|
| `packages/nextjs/package.json` | Added `x402-next` and `x402-fetch` dependencies |
| `packages/nextjs/.env.example` | Added `X402_PAY_TO_ADDRESS`, `X402_FACILITATOR_URL`, `NEXT_PUBLIC_X402_NETWORK` environment variables |
| `packages/nextjs/components/Header.tsx` | Added "x402 Demo" navigation link with CurrencyDollarIcon |
| `packages/nextjs/scaffold.config.ts` | Added `baseSepolia` to target networks (required for x402 USDC payments) |
| `packages/nextjs/hooks/scaffold-eth/index.ts` | Exported `useX402Payment` hook |

## Dependencies Added

- **`x402-next`** (`^0.1.0`): Next.js middleware for x402 payment enforcement on server routes
- **`x402-fetch`** (`^0.1.0`): Client-side fetch wrapper that handles 402 responses by signing and attaching payments

## Configuration

Users need to set these environment variables in `.env.local`:

- `X402_PAY_TO_ADDRESS` - The EVM wallet address that receives USDC payments
- `X402_FACILITATOR_URL` - Payment facilitator endpoint (defaults to `https://x402.org/facilitator`)
- `NEXT_PUBLIC_X402_NETWORK` - Network for payments: `base-sepolia` (testnet) or `base` (mainnet)

## How to Use

1. Copy `.env.example` to `.env.local` and set `X402_PAY_TO_ADDRESS` to your wallet
2. Run `yarn install` to install x402 dependencies
3. Run `yarn start` to start the dev server
4. Navigate to `/x402-demo` in the browser
5. Connect wallet (needs Base Sepolia USDC)
6. Click "Pay & Fetch Premium Data" to test the micropayment flow

## Adding More Payment-Gated Routes

To add a new payment-gated endpoint:

1. Add the route config in `x402.config.ts` under `routes`
2. Add the route pattern to the `matcher` array in `middleware.ts`
3. Create the API route handler in `app/api/your-route/route.ts`
