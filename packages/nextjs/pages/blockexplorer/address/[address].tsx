import { useRouter } from "next/router";
import { PaginationButton } from "~~/components/blockexplorer/PaginationButton";
import { TransactionsTable } from "~~/components/blockexplorer/TransactionsTable";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useFetchBlocks } from "~~/hooks/scaffold-eth";

const AddressPage = () => {
  const router = useRouter();
  const address = typeof router.query.address === "string" ? router.query.address : "";
  const { blocks, transactionReceipts, currentPage, totalBlocks, setCurrentPage, isLoading } = useFetchBlocks();

  // Filter blocks that contain transactions related to the desired address
  const filteredBlocks = blocks.filter(block =>
    block.transactions.some(
      tx => tx.from.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase(),
    ),
  );

  return (
    <div className="m-10 mb-20">
      <div className="flex justify-start mb-5">
        <button className="btn btn-primary" onClick={() => router.back()}>
          Back
        </button>
      </div>
      <div className="col-span-5 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
        <div className="col-span-1 flex flex-col">
          <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4">
            <div className="flex">
              <div className="flex flex-col gap-1">
                <Address address={address} format="long" />
                <div className="flex gap-1 items-center">
                  <span className="font-bold text-sm">Balance:</span>
                  <Balance address={address} className="text-lg px-0 h-1.5 min-h-[0.375rem]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <TransactionsTable blocks={filteredBlocks} transactionReceipts={transactionReceipts} isLoading={isLoading} />
      <PaginationButton currentPage={currentPage} totalItems={totalBlocks} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default AddressPage;
