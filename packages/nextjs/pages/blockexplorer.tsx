import type { NextPage } from "next";
import { PaginationButton } from "~~/components/blockexplorer/PaginationButton";
import { SearchBar } from "~~/components/blockexplorer/SearchBar";
import { TransactionsTable } from "~~/components/blockexplorer/TransactionsTable";
import { useFetchBlocks } from "~~/hooks/scaffold-eth";

const Blockexplorer: NextPage = () => {
  const { blocks, transactionReceipts, currentPage, totalBlocks, setCurrentPage } = useFetchBlocks();

  return (
    <div className="m-10 mb-20">
      <SearchBar />
      <TransactionsTable blocks={blocks} transactionReceipts={transactionReceipts} />
      <PaginationButton currentPage={currentPage} totalItems={totalBlocks} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default Blockexplorer;
