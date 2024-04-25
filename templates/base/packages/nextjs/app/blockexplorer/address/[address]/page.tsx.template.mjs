import { withDefaults } from "../../../../../../../utils.js";

const contents = ({ chainName, artifactsDirName }) => `
import fs from "fs";
import path from "path";
import { ${chainName[0]} } from "viem/chains";
import { AddressComponent } from "~~/app/blockexplorer/_components/AddressComponent";
import deployedContracts from "~~/contracts/deployedContracts";
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

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

const getContractData = async (address: string) => {
  const contracts = deployedContracts as GenericContractsDeclaration | null;
  const chainId = ${chainName[0]}.id;
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
    "${chainName[0]}",
    "${artifactsDirName[0]}",
    "build-info",
  );

  if (!fs.existsSync(buildInfoDirectory)) {
    throw new Error(\`Directory \${buildInfoDirectory} not found.\`);
  }

  const deployedContractsOnChain = contracts ? contracts[chainId] : {};
  for (const [contractName, contractInfo] of Object.entries(deployedContractsOnChain)) {
    if (contractInfo.address.toLowerCase() === address.toLowerCase()) {
      contractPath = \`contracts/\${contractName}.sol\`;
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
  const contractData: { bytecode: string; assembly: string } | null = await getContractData(address);
  return <AddressComponent address={address} contractData={contractData} />;
};

export default AddressPage;`;

export default withDefaults(contents, {
  chainName: "hardhat",
  artifactsDirName: "artifacts",
});
