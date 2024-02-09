import * as fs from "fs";
import chalk from "chalk";

const graphDir = "./";
const deploymentsDir = "../hardhat/deployments";

function publishContract(contractName: string, networkName: string) {
  try {
    let contract = fs
      .readFileSync(`${deploymentsDir}/${networkName}/${contractName}.json`)
      .toString();
    let contractObject = JSON.parse(contract);
    const graphConfigPath = `${graphDir}/networks.json`;
    let graphConfig = "{}";
    try {
      if (fs.existsSync(graphConfigPath)) {
        graphConfig = fs.readFileSync(graphConfigPath).toString();
      }
    } catch (e) {
      console.log(e);
    }

    let graphConfigObject = JSON.parse(graphConfig);
    if (!(networkName in graphConfigObject)) {
      graphConfigObject[networkName] = {};
    }
    if (!(contractName in graphConfigObject[networkName])) {
      graphConfigObject[networkName][contractName] = {};
    }
    graphConfigObject[networkName][contractName].address =
      contractObject.address;

    fs.writeFileSync(
      graphConfigPath,
      JSON.stringify(graphConfigObject, null, 2)
    );
    if (!fs.existsSync(`${graphDir}/abis`)) fs.mkdirSync(`${graphDir}/abis`);
    fs.writeFileSync(
      `${graphDir}/abis/${networkName}_${contractName}.json`,
      JSON.stringify(contractObject.abi, null, 2)
    );

    return true;
  } catch (e) {
    console.log(
      "Failed to publish " + chalk.red(contractName) + " to the subgraph."
    );
    console.log(e);
    return false;
  }
}

async function main() {
  const directories = fs.readdirSync(deploymentsDir);
  directories.forEach(function(directory) {
    const files = fs.readdirSync(`${deploymentsDir}/${directory}`);
    files.forEach(function(file) {
      if (file.indexOf(".json") >= 0) {
        const contractName = file.replace(".json", "");
        publishContract(contractName, directory);
      }
    });
  });
  console.log("✅  Published contracts to the subgraph package.");
}
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
