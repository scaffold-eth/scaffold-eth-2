declare module "@x402/fetch" {
  export class x402Client { constructor(); }
  export function wrapFetchWithPayment(fetchFn: typeof fetch, client: x402Client): typeof fetch;
}

declare module "@x402/evm/exact/client" {
  import type { Account } from "viem/accounts";
  import type { x402Client } from "@x402/fetch";
  export function registerExactEvmScheme(client: x402Client, config: { signer: Account }): void;
}
