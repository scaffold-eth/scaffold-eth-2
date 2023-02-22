import * as fs from "fs";
import * as path from "path";
// const wagmiCongig = `
// import { defineConfig } from "@wagmi/cli";
// import { hardhat, react } from "@wagmi/cli/plugins";

// export default defineConfig({
//   out: "../nextjs/generated/contractHooks.ts",
//   contracts: [],
//   plugins: [
//     hardhat({
//       project: "./",
//     }),
//     react(),
//   ],
// });
// `;
const DEPLOYMENTS_PATH = "deployments";

async function getAllContractsPathAndChain() {
  // getting all directories inside deployments
  const allChainDirectories = await fs.promises.readdir(DEPLOYMENTS_PATH);
  // return Promise.all(
  //   allChainDirectories.map(async dir => {
  //     const dirPath = path.join(DEPLOYMENTS_PATH, dir);
  //     const filesInChainsDir = await fs.promises.readdir(dirPath);
  //     const deployedContractNameArr = filesInChainsDir.filter(value => value.includes(".json"));
  //     console.log(
  //       "⚡️ ~ file: generateWagmiConfig.ts:33 ~ getAllContractsPathAndChain ~ deployedContractNameArr:",
  //       deployedContractNameArr,
  //     );
  //   }),
  const finalObj: Record<string, Record<string | number, any>> = {};
  for (const dir of allChainDirectories) {
    const dirPath = path.join(DEPLOYMENTS_PATH, dir);
    const filesInChainsDir = await fs.promises.readdir(dirPath);
    const deployedContractNameArr = filesInChainsDir.filter(value => value.includes(".json"));
    for await (const contractFileName of deployedContractNameArr) {
      const filePath = path.join(dirPath, contractFileName);
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.log("Error while reading", filePath, err);
        }
        const parsedData = JSON.parse(data);
        const chainId = fs.readFileSync(path.join(dirPath, ".chainId"), "utf8");
        const buildData = {
          [parseInt(chainId, 10)]: {
            address: parsedData.address,
          },
        };
        const contractName = contractFileName.split(".")[0];
        finalObj[contractName] = { ...finalObj[contractName], ...buildData };
        console.log("⚡️ ~ file: generateWagmiConfig.ts:54 ~ fs.readFile ~ finalObj:", finalObj);
      });
    }
  }

  return finalObj;
}

// Loop on deployments file
// for each dir find all json file and put their name as key.
// read number from .chainId file it will key and address will inside that json file
async function main() {
  if (!fs.existsSync(DEPLOYMENTS_PATH)) {
    console.log("No deployments found!");
    return;
  }
  const result = await getAllContractsPathAndChain();
  console.log("⚡️ ~ file: generateWagmiConfig.ts:70 ~ main ~ result:", result);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
