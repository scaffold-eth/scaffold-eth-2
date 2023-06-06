const fs = require("fs");
const path = require("path");
//@ts-expect-error  This script runs after `forge deploy` therefore its deterministic that it will present
// const deployments = require("../deployments.json");
const prettier = require("prettier");

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path + "/" + file).isDirectory();
  });
}
function getFiles(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path + "/" + file).isFile();
  });
}
function getAbiOfContract(contractName) {
  const current_path_to_artifacts = path.join(
    __dirname,
    "..",
    `out/${contractName}.sol`
  );
  const artifactJson = JSON.parse(
    fs.readFileSync(`${current_path_to_artifacts}/${contractName}.json`)
  );

  return artifactJson.abi;
}

function main() {
  const current_path_to_broadcast = path.join(
    __dirname,
    "..",
    "broadcast/Deploy.s.sol"
  );
  const current_path_to_deployments = path.join(__dirname, "..", "deployments");

  const chains = getDirectories(current_path_to_broadcast);
  const Deploymentchains = getFiles(current_path_to_deployments);

  var deployments = {};

  Deploymentchains.forEach((chain) => {
    if (!chain.endsWith(".json")) return;
    chain = chain.slice(0, -5);
    var deploymentObject = JSON.parse(
      fs.readFileSync(`${current_path_to_deployments}/${chain}.json`)
    );
    deployments[chain] = deploymentObject;
  });

  var allGeneratedContracts = {};

  chains.forEach((chain) => {
    allGeneratedContracts[chain] = [];
    allGeneratedContracts[chain].push({
      name: deployments[chain].networkName || "hardhat",
      chainId: chain,
      contracts: {},
    });
    var broadCastObject = JSON.parse(
      fs.readFileSync(`${current_path_to_broadcast}/${chain}/run-latest.json`)
    );
    var transactionsCreate = broadCastObject.transactions.filter(
      (transaction) => transaction.transactionType == "CREATE"
    );
    transactionsCreate.forEach((transaction) => {
      allGeneratedContracts[chain][0]["contracts"][
        deployments[chain][transaction.contractAddress] ||
          transaction.contractName
      ] = {
        address: transaction.contractAddress,
        abi: getAbiOfContract(transaction.contractName),
      };
    });
  });

  const TARGET_DIR = "../nextjs/generated/";

  const fileContent = Object.entries(allGeneratedContracts).reduce(
    (content, [chainId, chainConfig]) => {
      return `${content}${parseInt(chainId).toFixed(0)}:${JSON.stringify(
        chainConfig,
        null,
        2
      )},`;
    },
    ""
  );

  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR);
  }
  fs.writeFileSync(
    `${TARGET_DIR}deployedContracts.ts`,
    prettier.format(
      `const contracts = {${fileContent}} as const; \n\n export default contracts`,
      {
        parser: "typescript",
      }
    )
  );
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
