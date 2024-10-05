import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import SolanaHelper from "~~/services/solana/solana-helper";
import { NetworkType, getConnection, getTransactionExplorerUrl } from "~~/services/solana/solana-network-helper";

const network = (process.env.SOLANA_NETWORK || "devnet") as NetworkType;
const currentNetwork: NetworkType = network;

const connection = getConnection(currentNetwork);
const solanaHelper = new SolanaHelper(connection);

interface DistributionPayload {
  walletAddresses: PublicKey[];
  amounts: number[];
}

export async function POST(req: Request) {
  try {
    const distributeApiKey = process.env.DISTRIBUTE_API_KEY;

    const apiKey = req.headers.get("api-key");
    const { walletAddresses, amounts } = (await req.json()) as DistributionPayload;

    if (String(apiKey).toLowerCase() !== String(distributeApiKey).toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    if (walletAddresses.length !== amounts.length) {
      return NextResponse.json({ error: "Invalid transaction data" }, { status: 400 });
    }

    try {
      walletAddresses.forEach(address => {
        new PublicKey(address);
      });
    } catch (err) {
      return NextResponse.json({ error: "Invalid wallet addresses" }, { status: 400 });
    }

    amounts.forEach(amount => {
      if (amount <= 0) {
        return NextResponse.json({ error: "Amount must be greater than zero" }, { status: 400 });
      }
    });

    const transferTransactionSignature = await solanaHelper.distributeFundsForLeaderboard(walletAddresses, amounts);

    return NextResponse.json(
      {
        message: "Tokens distributed successfully",
        transactionUrl: getTransactionExplorerUrl(currentNetwork, transferTransactionSignature),
        transactionSignature: transferTransactionSignature,
      },
      { status: 200 },
    );
  } catch (error) {
    // Error log will be consoled for the debugging purposes
    console.log(error);
    return NextResponse.json({ error: "Distribution failed" }, { status: 400 });
  }
}
