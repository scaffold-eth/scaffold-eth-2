import { createPublicClient, http, parseUnits } from "viem";
import { PaymentPayload, PaymentVerificationResult } from "~~/types/x402";
import { x402Config } from "~~/x402.config";

/**
 * Verifies an x402 payment by checking the on-chain transaction.
 *
 * This function:
 * 1. Parses the X-PAYMENT header payload
 * 2. Fetches the transaction receipt from the chain
 * 3. Verifies that a USDC Transfer event was emitted
 * 4. Checks that the transfer was to the correct recipient and for the correct amount
 */
export async function verifyPayment(paymentHeader: string): Promise<PaymentVerificationResult> {
  try {
    // Decode the payment payload from base64
    const decoded = Buffer.from(paymentHeader, "base64").toString("utf-8");
    const payment: PaymentPayload = JSON.parse(decoded);

    // Validate protocol version
    if (payment.x402Version !== 1) {
      return { valid: false, errorMessage: "Unsupported x402 version" };
    }

    // Validate chain ID
    if (payment.payload.chainId !== x402Config.chain.id) {
      return {
        valid: false,
        errorMessage: `Wrong chain. Expected ${x402Config.chain.id}, got ${payment.payload.chainId}`,
      };
    }

    const txHash = payment.payload.txHash as `0x${string}`;
    if (!txHash || !txHash.startsWith("0x")) {
      return { valid: false, errorMessage: "Invalid transaction hash" };
    }

    // Create a public client to read chain data
    const publicClient = createPublicClient({
      chain: x402Config.chain,
      transport: http(),
    });

    // Get the transaction receipt to check the Transfer event
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });

    if (receipt.status !== "success") {
      return { valid: false, errorMessage: "Transaction was not successful" };
    }

    // Parse USDC Transfer events from the receipt
    const requiredAmount = parseUnits(x402Config.priceUSDC, x402Config.usdcDecimals);
    const recipientLower = x402Config.recipientAddress.toLowerCase();
    const usdcAddressLower = x402Config.usdcAddress.toLowerCase();

    // Look for a Transfer event from USDC contract to our recipient
    let paymentFound = false;

    for (const log of receipt.logs) {
      // Check if this log is from the USDC contract
      if (log.address.toLowerCase() !== usdcAddressLower) continue;

      // Transfer event topic: Transfer(address,address,uint256)
      // keccak256("Transfer(address,address,uint256)")
      const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

      if (log.topics[0] !== transferTopic) continue;

      // topics[1] = from address, topics[2] = to address
      const toAddress = log.topics[2];
      if (!toAddress) continue;

      // The address is zero-padded in the topic, extract last 40 chars
      const parsedTo = "0x" + toAddress.slice(26).toLowerCase();

      if (parsedTo !== recipientLower) continue;

      // Decode the amount from log data
      const amount = BigInt(log.data);

      if (amount >= requiredAmount) {
        paymentFound = true;
        break;
      }
    }

    if (!paymentFound) {
      return {
        valid: false,
        errorMessage: `No valid USDC transfer of at least ${x402Config.priceUSDC} USDC to ${x402Config.recipientAddress} found in transaction`,
      };
    }

    return { valid: true, txHash };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown verification error";
    return { valid: false, errorMessage: `Payment verification failed: ${message}` };
  }
}

/**
 * Builds the 402 Payment Required response with payment requirements.
 * This tells the client exactly how to pay for the resource.
 */
export function buildPaymentRequirements() {
  const requiredAmount = parseUnits(x402Config.priceUSDC, x402Config.usdcDecimals);
  const deadline = Math.floor(Date.now() / 1000) + x402Config.paymentValiditySeconds;

  return {
    x402Version: 1,
    accepts: [
      {
        scheme: "exact",
        network: x402Config.chain.name,
        chainId: String(x402Config.chain.id),
        maxAmountRequired: requiredAmount.toString(),
        resource: x402Config.resource,
        description: `Pay ${x402Config.priceUSDC} USDC to access premium API data`,
        mimeType: "application/json",
        payToAddress: x402Config.recipientAddress,
        requiredPaymentToken: x402Config.usdcAddress,
        requiredDeadline: String(deadline),
        extra: {
          name: "USDC",
          decimals: String(x402Config.usdcDecimals),
        },
      },
    ],
  };
}
