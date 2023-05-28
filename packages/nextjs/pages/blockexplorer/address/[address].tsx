import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import fs from "fs";
import { GetServerSideProps } from "next";
import path from "path";
import { ParsedUrlQuery } from "querystring";
import { AddressCodeTab, PaginationButton, TransactionsTable } from "~~/components/blockexplorer/";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useFetchBlocks } from "~~/hooks/scaffold-eth";

type AddressCodeTabProps = {
  bytecode: string;
  assembly: string;
};

type PageProps = {
  address: string;
  contractData: AddressCodeTabProps | null;
};

const AddressPage = ({ address, contractData }: PageProps) => {
  const router = useRouter();
  // const address = typeof router.query.address === "string" ? router.query.address : "";
  const { blocks, transactionReceipts, currentPage, totalBlocks, setCurrentPage, isLoading } = useFetchBlocks();
  const [activeTab, setActiveTab] = useState("transactions");
  const [isContract, setIsContract] = useState(false);

  const provider = useMemo(() => new ethers.providers.JsonRpcProvider("http://localhost:8545"), []);

  useEffect(() => {
    const checkIsContract = async () => {
      const contractCode = await provider.getCode(address);
      setIsContract(contractCode !== "0x");
    };

    checkIsContract();
  }, [address, provider]);

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
      <div className="col-span-5 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        <div className="col-span-1 flex flex-col">
          <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4">
            <div className="flex">
              <div className="flex flex-col gap-1">
                <Address address={address} format="long" />
                <div className="flex gap-1 items-center">
                  <span className="font-bold text-sm">Balance:</span>
                  <Balance address={address} className="text-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isContract && (
        <div className="tabs">
          <button
            className={`tab tab-lg tab-lifted ${activeTab === "transactions" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("transactions")}
          >
            Transactions
          </button>
          <button
            className={`tab tab-lg tab-lifted ${activeTab === "code" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("code")}
          >
            Code
          </button>
          <button
            className={`tab tab-lg tab-lifted ${activeTab === "storage" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("storage")}
          >
            Storage
          </button>
          <button
            className={`tab tab-lg tab-lifted ${activeTab === "logs" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("logs")}
          >
            Logs
          </button>
        </div>
      )}
      {activeTab === "transactions" && (
        <div className="pt-4">
          <TransactionsTable blocks={filteredBlocks} transactionReceipts={transactionReceipts} isLoading={isLoading} />
          <PaginationButton currentPage={currentPage} totalItems={totalBlocks} setCurrentPage={setCurrentPage} />
        </div>
      )}
      {activeTab === "code" && contractData && (
        <AddressCodeTab bytecode={contractData.bytecode} assembly={contractData.assembly} />
      )}
      {/* {activeTab === 'storage' && <AddressStorageTab address={address} />}
      {activeTab === 'logs' && <AddressLogsTab address={address} />} */}
    </div>
  );
};

export default AddressPage;

interface Params extends ParsedUrlQuery {
  address: string;
}

export const getServerSideProps: GetServerSideProps = async context => {
  const address = (context.params as Params).address;

  // Set the path to the build-info directory
  const buildInfoDirectory = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "..",
    "..",
    "hardhat",
    "artifacts",
    "build-info",
  );

  // Check if the directory exists
  if (!fs.existsSync(buildInfoDirectory)) {
    throw new Error(`Directory ${buildInfoDirectory} not found.`);
  }

  // Read the directory
  const buildInfoFiles = fs.readdirSync(buildInfoDirectory);

  let bytecode = "";
  let assembly = "";

  // Iterate over the files in the directory
  for (let i = 0; i < buildInfoFiles.length; i++) {
    const filePath = path.join(buildInfoDirectory, buildInfoFiles[i]);

    // Parse the JSON file
    const buildInfo = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Check if the contract address exists in the file
    for (const contractName in buildInfo.output.contracts) {
      for (const contract in buildInfo.output.contracts[contractName]) {
        bytecode = buildInfo.output.contracts[contractName][contract].evm.deployedBytecode.object;
        assembly = buildInfo.output.contracts[contractName][contract].evm.bytecode.opcodes;
        break;
      }
    }

    if (bytecode && assembly) {
      break;
    }
  }

  return { props: { address, contractData: { bytecode, assembly } } };
};
