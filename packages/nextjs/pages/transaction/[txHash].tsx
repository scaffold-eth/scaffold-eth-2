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
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <button className="mb-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={goBack}>
        Back
      </button>
      {transaction ? (
        <div className="p-6 border-b border-gray-200 shadow-md overflow-hidden rounded-lg w-1/2">
          <h2 className="text-2xl font-bold mb-2 text-center">Transaction Details</h2>
          <p className="mb-2">
            <strong className="font-bold">Transaction Hash:</strong> {transaction.hash}
          </p>
          <p className="mb-2">
            <strong className="font-bold">Block Number:</strong> {transaction.blockNumber}
          </p>
          <p className="mb-2">
            <strong className="font-bold">From:</strong> {transaction.from}
          </p>
          <p className="mb-2">
            <strong className="font-bold">To:</strong> {transaction.to}
          </p>
          <p className="mb-2">
            <strong className="font-bold">Value:</strong> {ethers.utils.formatEther(transaction.value)} ETH
          </p>
          <p className="mb-2">
            <strong>Gas Price:</strong>{" "}
            {ethers.utils.formatUnits(transaction.gasPrice || ethers.constants.Zero, "gwei")} Gwei
          </p>
          <p className="mb-2">
            <strong className="font-bold">Data:</strong> {transaction.data}
          </p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default TransactionPage;
