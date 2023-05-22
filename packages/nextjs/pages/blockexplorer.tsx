import type { NextPage } from "next";
import { PaginationButton } from "~~/components/blockexplorer/PaginationButton";
import { SearchBar } from "~~/components/blockexplorer/SearchBar";
import { TransactionsTable } from "~~/components/blockexplorer/TransactionsTable";
import { useFetchBlocks } from "~~/hooks/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

// @todo if the local node is not online, do not render the page

const Blockexplorer: NextPage = () => {
  const { blocks, transactionReceipts, currentPage, totalBlocks, setCurrentPage, isLoading } = useFetchBlocks();

  return (
    <div className="m-10 mb-20">
      {getTargetNetwork().id === 31337 ? (
        <>
          <SearchBar />
          <TransactionsTable blocks={blocks} transactionReceipts={transactionReceipts} isLoading={isLoading} />
          <PaginationButton currentPage={currentPage} totalItems={totalBlocks} setCurrentPage={setCurrentPage} />
        </>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-4xl text-center text-red-500">Oops! You are not on the local hardhat chain 😔</p>
        </div>
      )}
    </div>
  );
};

export default Blockexplorer;
