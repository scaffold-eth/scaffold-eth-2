import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { TransactionResponse } from "@ethersproject/providers";
import { ethers } from "ethers";
import type { NextPage } from "next";

const AddressPage: NextPage = () => {
  const router = useRouter();
  const address = typeof router.query.address === "string" ? router.query.address : "";
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [balance, setBalance] = useState<string | null>(null);
  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

  useEffect(() => {
    if (provider) {
      provider.getBalance(address).then(balance => {
        setBalance(ethers.utils.formatEther(balance));
      });
    }
  }, [address]);

  useEffect(() => {
    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

    const fetchTransactions = async () => {
      const currentBlockNumber = await provider.getBlockNumber();

      const fetchedTransactions: TransactionResponse[] = [];

      for (let i = currentBlockNumber; i >= 0 && fetchedTransactions.length < 10; i--) {
        const block = await provider.getBlockWithTransactions(i);

        for (const tx of block.transactions) {
          if (
            tx.from.toLowerCase() === address.toLowerCase() ||
            (tx.to && tx.to.toLowerCase() === address.toLowerCase())
          ) {
            fetchedTransactions.push(tx);
            if (fetchedTransactions.length >= 10) {
              break;
            }
          }
        }
      }

      setTransactions(fetchedTransactions);
    };

    if (address) fetchTransactions();
  }, [address]);

  const goBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col items-center justify-center py-2 mt-8">
      <button className="mb-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={goBack}>
        Back
      </button>
      <h1 className="text-4xl mb-6 text-center">Latest 10 Transactions for Address: {address}</h1>
      <p className="text-2xl text-center mb-6">Balance: {balance} ETH</p>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border-2 border-gray-200 shadow-md overflow-hidden rounded-lg">
          <thead className="text-left">
            <tr>
              <th className="px-4 py-2">Transaction Hash</th>
              <th className="px-4 py-2">Block Number</th>
              <th className="px-4 py-2">From</th>
              <th className="px-4 py-2">To</th>
              <th className="px-4 py-2">Value (ETH)</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => {
              const shortTxHash = `${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}`;
              const shortFrom = `${tx.from.substring(0, 6)}...${tx.from.substring(tx.from.length - 4)}`;
              const shortTo = tx.to ? `${tx.to.substring(0, 6)}...${tx.to.substring(tx.to.length - 4)}` : "";

              return (
                <tr key={tx.hash}>
                  <td className="border px-4 py-2">
                    <Link className="text-blue-500 underline" href={`/transaction/${tx.hash}`}>
                      {shortTxHash}
                    </Link>
                  </td>
                  <td className="border px-4 py-2">{tx.blockNumber}</td>
                  <td className="border px-4 py-2">
                    <Link className="text-blue-500 underline" href={`/address/${tx.from}`}>
                      {shortFrom}
                    </Link>
                  </td>
                  <td className="border px-4 py-2">
                    {tx.to && (
                      <Link className="text-blue-500 underline" href={`/address/${tx.to}`}>
                        {shortTo}
                      </Link>
                    )}
                  </td>
                  <td className="border px-4 py-2">{ethers.utils.formatEther(tx.value)} ETH</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddressPage;
