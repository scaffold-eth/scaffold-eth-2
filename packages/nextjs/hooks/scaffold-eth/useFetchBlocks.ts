import { useEffect, useMemo, useState } from "react";
import { BlockWithTransactions } from "@ethersproject/abstract-provider";
import { ethers } from "ethers";
import { decodeTransactionData } from "~~/utils/scaffold-eth";
import { Block } from "~~/utils/scaffold-eth/block";

const BLOCKS_PER_PAGE = 20;

export const useFetchBlocks = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [transactionReceipts, setTransactionReceipts] = useState<{
    [key: string]: ethers.providers.TransactionReceipt;
  }>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalBlocks, setTotalBlocks] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // New state for loading

  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

  // Use useMemo here to create abortController only once
  const abortController = useMemo(() => new AbortController(), []);

  const fetchBlocks = async () => {
    setIsLoading(true); // Set loading to true at the start of fetch

    const blockNumber = await provider.getBlockNumber();
    setTotalBlocks(blockNumber);
    const fetchedBlocks: BlockWithTransactions[] = [];
    const receipts: { [key: string]: ethers.providers.TransactionReceipt } = {};
    const startingBlock = blockNumber - currentPage * BLOCKS_PER_PAGE;

    for (let i = 0; i < BLOCKS_PER_PAGE; i++) {
      const blockNumberToFetch = startingBlock - i;
      if (blockNumberToFetch < 0) {
        break;
      }

      const block = (await provider.getBlockWithTransactions(blockNumberToFetch)) as BlockWithTransactions;

      for (const tx of block.transactions) {
        decodeTransactionData(tx);
        const receipt = await provider.getTransactionReceipt(tx.hash);
        receipts[tx.hash] = receipt;
      }

      fetchedBlocks.push(block);
    }

    setBlocks(fetchedBlocks);
    setTransactionReceipts(receipts);
    setIsLoading(false); // Set loading to false after fetch is complete
  };

  useEffect(() => {
    fetchBlocks();
    // Here include abortController in the clean-up function
    return () => {
      abortController.abort();
    };
  }, [currentPage, abortController]);

  useEffect(() => {
    provider.on("block", async blockNumber => {
      const newBlock = await provider.getBlockWithTransactions(blockNumber);

      if (!blocks.some(block => block.number === newBlock.number)) {
        if (currentPage === 0) {
          setBlocks(prevBlocks => [newBlock, ...prevBlocks.slice(0, BLOCKS_PER_PAGE - 1)]);

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

    // And here too
    return () => {
      provider.off("block");
      abortController.abort();
    };
  }, [blocks, currentPage, abortController]);

  return {
    blocks,
    transactionReceipts,
    currentPage,
    totalBlocks,
    setCurrentPage,
    isLoading,
  };
};
