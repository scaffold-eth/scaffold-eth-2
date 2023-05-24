// pages/transaction/[txHash].tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const TransactionPage: NextPage = () => {
  const router = useRouter();
  const { txHash } = router.query;
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);
  const [receipt, setReceipt] = useState<ethers.providers.TransactionReceipt | null>(null);

  const configuredNetwork = getTargetNetwork();
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

  useEffect(() => {
    if (txHash) {
      const fetchTransaction = async () => {
        const tx = await provider.getTransaction(txHash as string);
        const receipt = await provider.getTransactionReceipt(txHash as string);

        setTransaction(tx);
        setReceipt(receipt);

        console.log("transaction page tx", tx);
      };

      fetchTransaction();
    }
  }, [txHash]);

  return (
    <div className="m-10 mb-20">
      <button
        className="btn bg-primary text-primary-content hover:bg-accent hover:text-accent-content shadow-md transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110 mb-5"
        onClick={() => router.back()}
      >
        Back
      </button>
      {transaction ? (
        <div className="overflow-x-auto shadow-lg rounded-lg bg-base p-8">
          <h2 className="text-3xl font-bold mb-4 text-center text-primary-content">Transaction Details</h2>{" "}
          <table className="min-w-full divide-y divide-primary rounded-lg bg-neutral">
            <tbody className="bg-base-100 divide-y divide-primary-content text-base-content">
              <tr className="bg-base-200 hover:bg-base-300 transition-colors duration-200">
                <td className="border px-4 py-2 text-base-content">
                  <strong className="text-primary-content">Transaction Hash:</strong>
                </td>
                <td className="border px-4 py-2 text-base-content">{transaction.hash}</td>
              </tr>
              <tr className="bg-base-200 hover:bg-base-300 transition-colors duration-200">
                <td className="border px-4 py-2 text-base-content">
                  <strong className="text-primary-content">Block Number:</strong>
                </td>
                <td className="border px-4 py-2 text-base-content">{transaction.blockNumber}</td>
              </tr>
              <tr className="bg-base-200 hover:bg-base-300 transition-colors duration-200">
                <td className="border px-4 py-2 text-base-content">
                  <strong className="text-primary-content">From:</strong>
                </td>
                <td className="border px-4 py-2 text-base-content">
                  <Address address={transaction.from} format="long" />
                </td>
              </tr>
              <tr className="bg-base-200 hover:bg-base-300 transition-colors duration-200">
                <td className="border px-4 py-2 text-base-content">
                  <strong className="text-primary-content">To:</strong>
                </td>
                <td className="border px-4 py-2 text-base-content">
                  {!receipt?.contractAddress ? (
                    transaction.to && <Address address={transaction.to} format="long" />
                  ) : (
                    <span>
                      Contract Creation:
                      <Address address={receipt.contractAddress} format="long" />
                    </span>
                  )}
                </td>
              </tr>
              <tr className="bg-base-200 hover:bg-base-300 transition-colors duration-200">
                <td className="border px-4 py-2 text-base-content">
                  <strong className="text-primary-content">Value:</strong>
                </td>
                <td className="border px-4 py-2 text-base-content">
                  {ethers.utils.formatEther(transaction.value)} {configuredNetwork.nativeCurrency.symbol}
                </td>
              </tr>
              <tr className="bg-base-200 hover:bg-base-300 transition-colors duration-200">
                <td className="border px-4 py-2 text-base-content">
                  <strong className="text-primary-content">Gas Price:</strong>
                </td>
                <td className="border px-4 py-2 text-base-content">
                  {ethers.utils.formatUnits(transaction.gasPrice || ethers.constants.Zero, "gwei")} Gwei
                </td>
              </tr>
              <tr className="bg-base-200 hover:bg-base-300 transition-colors duration-200">
                <td className="border px-4 py-2 text-base-content">
                  <strong className="text-primary-content">Data:</strong>
                </td>
                <td className="border px-4 py-2 ">
                  <textarea
                    readOnly
                    value={transaction.data}
                    className="w-full h-32 p-2 border-2 bg-inherit text-base-content border-primary rounded resize-none overflow-auto"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-2xl text-base-content">Loading...</p>
      )}
    </div>
  );
};

export default TransactionPage;
