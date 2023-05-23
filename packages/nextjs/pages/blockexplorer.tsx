import type { NextPage } from "next";
import { PaginationButton } from "~~/components/blockexplorer/PaginationButton";
import { SearchBar } from "~~/components/blockexplorer/SearchBar";
import { TransactionsTable } from "~~/components/blockexplorer/TransactionsTable";
import { useFetchBlocks } from "~~/hooks/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

// @todo the table could use a different background in dark mode
// @todo show "no transactions for this address yet" when there are no transactions
// @todo when the tx is contract creation, the to address should be the contract address in tx page
// @todo show pages like "5 out of 10 pages" or sth

const Blockexplorer: NextPage = () => {
  const { blocks, transactionReceipts, currentPage, totalBlocks, setCurrentPage, isLoading, error } = useFetchBlocks();

  return (
    <>
      {getTargetNetwork().id === 31337 && !error ? (
        <div className="m-10 mb-20">
          <SearchBar />
          <TransactionsTable blocks={blocks} transactionReceipts={transactionReceipts} isLoading={isLoading} />
          <PaginationButton currentPage={currentPage} totalItems={totalBlocks} setCurrentPage={setCurrentPage} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-4xl text-center text-red-500">
            Oops! You are not on the local hardhat chain or you forgot to start it up 😔
          </p>
        </div>
      )}
    </>
  );
};

export default Blockexplorer;
