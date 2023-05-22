import React, { useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import type { NextPage } from "next";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { SearchBar } from "~~/components/blockexplorer/SearchBar";
import { TransactionsTable } from "~~/components/blockexplorer/TransactionsTable";
import { useFetchBlocks } from "~~/hooks/scaffold-eth";

// TODO: Add OPCODES and maybe STORAGE for contracts
// TODO: Better pagination(some pages have less than BLOCKS_PER_PAGE blocks)
// TODO: Refactor, seperate the table and the search bar to a component
// TODO: Don't do everything in a loop... Please...
// TODO: try useMemo to avoid unnecessary re-renders
// TODO: Error handling for API calls
// TODO: Add tests

const BLOCKS_PER_PAGE = 20;

const Blockexplorer: NextPage = () => {
  const { blocks, transactionReceipts, currentPage, totalBlocks, setCurrentPage } = useFetchBlocks();

  const [searchInput, setSearchInput] = useState("");

  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

  const router = useRouter();

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
