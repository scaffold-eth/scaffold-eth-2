import { BackButton } from "../../_components/BackButton";
import { ContractTabs } from "../../_components/ContractTabs";
import fs from "fs";
import path from "path";
import { Address, Balance } from "~~/components/scaffold-eth";
import deployedContracts from "~~/generated/deployedContracts";
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const HARDHAT_CHAIN_ID = 31337;
type PageProps = {
  params: { address: string };
};

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

export const getData = async (address: string) => {
  const contracts = deployedContracts as GenericContractsDeclaration | null;
  const chainId = HARDHAT_CHAIN_ID;
  let contractPath = "";

  const buildInfoDirectory = path.join(
    __dirname,
    "..",
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
    return null;
  }

  const { bytecode, assembly } = await fetchByteCodeAndAssembly(buildInfoDirectory, contractPath);

  return { bytecode, assembly };
};

const AddressPage = async ({ params }: PageProps) => {
  const address = params?.address as string;
  const contractData: { bytecode: string; assembly: string } | null = await getData(address);
  return (
    <div className="m-10 mb-20">
      <div className="flex justify-start mb-5">
        <BackButton />
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
      <ContractTabs address={address} contractData={contractData} />
    </div>
  );
};

export default AddressPage;
