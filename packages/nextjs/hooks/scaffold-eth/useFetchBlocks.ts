import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { localhost } from "wagmi/chains";
import { decodeTransactionData } from "~~/utils/scaffold-eth";
import { getLocalProvider } from "~~/utils/scaffold-eth";
import { Block } from "~~/utils/scaffold-eth/block";

const BLOCKS_PER_PAGE = 20;

const provider = getLocalProvider(localhost) || new ethers.providers.JsonRpcProvider("http://localhost:8545");

export const useFetchBlocks = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [transactionReceipts, setTransactionReceipts] = useState<{
    [key: string]: ethers.providers.TransactionReceipt;
  }>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalBlocks, setTotalBlocks] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBlocks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const blockNumber = await provider.getBlockNumber();
      setTotalBlocks(blockNumber);

      const startingBlock = blockNumber - currentPage * BLOCKS_PER_PAGE;
      const blockNumbersToFetch = Array.from(
        { length: Math.min(BLOCKS_PER_PAGE, startingBlock + 1) },
        (_, i) => startingBlock - i,
      );

      const blocksWithTransactions = blockNumbersToFetch.map(async blockNumber => {
        try {
          return provider.getBlockWithTransactions(blockNumber);
        } catch (err) {
          setError(err instanceof Error ? err : new Error("An error occurred."));
          throw err;
        }
      });
      const fetchedBlocks = await Promise.all(blocksWithTransactions);

      fetchedBlocks.forEach(block => {
        block.transactions.forEach(tx => decodeTransactionData(tx));
      });

      const txReceipts = await Promise.all(
        fetchedBlocks.flatMap(block =>
          block.transactions.map(async tx => {
            try {
              const receipt = await provider.getTransactionReceipt(tx.hash);
              return { [tx.hash]: receipt };
            } catch (err) {
              setError(err instanceof Error ? err : new Error("An error occurred."));
              throw err;
            }
          }),
        ),
      );

      setBlocks(fetchedBlocks);
      setTransactionReceipts(prevReceipts => ({ ...prevReceipts, ...Object.assign({}, ...txReceipts) }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred."));
    }
    setIsLoading(false);
  }, [currentPage]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  useEffect(() => {
    const handleNewBlock = async (blockNumber: number) => {
      try {
        const newBlock = await provider.getBlockWithTransactions(blockNumber);
        if (!blocks.some(block => block.number === newBlock.number)) {
          if (currentPage === 0) {
            setBlocks(prevBlocks => [newBlock, ...prevBlocks.slice(0, BLOCKS_PER_PAGE - 1)]);

            newBlock.transactions.forEach(tx => decodeTransactionData(tx));

            const receipts = await Promise.all(
              newBlock.transactions.map(async tx => {
                try {
                  const receipt = await provider.getTransactionReceipt(tx.hash);
                  return { [tx.hash]: receipt };
                } catch (err) {
                  setError(err instanceof Error ? err : new Error("An error occurred."));
                  throw err;
                }
              }),
            );

            setTransactionReceipts(prevReceipts => ({ ...prevReceipts, ...Object.assign({}, ...receipts) }));
          }
          setTotalBlocks(blockNumber + 1);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An error occurred."));
      }
    };

    provider.on("block", handleNewBlock);

    return () => {
      provider.off("block", handleNewBlock);
    };
  }, [blocks, currentPage]);

  return {
    blocks,
    transactionReceipts,
    currentPage,
    totalBlocks,
    setCurrentPage,
    isLoading,
    error,
  };
};
