import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(false);

  const provider = useMemo(() => new ethers.providers.JsonRpcProvider("http://localhost:8545"), []);

  const fetchBlocks = useCallback(async () => {
    setIsLoading(true);

    const blockNumber = await provider.getBlockNumber();
    setTotalBlocks(blockNumber);

    const startingBlock = blockNumber - currentPage * BLOCKS_PER_PAGE;
    const blockNumbersToFetch = Array.from(
      { length: Math.min(BLOCKS_PER_PAGE, startingBlock + 1) },
      (_, i) => startingBlock - i,
    );

    const blocksWithTransactions: Promise<BlockWithTransactions>[] = blockNumbersToFetch.map(blockNumber =>
      provider.getBlockWithTransactions(blockNumber),
    );
    const fetchedBlocks = await Promise.all(blocksWithTransactions);

    fetchedBlocks.forEach(block => {
      block.transactions.forEach(tx => decodeTransactionData(tx));
    });

    const txReceipts = await Promise.all(
      fetchedBlocks.flatMap(block =>
        block.transactions.map(tx => provider.getTransactionReceipt(tx.hash).then(receipt => ({ [tx.hash]: receipt }))),
      ),
    );

    setBlocks(fetchedBlocks);
    setTransactionReceipts(prevReceipts => ({ ...prevReceipts, ...Object.assign({}, ...txReceipts) }));
    setIsLoading(false);
  }, [currentPage, provider]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  useEffect(() => {
    const handleNewBlock = async (blockNumber: number) => {
      const newBlock = await provider.getBlockWithTransactions(blockNumber);
      if (!blocks.some(block => block.number === newBlock.number)) {
        if (currentPage === 0) {
          setBlocks(prevBlocks => [newBlock, ...prevBlocks.slice(0, BLOCKS_PER_PAGE - 1)]);

          newBlock.transactions.forEach(tx => decodeTransactionData(tx));

          const receipts = await Promise.all(
            newBlock.transactions.map(tx =>
              provider.getTransactionReceipt(tx.hash).then(receipt => ({ [tx.hash]: receipt })),
            ),
          );

          setTransactionReceipts(prevReceipts => ({ ...prevReceipts, ...Object.assign({}, ...receipts) }));
        }
        setTotalBlocks(blockNumber + 1);
      }
    };

    provider.on("block", handleNewBlock);

    return () => {
      provider.off("block", handleNewBlock);
    };
  }, [blocks, currentPage, provider]);
  return {
    blocks,
    transactionReceipts,
    currentPage,
    totalBlocks,
    setCurrentPage,
    isLoading,
  };
};
