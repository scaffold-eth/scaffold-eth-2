import * as fs from "fs";
import prettier from "prettier";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

function getDirectories(path: string) {
  return fs
    .readdirSync(path, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

function getContractNames(path: string) {
  return fs
    .readdirSync(path, { withFileTypes: true })
    .filter(dirent => dirent.isFile() && dirent.name.endsWith(".json"))
    .map(dirent => dirent.name.split(".")[0]);
}

const DEPLOYMENTS_DIR = "./deployments";

function getContractDataFromDeployments({ exclude }: { exclude: { chainId: number; name: string } }) {
  if (!fs.existsSync(DEPLOYMENTS_DIR)) {
    return undefined;
  }
  const output = {} as Record<string, any>;
  for (const chainName of getDirectories(DEPLOYMENTS_DIR).filter(name => name !== exclude.name)) {
    const chainId = fs.readFileSync(`${DEPLOYMENTS_DIR}/${chainName}/.chainId`).toString();
    const contracts = {} as Record<string, any>;
    for (const contractName of getContractNames(`${DEPLOYMENTS_DIR}/${chainName}`)) {
      const { abi, address } = JSON.parse(
        fs.readFileSync(`${DEPLOYMENTS_DIR}/${chainName}/${contractName}.json`).toString(),
      );
      contracts[contractName] = { address, abi };
    }
    output[chainId] = [
      {
        chainId,
        name: chainName,
        contracts,
      },
    ];
  }
  return output;
}

async function getContractDataFromHre(
  hre: HardhatRuntimeEnvironment,
  currentNetwork: { chainId: number; name: string },
) {
  const contracts = {} as Record<string, any>;
  const allDeployments = await hre.deployments.all();

  for (const contractName in allDeployments) {
    contracts[contractName] = {};
    const deploymentInfo = allDeployments[contractName];

    contracts[contractName].address = deploymentInfo.address;
    contracts[contractName].abi = deploymentInfo.abi;
  }

  const output = {
    [currentNetwork.chainId]: [
      {
        chainId: currentNetwork.chainId.toString(),
        name: currentNetwork.name,
        contracts,
      },
    ],
  } as Record<string, any>;
  return output;
}

/**
 * Generates the TypeScript contract definition file based on the json output of the contract deployment scripts
 * This script should be run last.
 */
const generateTsAbis: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const TARGET_DIR = "../nextjs/generated/";

  const currentNetwork = {
    chainId: (await hre.ethers.provider.getNetwork()).chainId,
    name: hre.network.name,
  };

  const newContractsData = await getContractDataFromHre(hre, currentNetwork);
  const existingContractsData = getContractDataFromDeployments({ exclude: currentNetwork });

  const allContractsData = {
    ...existingContractsData,
    ...newContractsData,
  };

  const fileContent = Object.entries(allContractsData).reduce((content, [chainId, chainConfig]) => {
    return `${content}${parseInt(chainId).toFixed(0)}:${JSON.stringify(chainConfig, null, 2)},`;
  }, "");

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR);
  }
  fs.writeFileSync(
    `${TARGET_DIR}deployedContracts.ts`,
    prettier.format(`const contracts = {${fileContent}} as const; \n\n export default contracts`, {
      parser: "typescript",
    }),
  );
};

export default generateTsAbis;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags generateTsAbis
generateTsAbis.tags = ["generateTsAbis"];

generateTsAbis.runAtTheEnd = true;
