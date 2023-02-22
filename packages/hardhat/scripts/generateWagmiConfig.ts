import * as fs from "fs";
import * as path from "path";
import * as util from "util";
const DEPLOYMENTS_PATH = "deployments";

function getParsedDeploymentsForWagmiConfig() {
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
/**
 * Generates wagmi.config.ts file with deployments address mapped with contract
 */
async function main() {
  if (!fs.existsSync(DEPLOYMENTS_PATH)) {
    console.log("No deployments found!");
    return;
  }
  const result = getParsedDeploymentsForWagmiConfig();
  fs.writeFileSync(
    "./wagmi.config.ts",
    `import { defineConfig } from "@wagmi/cli";
      import { hardhat, react } from "@wagmi/cli/plugins";
      
      export default defineConfig({
        out: "../nextjs/generated/contractHooks.ts",
        contracts: [],
        plugins: [
          hardhat({
            project: "./",
            deployments: ${util.inspect(result)} 
          }),
          react(),
        ],
      });`,
    "utf-8",
  );
  console.log("✅ wagmi.config.ts file generated");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
