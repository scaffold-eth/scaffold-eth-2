import { withDefaults } from "../../../../../../../utils.js";

const contents = ({ solidityFramework, artifactsDirName }) => {
  if (!solidityFramework[0]) {
    solidityFramework[0] = "hardhat";
  }
  const isFoundry = solidityFramework[0] === "foundry";

  return `
import fs from "fs";
import path from "path";
import { Address } from "viem";
import { ${solidityFramework[0]} } from "viem/chains";
import { AddressComponent } from "~~/app/blockexplorer/_components/AddressComponent";
import deployedContracts from "~~/contracts/deployedContracts";
import { isZeroAddress } from "~~/utils/scaffold-eth/common";
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

type PageProps = {
  params: Promise<{ address: Address }>;
};

${
  isFoundry
    ? `function fetchByteCodeAndAssembly(foundryOutDirectory: string, contractName: string) {
  // Foundry organizes artifacts by source file name, not contract name.
  // Try the default path first, then fall back to scanning all .sol dirs (skipping build-info).
  let artifactPath = path.join(foundryOutDirectory, \`\${contractName}.sol\`, \`\${contractName}.json\`);

  if (!fs.existsSync(artifactPath)) {
    artifactPath = "";
    const solDirs = fs.readdirSync(foundryOutDirectory).filter(entry => entry.endsWith(".sol"));
    for (const solDir of solDirs) {
      const candidate = path.join(foundryOutDirectory, solDir, \`\${contractName}.json\`);
      if (fs.existsSync(candidate)) {
        artifactPath = candidate;
        break;
      }
    }
  }

  if (!artifactPath) {
    return { bytecode: "", assembly: "" };
  }

  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const bytecode: string = artifact?.bytecode?.object ?? "";
  const assembly: string = artifact?.opcodes ?? artifact?.bytecode?.opcodes ?? "";

  return { bytecode, assembly };
}`
    : `async function fetchByteCodeAndAssembly(buildInfoDirectory: string, contractName: string) {
  const contractPath = \`project/contracts/\${contractName}.sol\`;
  const buildInfoFiles = fs.readdirSync(buildInfoDirectory).filter(f => f.endsWith(".output.json"));
  let bytecode = "";
  let assembly = "";

  for (let i = 0; i < buildInfoFiles.length; i++) {
    const filePath = path.join(buildInfoDirectory, buildInfoFiles[i]);

    const buildInfo = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (buildInfo.output?.contracts?.[contractPath]) {
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
}`
}

const getContractData = async (address: Address) => {
  const contracts = deployedContracts as GenericContractsDeclaration | null;
  const chainId = ${solidityFramework[0]}.id;

  if (!contracts || !contracts[chainId] || Object.keys(contracts[chainId]).length === 0) {
    return null;
  }

  const artifactsDirectory = path.join(
    process.cwd(),
    "..",
    "${solidityFramework[0]}",
    "${artifactsDirName[0]}"${isFoundry ? "" : `,
    "build-info"`},
  );

  if (!fs.existsSync(artifactsDirectory)) {
    throw new Error(\`Directory \${artifactsDirectory} not found.\`);
  }

  let matchedContractName = "";
  const deployedContractsOnChain = contracts[chainId];
  for (const [contractName, contractInfo] of Object.entries(deployedContractsOnChain)) {
    if (contractInfo.address.toLowerCase() === address.toLowerCase()) {
      matchedContractName = contractName;
      break;
    }
  }

  if (!matchedContractName) {
    // No contract found at this address
    return null;
  }

  const { bytecode, assembly } = await fetchByteCodeAndAssembly(artifactsDirectory, matchedContractName);

  return { bytecode, assembly };
};

export function generateStaticParams() {
  // An workaround to enable static exports in Next.js, generating single dummy page.
  return [{ address: "0x0000000000000000000000000000000000000000" }];
}

const AddressPage = async (props: PageProps) => {
  const params = await props.params;
  const address = params?.address as Address;

  if (isZeroAddress(address)) return null;

  const contractData: { bytecode: string; assembly: string } | null = await getContractData(address);
  return <AddressComponent address={address} contractData={contractData} />;
};

export default AddressPage;`;
};

export default withDefaults(contents, {
  artifactsDirName: "artifacts",
});
