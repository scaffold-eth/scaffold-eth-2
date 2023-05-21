import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { BlockWithTransactions } from "@ethersproject/abstract-provider";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { SearchBar } from "~~/components/blockexplorer/SearchBar";
import { TransactionsTable } from "~~/components/blockexplorer/TransactionsTable";
import deployedContracts from "~~/generated/deployedContracts";
import { Block, TransactionWithFunction } from "~~/utils/scaffold-eth/block";

// TODO: Add OPCODES and maybe STORAGE for contracts
// TODO: Better pagination(some pages have less than BLOCKS_PER_PAGE blocks)
// TODO: Refactor, seperate the table and the search bar to a component
// TODO: Don't do everything in a loop... Please...
// TODO: try useMemo to avoid unnecessary re-renders
// TODO: Error handling for API calls
// TODO: Add tests

const BLOCKS_PER_PAGE = 20;

const Blockexplorer: NextPage = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [transactionReceipts, setTransactionReceipts] = useState<{
    [key: string]: ethers.providers.TransactionReceipt;
  }>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [totalBlocks, setTotalBlocks] = useState(0);
  const [searchInput, setSearchInput] = useState("");

  const router = useRouter();

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

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
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

  return (
    <div className="m-10 mb-20">
      <SearchBar searchInput={searchInput} setSearchInput={setSearchInput} handleSearch={handleSearch} />
      <TransactionsTable blocks={blocks} transactionReceipts={transactionReceipts} />
      <div className="absolute right-0 bottom-0 mb-5 mr-5 flex space-x-3">
        <button
          className={`btn py-1 px-3 rounded-md text-xs ${
            currentPage === 0
              ? "bg-gray-200 cursor-default"
              : "bg-primary text-primary-content hover:bg-accent hover:text-accent-content"
          }`}
          disabled={currentPage === 0}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </button>
        <span className="self-center text-primary-content font-medium">Page {currentPage + 1}</span>
        <button
          className={`btn py-1 px-3 rounded-md text-xs ${
            currentPage + 1 >= totalBlocks
              ? "bg-gray-200 cursor-default"
              : "bg-primary text-primary-content hover:bg-accent hover:text-accent-content"
          }`}
          disabled={currentPage + 1 >= Math.ceil(totalBlocks / BLOCKS_PER_PAGE)}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Blockexplorer;
