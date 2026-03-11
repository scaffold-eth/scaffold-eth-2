# x402 API Monetization Implementation

## What was built

An API monetization system using the x402 protocol (HTTP 402 Payment Required) that gates a premium data endpoint behind USDC micropayments on Base Sepolia.

## Architecture

### Server-side: Payment-gated API route
- **`packages/nextjs/app/api/premium-data/route.ts`** — A Next.js App Router API endpoint wrapped with `withX402()` from the `x402-next` package. When called without a valid payment header, it returns HTTP 402 with payment requirements. When called with a signed payment authorization, it returns premium on-chain analytics data and the x402 facilitator settles the USDC payment on-chain.

### Client-side: Payment flow UI
- **`packages/nextjs/app/x402/page.tsx`** — A frontend page that handles the full x402 payment flow:
  1. Makes an initial request to the API (gets 402 response with payment requirements)
  2. Parses the `X-PAYMENT` header containing payment requirements
  3. Uses `createPaymentHeader()` from `x402/client` to sign a USDC transfer authorization via the connected wallet (EIP-3009 transferWithAuthorization)
  4. Retries the request with the signed payment header
  5. Displays the returned premium analytics data

### Configuration
- **`packages/nextjs/utils/x402/config.ts`** — Centralized x402 configuration (payTo address, network, price, facilitator URL) driven by environment variables.
- **`packages/nextjs/.env.example`** — Updated with x402 environment variables (`NEXT_PUBLIC_X402_PAY_TO`, `NEXT_PUBLIC_X402_NETWORK`, `NEXT_PUBLIC_X402_PRICE`, `NEXT_PUBLIC_X402_FACILITATOR_URL`).

### Navigation and network
- **`packages/nextjs/components/Header.tsx`** — Added "x402 API" link to the navigation menu.
- **`packages/nextjs/scaffold.config.ts`** — Added Base Sepolia to target networks for x402 payment support.

## Dependencies added
- `x402` — Core x402 protocol library (client-side payment header creation, type definitions)
- `x402-next` — Next.js integration providing `withX402()` route wrapper and `paymentMiddleware()`

## How it works (x402 protocol flow)

1. Client sends GET to `/api/premium-data`
2. Server responds with **HTTP 402** + `X-PAYMENT` header containing payment requirements (amount, asset, network, payTo address)
3. Client's wallet signs an EIP-3009 `transferWithAuthorization` for the required USDC amount (no on-chain tx yet)
4. Client retries with signed authorization in `X-PAYMENT` request header
5. The x402 facilitator verifies the signature is valid and the sender has sufficient USDC balance
6. Server returns the premium data
7. Facilitator settles the USDC transfer on-chain (payment goes from user to payTo address)

## Configuration required

Set `NEXT_PUBLIC_X402_PAY_TO` to the wallet address that should receive payments. The default network is `base-sepolia` (testnet) with a price of `$0.01` USDC per request. The default facilitator (`https://x402.org/facilitator`) handles testnet payment verification and settlement.
