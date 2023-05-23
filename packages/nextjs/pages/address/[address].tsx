import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import { PaginationButton } from "~~/components/blockexplorer/PaginationButton";
import { TransactionsTable } from "~~/components/blockexplorer/TransactionsTable";
import { Address } from "~~/components/scaffold-eth";
import { useFetchBlocks } from "~~/hooks/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

const AddressPage = () => {
  const router = useRouter();
  const address = typeof router.query.address === "string" ? router.query.address : "";
  const { blocks, transactionReceipts, currentPage, totalBlocks, setCurrentPage, isLoading } = useFetchBlocks();
  const [balance, setBalance] = useState<string>("");
  const targetNetwork = getTargetNetwork();

  const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

  useEffect(() => {
    const fetchBalance = async () => {
      if (address) {
        try {
          const balance = await provider.getBalance(address);
          setBalance(ethers.utils.formatEther(balance));
        } catch (error) {
          console.error("Failed to fetch balance: ", error);
        }
      }
    };
    fetchBalance();
  }, [address]);

  // Filter blocks that contain transactions related to the desired address
  const filteredBlocks = blocks.filter(block =>
    block.transactions.some(
      tx => tx.from.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase(),
    ),
  );

  return (
    <div className="m-10 mb-20">
      <div className="flex justify-start mb-5">
        <button
          className="btn bg-primary text-primary-content hover:bg-accent hover:text-accent-content shadow-md transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110"
          onClick={() => router.back()}
        >
          Back
        </button>
      </div>
      <div className="flex space-x-4 mb-4">
        <div className="flex-1 text-secondary-content p-4 rounded-lg shadow-lg flex items-center justify-center">
          <h2 className="text-lg text-center">
            Address:{" "}
            <span className="font-bold text-lg">
              <Address address={address} format="long" />
            </span>
          </h2>
        </div>
        <div className="flex-1 text-secondary-content p-4 rounded-lg shadow-lg flex items-center justify-center">
          <h2 className="text-lg text-center">
            Balance:{" "}
            <span className="font-bold text-lg">
              {parseFloat(balance).toFixed(2)} {targetNetwork.nativeCurrency.symbol}
            </span>
          </h2>
        </div>
      </div>
      <TransactionsTable blocks={filteredBlocks} transactionReceipts={transactionReceipts} isLoading={isLoading} />
      <PaginationButton currentPage={currentPage} totalItems={totalBlocks} setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default AddressPage;
