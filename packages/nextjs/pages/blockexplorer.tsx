import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { BlockWithTransactions, TransactionResponse } from "@ethersproject/abstract-provider";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { Address } from "~~/components/scaffold-eth";

// TODO: Add OPCODES and maybe STORAGE for contracts
// TODO: Better pagination(some pages have less than 10 blocks)

type TransactionWithFunction = TransactionResponse & { functionName?: string };

const Blockexplorer: NextPage = () => {
  const [blocks, setBlocks] = useState<BlockWithTransactions[]>([]);
  const [transactionReceipts, setTransactionReceipts] = useState<{
    [key: string]: ethers.providers.TransactionReceipt;
  }>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalBlocks, setTotalBlocks] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchedBlock, setSearchedBlock] = useState<BlockWithTransactions | null>(null);
  const [searchedTransaction, setSearchedTransaction] = useState<TransactionWithFunction | null>(null);
  const [searchedAddress, setSearchedAddress] = useState<string | null>(null);
  const router = useRouter();

  const blocksPerPage = 10;

  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

  async function getFunctionName(signature: string) {
    const normalizedSignature = signature.startsWith("0x") ? signature.slice(2) : signature;

    try {
      const response = await fetch(
        `https://www.4byte.directory/api/v1/signatures/?hex_signature=${normalizedSignature}`,
      );
      const json = await response.json();

      if (json.count > 0) {
        return json.results[0].text_signature;
      }
    } catch (error) {
      console.error("Failed to fetch function name:", error);
    }
    return `0x${normalizedSignature}`;
  }

  const fetchBlocks = async () => {
    const blockNumber = await provider.getBlockNumber();
    setTotalBlocks(blockNumber);
    const blocks: BlockWithTransactions[] = [];
    const receipts: { [key: string]: ethers.providers.TransactionReceipt } = {};

    const startingBlock = blockNumber - currentPage * blocksPerPage;
    for (let i = 0; i < blocksPerPage; i++) {
      const blockNumberToFetch = startingBlock - i;
      if (blockNumberToFetch < 0) {
        break;
      }

      const block = (await provider.getBlockWithTransactions(blockNumberToFetch)) as BlockWithTransactions & {
        transactions: TransactionWithFunction[];
      };
      blocks.push(block);
      for (const tx of block.transactions as TransactionWithFunction[]) {
        const receipt = await provider.getTransactionReceipt(tx.hash);
        receipts[tx.hash] = receipt;

        if (tx.data.length >= 10 && !tx.data.startsWith("0x60a06040")) {
          const functionSignature = tx.data.substring(0, 10);
          tx.functionName = await getFunctionName(functionSignature);
          console.log("tx.functionName", tx.functionName);
        }
      }
    }

    setBlocks(blocks);
    setTransactionReceipts(receipts);
  };

  const handleSearch = async () => {
    setSearchedBlock(null);
    setSearchedTransaction(null);
    setSearchedAddress(null);

    if (ethers.utils.isHexString(searchInput)) {
      try {
        const tx = await provider.getTransaction(searchInput);
        if (tx) {
          router.push(`/transaction/${searchInput}`);
          return;
        }
      } catch (error) {
        console.error("Failed to fetch transaction:", error);
      }
    }

    if (ethers.utils.isAddress(searchInput)) {
      router.push(`/address/${searchInput}`);
      return;
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, [currentPage]);

  useEffect(() => {
    provider.on("block", async blockNumber => {
      const newBlock = await provider.getBlockWithTransactions(blockNumber);

      if (!blocks.some(block => block.number === newBlock.number)) {
        if (currentPage === 0) {
          setBlocks(prevBlocks => [newBlock, ...prevBlocks.slice(0, blocksPerPage - 1)]);

          for (const tx of newBlock.transactions) {
            const receipt = await provider.getTransactionReceipt(tx.hash);
            setTransactionReceipts(prevReceipts => ({
              ...prevReceipts,
              [tx.hash]: receipt,
            }));
          }
        }
        setTotalBlocks(blockNumber + 1);
      }
    });

    return () => {
      provider.off("block");
    };
  }, [blocks, currentPage]);

  return (
    <div className="m-10">
      <div className="flex justify-end mb-5">
        <input
          type="text"
          className="border border-gray-200 p-2 mr-2 w-full md:w-1/2 lg:w-1/2 rounded-md"
          placeholder="Search by hash or address"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value.trim())}
        />

        <button className="btn btn-primary" onClick={handleSearch}>
          Search
        </button>
      </div>
      {searchedBlock && (
        <div className="mb-5">
          <h2 className="mb-2">Searched Block: {searchedBlock.number}</h2>
          <ul>
            {searchedBlock.transactions.map((tx, index) => (
              <li key={index}>{tx.hash}</li>
            ))}
          </ul>
        </div>
      )}
      {searchedTransaction && (
        <div className="mb-5">
          <h2 className="mb-2">Searched Transaction: {searchedTransaction.hash}</h2>
          <p>From: {searchedTransaction.from}</p>
          <p>To: {searchedTransaction.to}</p>
          <p>Value: {ethers.utils.formatEther(searchedTransaction.value)} ETH</p>
        </div>
      )}
      {searchedAddress && (
        <div className="mb-5">
          <h2 className="mb-2">Searched Address: {searchedAddress}</h2>
          <p>Transactions related to this address:</p>
          <ul>
            {blocks
              .flatMap(block => block.transactions)
              .filter(tx => tx.from === searchedAddress || tx.to === searchedAddress)
              .map((tx, index) => (
                <li key={index}>{tx.hash}</li>
              ))}
          </ul>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border-2 border-gray-200 shadow-md overflow-hidden rounded-lg">
          <thead className="text-left">
            <tr>
              <th className="px-4 py-2">Transaction Hash</th>
              <th className="px-4 py-2">Function Called</th>
              <th className="px-4 py-2">Block Number</th>
              <th className="px-4 py-2">Time Mined</th>
              <th className="px-4 py-2">From</th>
              <th className="px-4 py-2">To</th>
              <th className="px-4 py-2">Value (ETH)</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(blocks.reduce((map, block) => map.set(block.hash, block), new Map()).values()).map(block =>
              block.transactions.map((tx: TransactionWithFunction) => {
                const receipt = transactionReceipts[tx.hash];

                const shortTxHash = `${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}`;
                const date = new Date(block.timestamp * 1000);
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                const timeMined = `${month}/${day} ${date.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })}`;
                const functionCalled = tx.data.substring(0, 10);

                return (
                  <tr key={tx.hash}>
                    <td className="border px-4 py-2">
                      <Link className="text-blue-500 underline" href={`/transaction/${tx.hash}`}>
                        {shortTxHash}
                      </Link>
                    </td>
                    <td className="border px-4 py-2 w-full md:w-1/2 lg:w-1/3">
                      {tx.functionName === "0x" ? "" : tx.functionName}
                      {functionCalled !== "0x" && (
                        <span className="ml-2 inline-block rounded-full px-3 py-1 text-sm font-semibold text-gray-700 bg-blue-200">
                          {functionCalled}
                        </span>
                      )}
                    </td>
                    <td className="border px-4 py-2 w-20">{block.number}</td>
                    <td className="border px-4 py-2">{timeMined}</td>
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
                    <td className="border px-4 py-2">{ethers.utils.formatEther(tx.value)} ETH</td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>
      <div className="absolute right-0 bottom-0 mb-5 mr-5">
        <button
          className={`btn btn-primary btn-sm  ${currentPage === 0 ? "bg-gray-200 cursor-default" : "btn btn-primary"}`}
          disabled={currentPage === 0}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          {"<"}
        </button>
        <span className="mr-2 ml-2 self-center">Page {currentPage + 1}</span>
        <button
          className={`btn btn-primary btn-sm  ${
            (currentPage + 1) * blocksPerPage >= totalBlocks ? "bg-gray-200 cursor-default" : "btn btn-primary"
          }`}
          disabled={(currentPage + 1) * blocksPerPage >= totalBlocks}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          {">"}
        </button>
      </div>
    </div>
  );
};

export default Blockexplorer;
