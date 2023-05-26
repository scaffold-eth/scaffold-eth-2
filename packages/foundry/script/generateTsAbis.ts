const fs = require("fs");
const path = require("path");
//@ts-expect-error  This script runs after `hardhat deploy --export` therefore its deterministic that it will present
const deployments = require("../deployments.json");
const prettier = require("prettier");

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path + "/" + file).isDirectory();
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
  const chains = getDirectories(current_path_to_broadcast);

  var allGeneratedContracts = {};

  chains.forEach((chain) => {
    allGeneratedContracts[chain] = [];
    allGeneratedContracts[chain].push({
      name: "localhost",
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

  // remove generted output temp folder
  fs.rmSync("./deployments.json", { recursive: true, force: true });
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
