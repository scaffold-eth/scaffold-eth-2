import * as fs from "fs";
import * as path from "path";

const DEPLOYMENTS_PATH = "deployments";

export function getParsedDeploymentsForWagmiConfig() {
  // getting all directories inside deployments directory
  const allChainDirectories = fs.readdirSync(DEPLOYMENTS_PATH);
  // final constructed deployments object
  const finalObj: Record<string, Record<string | number, any>> = {};

  for (const dir of allChainDirectories) {
    const dirPath = path.join(DEPLOYMENTS_PATH, dir);
    const filesInChainsDir = fs.readdirSync(dirPath);
    const deployedContractNameArr = filesInChainsDir.filter(value => value.includes(".json"));
    for (const contractFileName of deployedContractNameArr) {
      const filePath = path.join(dirPath, contractFileName);
      const data = fs.readFileSync(filePath, "utf8");
      const parsedData = JSON.parse(data);
      const chainId = fs.readFileSync(path.join(dirPath, ".chainId"), "utf8");
      const chainToAddress = {
        [chainId]: parsedData.address,
      };
      const contractName = contractFileName.split(".")[0];
      finalObj[contractName] = { ...finalObj[contractName], ...chainToAddress };
    }
  }

  return finalObj;
}
