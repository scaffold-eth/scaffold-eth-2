import { useCallback, useState } from "react";
import { Address, toHex } from "viem";
import { useAccount, useSignTypedData } from "wagmi";
import { USDC_ADDRESSES, X402_PAYMENT_HEADER, X402_VERSION } from "~~/utils/x402/constants";
import { PaymentPayload, PaymentRequirements } from "~~/utils/x402/types";

type X402PaymentState = {
  /** Whether a payment flow is in progress */
  isLoading: boolean;
  /** The last error that occurred */
  error: string | null;
  /** The response data from the paid API */
  data: any | null;
  /** Whether the most recent request was successful */
  isSuccess: boolean;
};

type UseX402PaymentReturn = X402PaymentState & {
  /** Call a payment-gated API endpoint. Handles the full x402 flow automatically. */
  callPaidApi: (url: string, options?: RequestInit) => Promise<any>;
  /** Reset the state */
  reset: () => void;
};

/**
 * Hook that implements the client-side x402 payment flow.
 *
 * Usage:
 * ```tsx
 * const { callPaidApi, data, isLoading, error } = useX402Payment();
 *
 * const handleClick = async () => {
 *   await callPaidApi("/api/paid-weather?city=New+York");
 * };
 * ```
 *
 * The hook automatically:
 * 1. Calls the API endpoint
 * 2. If it gets a 402 response, parses the payment requirements
 * 3. Prompts the user to sign an EIP-712 typed data signature (EIP-3009 transferWithAuthorization)
 * 4. Retries the request with the signed payment in the X-PAYMENT header
 * 5. Returns the data from the successful response
 */
export function useX402Payment(): UseX402PaymentReturn {
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();

  const [state, setState] = useState<X402PaymentState>({
    isLoading: false,
    error: null,
    data: null,
    isSuccess: false,
  });

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, data: null, isSuccess: false });
  }, []);

  const callPaidApi = useCallback(
    async (url: string, options?: RequestInit) => {
      if (!address) {
        setState(prev => ({ ...prev, error: "Wallet not connected", isLoading: false }));
        throw new Error("Wallet not connected");
      }

      setState({ isLoading: true, error: null, data: null, isSuccess: false });

      try {
        // Step 1: Make the initial request to get payment requirements
        const initialResponse = await fetch(url, options);

        // If the response is not 402, return the data directly (no payment needed)
        if (initialResponse.status !== 402) {
          const data = await initialResponse.json();
          setState({ isLoading: false, error: null, data, isSuccess: true });
          return data;
        }

        // Step 2: Parse the payment requirements from the 402 response
        const paymentRequirements: PaymentRequirements = await initialResponse.json();

        if (!paymentRequirements.accepts || paymentRequirements.accepts.length === 0) {
          throw new Error("No payment methods accepted by the server");
        }

        // Use the first accepted payment method
        const paymentOption = paymentRequirements.accepts[0];
        const chainId = parseInt(paymentOption.network);
        const usdcAddress = USDC_ADDRESSES[chainId];

        if (!usdcAddress) {
          throw new Error(`USDC not supported on chain ${chainId}`);
        }

        // Step 3: Create the EIP-3009 transferWithAuthorization message
        const nonce = toHex(crypto.getRandomValues(new Uint8Array(32)));
        const now = Math.floor(Date.now() / 1000);
        const validAfter = now - 60; // valid from 1 minute ago (buffer for clock skew)
        const validBefore = now + 3600; // valid for 1 hour

        const domain = {
          name: "USD Coin",
          version: "2",
          chainId: BigInt(chainId),
          verifyingContract: usdcAddress,
        };

        const types = {
          TransferWithAuthorization: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "validAfter", type: "uint256" },
            { name: "validBefore", type: "uint256" },
            { name: "nonce", type: "bytes32" },
          ],
        };

        const message = {
          from: address as Address,
          to: paymentOption.payTo as Address,
          value: BigInt(paymentOption.maxAmountRequired),
          validAfter: BigInt(validAfter),
          validBefore: BigInt(validBefore),
          nonce: nonce as `0x${string}`,
        };

        // Step 4: Sign the EIP-712 typed data
        const signature = await signTypedDataAsync({
          domain,
          types,
          primaryType: "TransferWithAuthorization",
          message,
        });

        // Step 5: Build the payment payload
        const paymentPayload: PaymentPayload = {
          x402Version: X402_VERSION,
          scheme: paymentOption.scheme,
          network: paymentOption.network,
          payload: {
            signature,
            authorization: {
              from: address,
              to: paymentOption.payTo as Address,
              value: paymentOption.maxAmountRequired,
              validAfter: String(validAfter),
              validBefore: String(validBefore),
              nonce,
            },
          },
        };

        // Base64 encode the payment payload (using btoa for browser compatibility)
        const encodedPayment = btoa(JSON.stringify(paymentPayload));

        // Step 6: Retry the request with the payment header
        const paidResponse = await fetch(url, {
          ...options,
          headers: {
            ...options?.headers,
            [X402_PAYMENT_HEADER]: encodedPayment,
          },
        });

        if (!paidResponse.ok) {
          const errorData = await paidResponse.json().catch(() => ({ error: "Payment failed" }));
          throw new Error(errorData.error || errorData.details || "Payment failed");
        }

        const data = await paidResponse.json();
        setState({ isLoading: false, error: null, data, isSuccess: true });
        return data;
      } catch (error: any) {
        const errorMessage = error?.message || "An error occurred during the payment flow";
        setState({ isLoading: false, error: errorMessage, data: null, isSuccess: false });
        throw error;
      }
    },
    [address, signTypedDataAsync],
  );

  return {
    ...state,
    callPaidApi,
    reset,
  };
}
