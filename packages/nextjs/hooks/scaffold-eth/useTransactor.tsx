import { TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { SendTransactionResult } from "@wagmi/core";
import { BigNumber, ethers, Signer } from "ethers";
import { Deferrable } from "ethers/lib/utils";
import { useSigner } from "wagmi";
import toast from "react-hot-toast";
import { getParsedEthersError } from "~~/components/scaffold-eth/Contract/utilsContract";

const DEBUG = true;

type TTransactionFunc = (
  tx: Promise<SendTransactionResult> | Deferrable<TransactionRequest> | undefined,
  callback?: ((_param: any) => void) | undefined,
) => Promise<Record<string, any> | undefined>;

export const useTransactor = (_signer?: Signer, gasPrice?: number): TTransactionFunc | undefined => {
  /**
   * ### Summary 
    if signer is provided in params use it(this means dev wants to a raw transaction)
    else use the signer from connect wallet (mostly its an wagmi writeTxn)
   */
  let signer = _signer;
  const { data } = useSigner();
  if (signer === undefined && data) {
    signer = data;
  }

  const result: TTransactionFunc = async (tx, callback) => {
    let transactionResponse: TransactionResponse | SendTransactionResult | undefined;
    if (signer) {
      try {
        const chainId = await signer.getChainId();
        const provider = signer.provider;
        const networkName = (await provider?.getNetwork())?.name;

        let etherscanNetwork = "";
        if (networkName && chainId && chainId > 1) {
          etherscanNetwork = networkName + ".";
        }

        // TODO add etherscan url in toast
        let etherscanTxUrl = "https://" + etherscanNetwork + "etherscan.io/tx/";
        if (chainId && chainId === 100) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          etherscanTxUrl = "https://blockscout.com/poa/xdai/tx/";
        }

        if (tx instanceof Promise) {
          if (DEBUG) console.log("AWAITING TX", tx);
          transactionResponse = await toast.promise(
            tx,
            {
              loading: "Mining transaction, Hold tight!",
              success: "Mined successfully !",
              error: "Error while processing the transaction",
            },
            {
              success: {
                icon: "🔥",
              },
            },
          );
        } else if (tx != null) {
          if (!tx.gasPrice) {
            tx.gasPrice = gasPrice || ethers.utils.parseUnits("4.1", "gwei");
          }
          if (!tx.gasLimit) {
            tx.gasLimit = BigNumber.from(ethers.utils.hexlify(120000));
          }
          if (DEBUG) console.log("RUNNING TX", tx);

          transactionResponse = await toast.promise(
            signer.sendTransaction(tx),
            {
              loading: "Mining transaction, Hold tight!",
              success: "Mined successfully !",
              error: "Error while processing the transaction",
            },
            {
              success: {
                icon: "🔥",
              },
            },
          );
        }

        if (transactionResponse) {
          if (callback != null && transactionResponse?.hash != null) {
            let listeningInterval: NodeJS.Timeout | undefined = undefined;
            listeningInterval = setInterval(async (): Promise<void> => {
              if (transactionResponse?.hash != null) {
                console.log("CHECK IN ON THE TX", transactionResponse, provider);
                const currentTransactionReceipt = await provider?.getTransactionReceipt(transactionResponse.hash);
                if (currentTransactionReceipt && currentTransactionReceipt.confirmations) {
                  callback({ ...transactionResponse, ...currentTransactionReceipt });
                  if (listeningInterval) clearInterval(listeningInterval);
                }
              }
            }, 500);
          }

          await transactionResponse.wait();
        }
      } catch (error: any) {
        // TODO handle error properly
        console.log("⚡️ ~ file: useTransactor.ts ~ line 98 ~ constresult:TTransactionFunc= ~ error", error);
        const message = getParsedEthersError(error);
        toast.error(message);
      }
    }

    return transactionResponse;
  };

  return result;
};
