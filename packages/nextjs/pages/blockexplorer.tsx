import React, { useEffect, useState } from "react";
// import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { BlockWithTransactions, TransactionResponse } from "@ethersproject/abstract-provider";
import { ethers } from "ethers";
import type { NextPage } from "next";

const Blockexplorer: NextPage = () => {
  const [blocks, setBlocks] = useState<BlockWithTransactions[]>([]);

  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

  useEffect(() => {
    const fetchBlocks = async () => {
      const blockNumber = await provider.getBlockNumber();
      const blocks: BlockWithTransactions[] = [];

      for (let i = 0; i < 10; i++) {
        const block = await provider.getBlockWithTransactions(blockNumber - i);
        console.log("getting the most recent 10 blocks");

        blocks.push(block);
      }
      setBlocks(blocks);

      console.log(blocks);

      provider.removeAllListeners("block");

      provider.on("block", async blockNumber => {
        console.log("XXX New block event received", blockNumber);
        const newBlock = await provider.getBlockWithTransactions(blockNumber);

        if (!blocks.some(block => block.number === newBlock.number)) {
          setBlocks(prevBlocks => [newBlock, ...prevBlocks.slice(0, 9)]);
        }
      });
    };

    fetchBlocks();

    return () => {
      console.log("XXX Removing listener");
      provider.off("block");
    };
  }, []);

  return (
    <div className="m-10">
      <h1 className="text-4xl mb-6 text-center">Block Explorer</h1>
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
              block.transactions.map((tx: TransactionResponse) => {
                const shortTxHash = `${tx.hash.substring(0, 6)}...${tx.hash.substring(tx.hash.length - 4)}`;
                const shortFrom = `${tx.from.substring(0, 6)}...${tx.from.substring(tx.from.length - 4)}`;
                const shortTo = tx.to ? `${tx.to.substring(0, 6)}...${tx.to.substring(tx.to.length - 4)}` : "";
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
                    {/* TODO: add clickable copy icon */}
                    <td className="border px-4 py-2">
                      {" "}
                      <Link className="text-blue-500 underline" href={`/transaction/${tx.hash}`}>
                        {shortTxHash}
                      </Link>
                    </td>
                    <td className="border px-4 py-2">{functionCalled === "0x" ? "" : functionCalled}</td>
                    <td className="border px-4 py-2 w-20">{block.number}</td>
                    <td className="border px-4 py-2">{timeMined}</td>
                    <td className="border px-4 py-2">{shortFrom}</td>
                    <td className="border px-4 py-2">{shortTo}</td>
                    <td className="border px-4 py-2">{ethers.utils.formatEther(tx.value)} ETH</td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Blockexplorer;
