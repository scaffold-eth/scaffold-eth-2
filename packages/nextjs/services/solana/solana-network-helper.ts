import { getKeypairFromFile } from "@solana-developers/helpers";
import { Cluster, Connection, Keypair, TransactionSignature, clusterApiUrl } from "@solana/web3.js";
import bs58 from "bs58";

export type NetworkType = "localhost" | "devnet" | "testnet" | "mainnet";
export type TokenProgramType = "token_22" | "token";

const localhostRpc = "http://127.0.0.1:8899";

export const getConnection = (networkType: NetworkType) => {
  if (networkType === "localhost") {
    return new Connection(localhostRpc, { commitment: "confirmed" });
  } else {
    let cluster: Cluster;

    switch (networkType) {
      case "devnet":
        cluster = "devnet";
        break;
      case "testnet":
        cluster = "testnet";
        break;
      case "mainnet":
        cluster = "mainnet-beta";
        break;
      default:
        throw new Error("Unknown network type: " + networkType);
    }

    return new Connection(clusterApiUrl(cluster), { commitment: "confirmed" });
  }
};

export const getTransactionExplorerUrl = (networkType: NetworkType, tx: TransactionSignature) => {
  let url: string;

  switch (networkType) {
    case "localhost":
      url = `https://explorer.solana.com/tx/${tx}?cluster=custom&customUrl=${localhostRpc}`;
      break;
    case "devnet":
      url = `https://explorer.solana.com/tx/${tx}?cluster=devnet`;
      break;
    case "testnet":
      url = `https://explorer.solana.com/tx/${tx}?cluster=testnet`;
      break;
    case "mainnet":
      url = `https://explorer.solana.com/tx/${tx}`;
      break;
    default:
      throw new Error("Unknown network type: " + networkType);
  }

  return url;
};

export const getWallet = async (filePath: string) => {
  return await getKeypairFromFile(filePath);
};

export const getWalletFromPrivateKey = (pk: string) => {
  const decodedKey = bs58.decode(pk);
  return Keypair.fromSecretKey(decodedKey);
};
