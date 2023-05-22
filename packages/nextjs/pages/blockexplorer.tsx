import type { NextPage } from "next";
import { PaginationButton } from "~~/components/blockexplorer/PaginationButton";
import { SearchBar } from "~~/components/blockexplorer/SearchBar";
import { TransactionsTable } from "~~/components/blockexplorer/TransactionsTable";
import { useFetchBlocks } from "~~/hooks/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

// @todo if the local node is not online, do not render the page

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
