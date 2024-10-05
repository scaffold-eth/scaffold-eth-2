import { getWalletFromPrivateKey } from "./solana-network-helper";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  TransactionSignature,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

class SolanaHelper {
  connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  async getTransferIx(fromAccount: Keypair, toAccount: PublicKey, amount: number): Promise<TransactionInstruction> {
    return await SystemProgram.transfer({
      fromPubkey: fromAccount.publicKey,
      toPubkey: toAccount,
      lamports: amount * LAMPORTS_PER_SOL,
    });
  }

  async transfer(fromAccount: Keypair, toAccount: PublicKey, amount: number): Promise<TransactionSignature> {
    const ix = await this.getTransferIx(fromAccount, toAccount, amount);
    const transaction = new Transaction().add(ix);

    return await sendAndConfirmTransaction(this.connection, transaction, [fromAccount]);
  }

  async batchTransfer(fromAccount: Keypair, toAccounts: PublicKey[], amounts: number[]): Promise<TransactionSignature> {
    if (toAccounts.length !== amounts.length) {
      throw new Error("Invalid transaction data");
    }

    const transferTransactions: TransactionInstruction[] = [];
    let count = 0;
    for await (const wallet of toAccounts) {
      const ix = await this.getTransferIx(fromAccount, wallet, amounts[count]);
      transferTransactions.push(ix);
      count++;
    }

    const transaction = new Transaction().add(...transferTransactions);

    return await sendAndConfirmTransaction(this.connection, transaction, [fromAccount]);
  }

  async distributeFundsForLeaderboard(userWallets: PublicKey[], amounts: number[]): Promise<TransactionSignature> {
    const serverPk = process.env.SOLANA_SERVER_WALLET_PK;

    if (!serverPk || serverPk === "") {
      throw new Error("Invalid server wallet");
    }

    const serverWallet = getWalletFromPrivateKey(serverPk);
    return await this.batchTransfer(serverWallet, userWallets, amounts);
  }
}

export default SolanaHelper;
