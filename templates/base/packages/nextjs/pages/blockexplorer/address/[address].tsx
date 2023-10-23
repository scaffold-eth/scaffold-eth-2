import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import fs from "fs";
import { GetServerSideProps } from "next";
import path from "path";
import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";
import {
  AddressCodeTab,
  AddressLogsTab,
  AddressStorageTab,
  PaginationButton,
  TransactionsTable,
} from "~~/components/blockexplorer/";
import { Address, Balance } from "~~/components/scaffold-eth";
import deployedContracts from "~~/generated/deployedContracts";
import { useFetchBlocks } from "~~/hooks/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

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

const AddressPage = ({ address, contractData }: PageProps) => {
  const router = useRouter();
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
    <div className="m-10 mb-20">
      <div className="flex justify-start mb-5">
        <button className="btn btn-sm btn-primary" onClick={() => router.back()}>
          Back
        </button>
      </div>
      <div className="col-span-5 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        <div className="col-span-1 flex flex-col">
          <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4 overflow-x-auto">
            <div className="flex">
              <div className="flex flex-col gap-1">
                <Address address={address} format="long" />
                <div className="flex gap-1 items-center">
                  <span className="font-bold text-sm">Balance:</span>
                  <Balance address={address} className="text" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isContract && (
        <div className="tabs">
          <button
            className={`tab tab-lifted ${activeTab === "transactions" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("transactions")}
          >
            Transactions
          </button>
          <button
            className={`tab tab-lifted ${activeTab === "code" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("code")}
          >
            Code
          </button>
          <button
            className={`tab tab-lifted ${activeTab === "storage" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("storage")}
          >
            Storage
          </button>
          <button
            className={`tab tab-lifted ${activeTab === "logs" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("logs")}
          >
            Logs
          </button>
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
    </div>
  );
};

export default AddressPage;

async function fetchByteCodeAndAssembly(buildInfoDirectory: string, contractPath: string) {
  const buildInfoFiles = fs.readdirSync(buildInfoDirectory);
  let bytecode = "";
  let assembly = "";

  for (let i = 0; i < buildInfoFiles.length; i++) {
    const filePath = path.join(buildInfoDirectory, buildInfoFiles[i]);

    const buildInfo = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (buildInfo.output.contracts[contractPath]) {
      for (const contract in buildInfo.output.contracts[contractPath]) {
        bytecode = buildInfo.output.contracts[contractPath][contract].evm.bytecode.object;
        assembly = buildInfo.output.contracts[contractPath][contract].evm.bytecode.opcodes;
        break;
      }
    }

    if (bytecode && assembly) {
      break;
    }
  }

  return { bytecode, assembly };
}

export const getServerSideProps: GetServerSideProps = async context => {
  const configuredNetwork = getTargetNetwork();
  const address = (context.params?.address as string).toLowerCase();
  const contracts = deployedContracts as GenericContractsDeclaration | null;
  const chainId = hardhat.id;
  let contractPath = "";

  const buildInfoDirectory = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "..",
    "..",
    `${configuredNetwork.network}`,
    `${configuredNetwork.network === "hardhat" ? "artifacts" : "out"}`,
    "build-info",
  );

  if (!fs.existsSync(buildInfoDirectory)) {
    throw new Error(`Directory ${buildInfoDirectory} not found.`);
  }

  const deployedContractsOnChain = contracts ? contracts[chainId][0].contracts : {};
  for (const [contractName, contractInfo] of Object.entries(deployedContractsOnChain)) {
    if (contractInfo.address.toLowerCase() === address) {
      contractPath = `contracts/${contractName}.sol`;
      break;
    }
  }

  if (!contractPath) {
    // No contract found at this address
    return { props: { address, contractData: null } };
  }

  const { bytecode, assembly } = await fetchByteCodeAndAssembly(buildInfoDirectory, contractPath);

  return { props: { address, contractData: { bytecode, assembly } } };
};
