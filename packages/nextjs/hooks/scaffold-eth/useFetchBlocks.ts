import { useEffect, useState } from "react";
import { BlockWithTransactions } from "@ethersproject/abstract-provider";
import { ethers } from "ethers";
import deployedContracts from "~~/generated/deployedContracts";
import { Block, TransactionWithFunction } from "~~/utils/scaffold-eth/block";

const BLOCKS_PER_PAGE = 20;

export const useFetchBlocks = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [transactionReceipts, setTransactionReceipts] = useState<{
    [key: string]: ethers.providers.TransactionReceipt;
  }>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalBlocks, setTotalBlocks] = useState(0);

  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

  const fetchBlocks = async () => {
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

      const block = (await provider.getBlockWithTransactions(blockNumberToFetch)) as BlockWithTransactions & {
        transactions: TransactionWithFunction[];
      };

      fetchedBlocks.push(block);

      const chain = deployedContracts[31337][0];
      const interfaces: { [contractName: string]: ethers.utils.Interface } = {};

      for (const [contractName, contract] of Object.entries(chain.contracts)) {
        interfaces[contractName] = new ethers.utils.Interface(contract.abi);
      }

      for (const tx of block.transactions as TransactionWithFunction[]) {
        const receipt = await provider.getTransactionReceipt(tx.hash);
        receipts[tx.hash] = receipt;

        if (tx.data.length >= 10) {
          for (const [contractName, contractInterface] of Object.entries(interfaces)) {
            try {
              const decodedData = contractInterface.parseTransaction({ data: tx.data });
              tx.functionName = `${contractName}: ${decodedData.name}`;
              break;
            } catch (e) {
              console.log(`Parsing failed for contract ${contractName}: ${e}`);
            }
          }
        }
      }
    }

    setBlocks(fetchedBlocks);
    setTransactionReceipts(receipts);
  };

  useEffect(() => {
    fetchBlocks();
  }, [currentPage]);

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

    return () => {
      provider.off("block");
    };
  }, [blocks, currentPage]);

  return {
    blocks,
    transactionReceipts,
    currentPage,
    totalBlocks,
    setCurrentPage,
  };
};
