# x402 Payment-Gated API Implementation

## Overview

Implemented a payment-gated API endpoint in SE-2 using the x402 protocol (HTTP 402 Payment Required). Users pay 0.01 USDC per API call on Base Sepolia to access premium data. The solution includes server-side payment verification, a client-side payment hook, and a full UI page.

## Architecture

The x402 protocol flow:
1. Client requests data from `/api/paid-data`
2. Server responds with HTTP 402 and payment requirements (price, token, recipient address, chain)
3. Client sends a USDC transfer transaction via the connected wallet
4. Client retries the request with an `X-PAYMENT` header containing a base64-encoded proof (transaction hash + chain ID)
5. Server verifies the USDC Transfer event on-chain via the transaction receipt
6. Server returns premium data upon successful verification

## Files Created

### Configuration & Types
- **`/packages/nextjs/x402.config.ts`** — Central x402 configuration: chain (Base Sepolia), USDC address, recipient address (from env var), price (0.01 USDC), payment validity window, and USDC ERC-20 ABI subset
- **`/packages/nextjs/types/x402.ts`** — TypeScript types for PaymentRequirements, PaymentScheme, PaymentPayload, PaymentVerificationResult, and PaidApiResponse

### Server-Side (API + Middleware)
- **`/packages/nextjs/app/api/paid-data/route.ts`** — Next.js App Router API route that returns 402 with payment requirements when no `X-PAYMENT` header is present, verifies on-chain payment when the header is provided, and returns premium market data on success
- **`/packages/nextjs/middleware.ts`** — Next.js middleware that adds CORS headers for `/api/paid-*` routes, allowing the `X-PAYMENT` request header and exposing the `X-PAYMENT-REQUIRED` response header
- **`/packages/nextjs/utils/x402/verifyPayment.ts`** — Server-side payment verification: decodes the X-PAYMENT header, fetches the transaction receipt from Base Sepolia, parses USDC Transfer event logs, and validates the recipient and amount. Also exports `buildPaymentRequirements()` to construct the 402 response body
- **`/packages/nextjs/utils/x402/index.ts`** — Barrel export for x402 utils

### Client-Side (Hook + UI)
- **`/packages/nextjs/hooks/x402/useX402Payment.ts`** — React hook that orchestrates the full x402 flow: makes the initial API request, parses 402 requirements, checks USDC balance, sends the USDC transfer via wallet, waits for confirmation, and retries the API request with payment proof. Provides loading/error/data state
- **`/packages/nextjs/hooks/x402/index.ts`** — Barrel export for x402 hooks
- **`/packages/nextjs/app/paid-api/page.tsx`** — Full-page UI with: protocol explanation, payment details table (network, token, price, recipient), "Pay & Fetch Data" button with loading states, error/success alerts, transaction hash link to block explorer, and a structured display of the returned premium data (market trends, protocol TVL table, network activity stats)

## Files Modified

- **`/packages/nextjs/components/Header.tsx`** — Added "Paid API" navigation link with CurrencyDollarIcon to the header menu
- **`/packages/nextjs/scaffold.config.ts`** — Added `baseSepolia` to targetNetworks alongside hardhat
- **`/packages/nextjs/.env.example`** — Added `NEXT_PUBLIC_X402_RECIPIENT` environment variable for the payment recipient address

## Key Design Decisions

- **On-chain verification**: Payment is verified by reading the actual transaction receipt and parsing USDC Transfer event logs, not by trusting client-provided data
- **No additional dependencies**: Uses only viem (already in the project) for all blockchain interactions
- **Base Sepolia + USDC**: Uses the USDC testnet contract on Base Sepolia for low-cost testing
- **Configurable**: Recipient address, price, chain, and validity window are all configurable via `x402.config.ts` and environment variables
- **Build passes cleanly**: No TypeScript errors, no ESLint errors
