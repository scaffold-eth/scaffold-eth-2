import { useCallback, useState } from "react";
import { createPaymentHeader, selectPaymentRequirements } from "x402/client";
import { useWalletClient } from "wagmi";

type UseX402Result<T> = {
  fetchPaidResource: (url: string) => Promise<T | null>;
  data: T | null;
  isLoading: boolean;
  error: string | null;
};

/**
 * Hook that handles the x402 payment flow for accessing paid API endpoints.
 *
 * Flow:
 * 1. Sends a request to the paid endpoint
 * 2. Receives a 402 response with payment requirements
 * 3. Signs a USDC payment authorization using the connected wallet
 * 4. Retries the request with the payment header
 * 5. Returns the paid data
 */
export function useX402<T = unknown>(): UseX402Result<T> {
  const { data: walletClient } = useWalletClient();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaidResource = useCallback(
    async (url: string): Promise<T | null> => {
      if (!walletClient) {
        setError("Please connect your wallet first.");
        return null;
      }

      setIsLoading(true);
      setError(null);
      setData(null);

      try {
        // Step 1: Initial request to get 402 payment requirements
        const initialResponse = await fetch(url);

        // If the resource is free (no payment required), return the data directly
        if (initialResponse.ok) {
          const result = (await initialResponse.json()) as T;
          setData(result);
          return result;
        }

        // If we get anything other than 402, it is an error
        if (initialResponse.status !== 402) {
          const errorText = await initialResponse.text();
          throw new Error(`Request failed with status ${initialResponse.status}: ${errorText}`);
        }

        // Step 2: Parse payment requirements from the 402 response
        const x402VersionHeader = initialResponse.headers.get("X-402-Version");
        const x402Version = x402VersionHeader ? parseInt(x402VersionHeader, 10) : 1;

        const paymentRequirementsHeader = initialResponse.headers.get("X-402-Payment-Requirements");
        if (!paymentRequirementsHeader) {
          throw new Error("No payment requirements found in 402 response");
        }

        const paymentRequirements = JSON.parse(paymentRequirementsHeader);

        // Step 3: Select the best payment requirement (defaults to USDC)
        const selectedRequirement = selectPaymentRequirements(
          Array.isArray(paymentRequirements) ? paymentRequirements : [paymentRequirements],
        );

        // Step 4: Create payment header by signing with connected wallet
        // The walletClient from wagmi is compatible with viem's Client type,
        // which satisfies x402's EvmSigner (SignerWallet) requirement
        const paymentHeader = await createPaymentHeader(
          walletClient as Parameters<typeof createPaymentHeader>[0],
          x402Version,
          selectedRequirement,
        );

        // Step 5: Retry request with payment header
        const paidResponse = await fetch(url, {
          headers: {
            "X-402-Payment": paymentHeader,
          },
        });

        if (!paidResponse.ok) {
          const errorText = await paidResponse.text();
          throw new Error(`Payment failed with status ${paidResponse.status}: ${errorText}`);
        }

        const result = (await paidResponse.json()) as T;
        setData(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error occurred";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [walletClient],
  );

  return { fetchPaidResource, data, isLoading, error };
}
