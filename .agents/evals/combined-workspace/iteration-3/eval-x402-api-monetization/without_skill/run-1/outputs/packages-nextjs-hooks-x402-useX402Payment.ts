import { useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { PaymentPayload, PaymentRequirements } from "~~/types/x402";
import { notification } from "~~/utils/scaffold-eth";
import { USDC_ABI, x402Config } from "~~/x402.config";

type X402PaymentState = {
  /** Whether a payment transaction is being processed */
  isPaying: boolean;
  /** Whether the paid API data is being fetched */
  isFetching: boolean;
  /** Error message if something went wrong */
  error: string | null;
  /** The premium data returned after successful payment */
  data: Record<string, unknown> | null;
  /** The payment transaction hash */
  txHash: string | null;
  /** The payment requirements from the 402 response */
  paymentRequirements: PaymentRequirements | null;
};

/**
 * Hook for interacting with x402 payment-gated API endpoints.
 *
 * Usage:
 * ```tsx
 * const { fetchPaidData, isPaying, isFetching, data, error } = useX402Payment();
 *
 * // Call fetchPaidData() to initiate the payment + data fetch flow
 * await fetchPaidData("/api/paid-data");
 * ```
 *
 * The hook handles the full x402 flow:
 * 1. Makes initial request to the API
 * 2. Receives 402 Payment Required with payment requirements
 * 3. Sends a USDC transfer transaction via the connected wallet
 * 4. Waits for transaction confirmation
 * 5. Re-sends the API request with the X-PAYMENT header containing the tx proof
 * 6. Returns the premium data
 */
export function useX402Payment() {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: x402Config.chain.id });
  const { data: walletClient } = useWalletClient({ chainId: x402Config.chain.id });

  const [state, setState] = useState<X402PaymentState>({
    isPaying: false,
    isFetching: false,
    error: null,
    data: null,
    txHash: null,
    paymentRequirements: null,
  });

  /**
   * Fetches data from a payment-gated endpoint.
   * Handles the full x402 payment flow automatically.
   */
  const fetchPaidData = async (endpoint: string = "/api/paid-data") => {
    if (!address) {
      setState(prev => ({ ...prev, error: "Please connect your wallet first" }));
      notification.error("Please connect your wallet first");
      return;
    }

    if (!walletClient) {
      setState(prev => ({ ...prev, error: "Wallet client not available. Make sure you're on the correct network." }));
      notification.error("Wallet client not available");
      return;
    }

    if (!publicClient) {
      setState(prev => ({ ...prev, error: "Public client not available" }));
      notification.error("Public client not available");
      return;
    }

    setState(prev => ({
      ...prev,
      isFetching: true,
      error: null,
      data: null,
      txHash: null,
    }));

    try {
      // Step 1: Make initial request to get payment requirements
      const initialResponse = await fetch(endpoint);

      // If not 402, the endpoint doesn't require payment (or we already have access)
      if (initialResponse.status !== 402) {
        const responseData = await initialResponse.json();
        setState(prev => ({
          ...prev,
          isFetching: false,
          data: responseData.data || responseData,
        }));
        return;
      }

      // Step 2: Parse payment requirements from 402 response
      const paymentRequirements: PaymentRequirements = await initialResponse.json();
      setState(prev => ({ ...prev, paymentRequirements }));

      if (!paymentRequirements.accepts || paymentRequirements.accepts.length === 0) {
        throw new Error("No payment schemes available");
      }

      const scheme = paymentRequirements.accepts[0];
      const paymentAmount = BigInt(scheme.maxAmountRequired);
      const recipientAddress = scheme.payToAddress as `0x${string}`;
      const tokenAddress = scheme.requiredPaymentToken as `0x${string}`;

      // Step 3: Check USDC balance
      const balance = await publicClient.readContract({
        address: tokenAddress,
        abi: USDC_ABI,
        functionName: "balanceOf",
        args: [address],
      });

      if ((balance as bigint) < paymentAmount) {
        const required = Number(paymentAmount) / 10 ** x402Config.usdcDecimals;
        const available = Number(balance as bigint) / 10 ** x402Config.usdcDecimals;
        throw new Error(`Insufficient USDC balance. Required: ${required} USDC, Available: ${available} USDC`);
      }

      // Step 4: Send USDC transfer
      setState(prev => ({ ...prev, isPaying: true }));
      notification.info("Please confirm the USDC payment in your wallet...");

      const txHash = await walletClient.writeContract({
        address: tokenAddress,
        abi: USDC_ABI,
        functionName: "transfer",
        args: [recipientAddress, paymentAmount],
        chain: x402Config.chain,
      });

      notification.info("Payment submitted. Waiting for confirmation...");

      // Step 5: Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 1,
      });

      if (receipt.status !== "success") {
        throw new Error("Payment transaction failed on-chain");
      }

      setState(prev => ({ ...prev, txHash, isPaying: false }));
      notification.success("Payment confirmed!");

      // Step 6: Build payment payload and re-request the API
      const paymentPayload: PaymentPayload = {
        x402Version: 1,
        scheme: "exact",
        network: x402Config.chain.name,
        chainId: String(x402Config.chain.id),
        payload: {
          txHash,
          chainId: x402Config.chain.id,
        },
      };

      const encodedPayment = Buffer.from(JSON.stringify(paymentPayload)).toString("base64");

      const paidResponse = await fetch(endpoint, {
        headers: {
          "X-PAYMENT": encodedPayment,
        },
      });

      if (!paidResponse.ok) {
        const errorData = await paidResponse.json();
        throw new Error(errorData.error || "Payment verification failed on server");
      }

      const paidData = await paidResponse.json();

      setState(prev => ({
        ...prev,
        isFetching: false,
        data: paidData.data || paidData,
        error: null,
      }));

      notification.success("Premium data retrieved successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      setState(prev => ({
        ...prev,
        isPaying: false,
        isFetching: false,
        error: errorMessage,
      }));

      // Don't show notification for user rejection
      if (!errorMessage.includes("User rejected") && !errorMessage.includes("user rejected")) {
        notification.error(errorMessage);
      }
    }
  };

  return {
    fetchPaidData,
    ...state,
  };
}
