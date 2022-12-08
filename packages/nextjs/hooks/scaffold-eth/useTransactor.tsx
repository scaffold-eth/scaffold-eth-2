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

      const etherscanTxBaseUrl = network ? getBlockExplorerTxLink(network) : "";

      if (tx instanceof Promise) {
        toastId = toast.loading("Awaiting for user confirmation");
        const transactionRes = await tx;
        toast.remove(toastId);

        // TODO add etherscan url in loading toast
        toastId = toast.loading("Mining transaction, Hold tight!");
        transactionReceipt = await transactionRes.wait();
        toast.remove(toastId);

        customToast.tx(`${etherscanTxBaseUrl}/${transactionRes.hash}`);
      } else if (tx != null) {
        if (!tx.gasPrice) {
          tx.gasPrice = gasPrice || ethers.utils.parseUnits("4.1", "gwei");
        }
        if (!tx.gasLimit) {
          tx.gasLimit = BigNumber.from(ethers.utils.hexlify(120000));
        }

        toastId = toast.loading("Awaiting for user confirmation");
        const transactionRes = await signer.sendTransaction(tx);
        toast.remove(toastId);

        // TODO add etherscan url in loading toast
        toastId = toast.loading("Mining transaction, Hold tight!");
        transactionReceipt = await transactionRes.wait();
        toast.remove(toastId);

        customToast.tx(`${etherscanTxBaseUrl}/${transactionRes.hash}`);
      }

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
