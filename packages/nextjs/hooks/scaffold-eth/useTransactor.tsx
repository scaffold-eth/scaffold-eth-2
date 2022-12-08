import { TransactionRequest, TransactionResponse, TransactionReceipt } from "@ethersproject/abstract-provider";
import { SendTransactionResult } from "@wagmi/core";
import { BigNumber, ethers, Signer } from "ethers";
import { Deferrable } from "ethers/lib/utils";
import { useSigner } from "wagmi";
import toast from "react-hot-toast";
import { getParsedEthersError } from "~~/components/scaffold-eth/Contract/utilsContract";
import { toast as customToast } from "~~/components/scaffold-eth/index";
import { getBlockExplorerTxLink } from "~~/utils/scaffold-eth";

type TTransactionFunc = (
  tx: Promise<SendTransactionResult> | Deferrable<TransactionRequest> | undefined,
  callback?: ((_param: any) => void) | undefined,
) => Promise<Record<string, any> | undefined>;

export const useTransactor = (_signer?: Signer, gasPrice?: number): TTransactionFunc | undefined => {
  /**
   * ### Summary 
    if signer is provided in params use it(this means dev wants to send a raw transaction)
    else use the signer from connect wallet (mostly its an wagmi writeTxn)
   */
  let signer = _signer;
  const { data } = useSigner();
  if (signer === undefined && data) {
    signer = data;
  }

  const result: TTransactionFunc = async (tx, callback) => {
    if (!signer) {
      return;
    }

    let toastId = null;
    let transactionReceipt: TransactionReceipt | undefined;
    let transactionResponse: SendTransactionResult | TransactionResponse | undefined;
    try {
      const provider = signer.provider;
      const network = await provider?.getNetwork();

      toastId = customToast.txnLoading("Awaiting for user confirmation", "");
      if (tx instanceof Promise) {
        // Tx is already prepared by the caller
        transactionResponse = await tx;
      } else if (tx != null) {
        // Raw tx
        if (!tx.gasPrice) {
          tx.gasPrice = gasPrice || ethers.utils.parseUnits("4.1", "gwei");
        }
        if (!tx.gasLimit) {
          tx.gasLimit = BigNumber.from(ethers.utils.hexlify(120000));
        }

        transactionResponse = await signer.sendTransaction(tx);
      } else {
        throw new Error("Incorrect transaction passed to transactor");
      }
      toast.remove(toastId);

      const etherscanTxnURL = network ? getBlockExplorerTxLink(network, transactionResponse.hash) : "";

      toastId = customToast.txnLoading("Mining transaction, Hold tight!", etherscanTxnURL);
      transactionReceipt = await transactionResponse.wait();
      toast.remove(toastId);

      customToast.txnSuccess("Mined successfully !", etherscanTxnURL);

      if (transactionReceipt) {
        if (callback != null && transactionReceipt.blockHash != null && transactionReceipt.confirmations >= 1) {
          callback({ ...transactionResponse, ...transactionReceipt });
        }
      }
    } catch (error: any) {
      if (toastId) {
        toast.remove(toastId);
      }
      // TODO handle error properly
      console.error("⚡️ ~ file: useTransactor.ts ~ line 98 ~ constresult:TTransactionFunc= ~ error", error);
      const message = getParsedEthersError(error);
      toast.error(message, {
        style: {
          wordBreak: "break-all",
        },
      });
    }

    return transactionResponse;
  };

  return result;
};
