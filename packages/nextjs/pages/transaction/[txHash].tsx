// pages/transaction/[txHash].tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { ethers } from "ethers";
import type { NextPage } from "next";

const TransactionPage: NextPage = () => {
  const router = useRouter();
  const { txHash } = router.query;

  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

  useEffect(() => {
    if (txHash) {
      const fetchTransaction = async () => {
        const tx = await provider.getTransaction(txHash as string);
        setTransaction(tx);
        console.log("transaction page tx", tx);
      };

      fetchTransaction();
    }
  }, [txHash]);

  const goBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col items-center justify-center py-2 mt-8">
      <button className="mb-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={goBack}>
        Back
      </button>
      {transaction ? (
        <div className="p-8 border-b border-gray-200 shadow-lg overflow-hidden rounded-lg w-3/4 bg-white">
          <h2 className="text-3xl font-bold mb-4 text-center text-gray-700">Transaction Details</h2>
          <p className="mb-4 text-gray-700">
            <strong className="font-semibold text-gray-900">Transaction Hash:</strong> {transaction.hash}
          </p>
          <p className="mb-4 text-gray-700">
            <strong className="font-semibold text-gray-900">Block Number:</strong> {transaction.blockNumber}
          </p>
          <p className="mb-4 text-gray-700">
            <strong className="font-semibold text-gray-900">From:</strong> {transaction.from}
          </p>
          <p className="mb-4 text-gray-700">
            <strong className="font-semibold text-gray-900">To:</strong> {transaction.to}
          </p>
          <p className="mb-4 text-gray-700">
            <strong className="font-semibold text-gray-900">Value:</strong>{" "}
            {ethers.utils.formatEther(transaction.value)} ETH
          </p>
          <p className="mb-4 text-gray-700">
            <strong className="font-semibold text-gray-900">Gas Price:</strong>{" "}
            {ethers.utils.formatUnits(transaction.gasPrice || ethers.constants.Zero, "gwei")} Gwei
          </p>
          <div className="mb-4">
            <strong className="font-semibold text-gray-900 block mb-2">Data:</strong>
            <textarea
              readOnly
              value={transaction.data}
              className="w-full h-32 p-2 border-2  text-gray-900 border-gray-200 rounded resize-none overflow-auto"
            />
          </div>
        </div>
      ) : (
        <p className="text-2xl text-gray-700">Loading...</p>
      )}
    </div>
  );
};

export default TransactionPage;
