"use client";

import { useEffect, useState } from "react";
import { AddressCodeTab } from "./AddressCodeTab";
import { AddressLogsTab } from "./AddressLogsTab";
import { AddressStorageTab } from "./AddressStorageTab";
import { PaginationButton } from "./PaginationButton";
import { TransactionsTable } from "./TransactionsTable";
import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";
import { Button } from "~~/components/Button";
import { useFetchBlocks } from "~~/hooks/scaffold-eth";

const tabs = ["transactions", "code", "storage", "logs"];

type AddressCodeTabProps = {
  bytecode: string;
  assembly: string;
};

type PageProps = {
  address: string;
  contractData: AddressCodeTabProps | null;
};

const publicClient = createPublicClient({
  chain: hardhat,
  transport: http(),
});

export const ContractTabs = ({ address, contractData }: PageProps) => {
  const { blocks, transactionReceipts, currentPage, totalBlocks, setCurrentPage } = useFetchBlocks();
  const [activeTab, setActiveTab] = useState("transactions");
  const [isContract, setIsContract] = useState(false);

  useEffect(() => {
    const checkIsContract = async () => {
      const contractCode = await publicClient.getBytecode({ address: address });
      setIsContract(contractCode !== undefined && contractCode !== "0x");
    };

    checkIsContract();
  }, [address]);

  const filteredBlocks = blocks.filter(block =>
    block.transactions.some(tx => {
      if (typeof tx === "string") {
        return false;
      }
      return tx.from.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase();
    }),
  );

  return (
    <>
      {isContract && (
        <div role="tablist" className="flex gap-2">
          {tabs.map(tab => (
            <Button
              variant="secondary"
              size="sm"
              role="tab"
              className={`font-light! hover:border-transparent! ${
                activeTab === tab ? "bg-base-300! hover:bg-base-300! no-animation" : "bg-base-100! hover:bg-secondary!"
              }`}
              key={tab}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>
      )}
      {activeTab === "transactions" && (
        <div className="pt-4">
          <TransactionsTable blocks={filteredBlocks} transactionReceipts={transactionReceipts} />
          <PaginationButton
            currentPage={currentPage}
            totalItems={Number(totalBlocks)}
            setCurrentPage={setCurrentPage}
          />
        </div>
      )}
      {activeTab === "code" && contractData && (
        <AddressCodeTab bytecode={contractData.bytecode} assembly={contractData.assembly} />
      )}
      {activeTab === "storage" && <AddressStorageTab address={address} />}
      {activeTab === "logs" && <AddressLogsTab address={address} />}
    </>
  );
};
