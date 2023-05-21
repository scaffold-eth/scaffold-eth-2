import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { TransactionResponse } from "@ethersproject/providers";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const TXS_PER_PAGE = 20;

const AddressPage: NextPage = () => {
  const router = useRouter();
  const address = typeof router.query.address === "string" ? router.query.address : "";
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [balance, setBalance] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [transactionReceipts, setTransactionReceipts] = useState<{
    [key: string]: ethers.providers.TransactionReceipt;
  }>({});
  const configuredNetwork = getTargetNetwork();

  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

  useEffect(() => {
    provider.getBalance(address).then(balance => {
      setBalance(ethers.utils.formatEther(balance));
    });
  }, [address]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const currentBlockNumber = await provider.getBlockNumber();
      const fetchedTransactions: TransactionResponse[] = [];
      const receipts: { [key: string]: ethers.providers.TransactionReceipt } = {};

      for (let i = currentBlockNumber; i >= 0; i--) {
        const block = await provider.getBlockWithTransactions(i);

        for (const tx of block.transactions) {
          if (
            tx.from.toLowerCase() === address.toLowerCase() ||
            (tx.to && tx.to.toLowerCase() === address.toLowerCase())
          ) {
            fetchedTransactions.push(tx);
            const receipt = await provider.getTransactionReceipt(tx.hash);
            receipts[tx.hash] = receipt;
          }
        }
      }

      setTransactions(fetchedTransactions);
      setTransactionReceipts(receipts);
    };

    if (address) fetchTransactions();
  }, [address]);

  const displayedTransactions = transactions.slice(currentPage * TXS_PER_PAGE, (currentPage + 1) * TXS_PER_PAGE);

  const totalTransactions = transactions.length;

  return (
    <div className="flex flex-col items-center justify-center py-2 mt-8">
      <button
        className="mb-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => router.back()}
      >
        Back
      </button>
      <h1 className="text-4xl mb-6 text-center">Transactions for Address: {address}</h1>
      <p className="text-2xl text-center mb-6">
        Balance: {balance} {configuredNetwork.nativeCurrency.symbol}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border-2 border-gray-200 shadow-md overflow-hidden rounded-lg">
          <thead className="text-left">
            <tr>
              <th className="px-4 py-2">Transaction Hash</th>
              <th className="px-4 py-2">Block Number</th>
              <th className="px-4 py-2">From</th>
              <th className="px-4 py-2">To</th>
              <th className="px-4 py-2">Value ({configuredNetwork.nativeCurrency.symbol})</th>
            </tr>
          </thead>
          <tbody>
            {displayedTransactions.map(tx => {
              const shortTxHash = `${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}`;
              const receipt = transactionReceipts[tx.hash];

              return (
                <tr key={tx.hash}>
                  <td className="border px-4 py-2">
                    <Link className="text-blue-500 underline" href={`/transaction/${tx.hash}`}>
                      {shortTxHash}
                    </Link>
                  </td>
                  <td className="border px-4 py-2">{tx.blockNumber}</td>
                  <td className="border px-4 py-2">
                    <Address address={tx.from} />
                  </td>
                  <td className="border px-4 py-2">
                    {!receipt?.contractAddress ? (
                      tx.to && <Address address={tx.to} />
                    ) : (
                      <span>
                        Contract Creation:
                        <Address address={receipt.contractAddress} />
                      </span>
                    )}
                  </td>
                  <td className="border px-4 py-2">
                    {ethers.utils.formatEther(tx.value)} {configuredNetwork.nativeCurrency.symbol}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex justify-end mt-5">
          <button
            className={`px-4 py-2 mr-2 rounded-lg ${
              currentPage === 0 ? "bg-gray-200 cursor-default" : "bg-blue-500 text-white"
            }`}
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            {"<"}
          </button>
          <span className="mr-2">Page {currentPage + 1}</span>
          <button
            className={`px-4 py-2 rounded-lg ${
              (currentPage + 1) * TXS_PER_PAGE >= totalTransactions
                ? "bg-gray-200 cursor-default"
                : "bg-blue-500 text-white"
            }`}
            disabled={(currentPage + 1) * TXS_PER_PAGE >= totalTransactions}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            {">"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressPage;
