import * as fs from "fs";
import prettier from "prettier";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

async function getContractDataFromHre(hre: HardhatRuntimeEnvironment) {
  const contracts = {} as any;
  const allDeployments = await hre.deployments.all();

  for (const contractName in allDeployments) {
    contracts[contractName] = {};
    const deploymentInfo = allDeployments[contractName];

    contracts[contractName].address = deploymentInfo.address;
    contracts[contractName].abi = deploymentInfo.abi;
  }

  const provider = hre.ethers.provider;
  const { chainId } = await provider.getNetwork();
  const output = {
    [chainId]: [
      {
        chainId: chainId.toString(),
        name: hre.network.name,
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

  const contractsData = await getContractDataFromHre(hre);
  const fileContent = Object.entries(contractsData).reduce((content, [chainId, chainConfig]) => {
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
