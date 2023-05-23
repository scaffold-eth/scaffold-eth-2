import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { TransactionResponse } from "@ethersproject/providers";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { PaginationButton } from "~~/components/blockexplorer/PaginationButton";
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
  const [isLoading, setIsLoading] = useState(false);
  const configuredNetwork = getTargetNetwork();

  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

  useEffect(() => {
    provider.getBalance(address).then(balance => {
      setBalance(ethers.utils.formatEther(balance));
    });
  }, [address]);

  useEffect(() => {
    setIsLoading(true);

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
      setIsLoading(false);
    };

    if (address) fetchTransactions();
  }, [address]);

  const displayedTransactions = transactions.slice(currentPage * TXS_PER_PAGE, (currentPage + 1) * TXS_PER_PAGE);

  const totalTransactions = transactions.length;

  return (
    <div className="m-10 mb-20">
      <div className="flex justify-start mb-5">
        <button
          className="btn bg-primary text-primary-content hover:bg-accent hover:text-accent-content shadow-md transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110"
          onClick={() => router.back()}
        >
          Back
        </button>
      </div>
      <h1 className="text-4xl mb-6 text-center text-primary-content">Transactions for Address: {address}</h1>
      <p className="text-2xl text-center mb-6 text-primary-content">
        Balance: {balance} {configuredNetwork.nativeCurrency.symbol}
      </p>

      <div className="overflow-x-auto shadow-lg">
        <table className="min-w-full divide-y divide-primary shadow-lg rounded-lg bg-neutral">
          <thead className="bg-primary">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary-content uppercase tracking-wider">
                Transaction Hash
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary-content uppercase tracking-wider">
                Block Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary-content uppercase tracking-wider">
                From
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary-content uppercase tracking-wider">
                To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary-content uppercase tracking-wider">
                Value ({configuredNetwork.nativeCurrency.symbol})
              </th>
            </tr>
          </thead>
          {isLoading ? (
            <tbody className="bg-base-100 divide-y divide-primary-content text-base-content">
              {[...Array(20)].map((_, rowIndex) => (
                <tr key={rowIndex} className="bg-base-200 hover:bg-base-300 transition-colors duration-200 h-12">
                  {[...Array(5)].map((_, colIndex) => (
                    <td
                      key={colIndex}
                      className={`${
                        colIndex === 1 ? "w-full md:w-1/2 lg:w-1/5" : "w-20"
                      } border px-4 py-2 text-base-content`}
                    >
                      <div
                        className="h-2 bg-gray-200 rounded-full w-3/4 animate-pulse"
                        style={{
                          animationDelay: `${0.1 * (rowIndex + colIndex)}s`,
                        }}
                      ></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody className="bg-base-100 divide-y divide-primary-content text-base-content">
              {displayedTransactions.map(tx => {
                const shortTxHash = `${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}`;
                const receipt = transactionReceipts[tx.hash];

                return (
                  <tr key={tx.hash} className="bg-base-200 hover:bg-base-300 transition-colors duration-200">
                    <td className="border px-4 py-2 text-base-content">
                      <Link className="text-base-content hover:text-accent-focus" href={`/transaction/${tx.hash}`}>
                        {shortTxHash}
                      </Link>
                    </td>
                    <td className="border px-4 py-2 w-20 text-base-content">{tx.blockNumber}</td>
                    <td className="border px-4 py-2 text-base-content">
                      <Address address={tx.from} />
                    </td>
                    <td className="border px-4 py-2 text-base-content">
                      {!receipt?.contractAddress ? (
                        tx.to && <Address address={tx.to} />
                      ) : (
                        <span>
                          Contract Creation:
                          <Address address={receipt.contractAddress} />
                        </span>
                      )}
                    </td>
                    <td className="border px-4 py-2 text-base-content">
                      {ethers.utils.formatEther(tx.value)} {configuredNetwork.nativeCurrency.symbol}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>
      </div>

      <PaginationButton currentPage={currentPage} totalItems={totalTransactions} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default AddressPage;
