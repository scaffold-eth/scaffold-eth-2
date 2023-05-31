import * as fs from "fs";
//@ts-expect-error  This script runs after `hardhat deploy --export` therefore its deterministic that it will present
import allGeneratedContracts from "../temp/hardhat_contracts.json";
import prettier from "prettier";

function main() {
  const TARGET_DIR = "../nextjs/generated/";

  const fileContent = Object.entries(allGeneratedContracts).reduce((content, [chainId, chainConfig]) => {
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

  // remove generted output temp folder
  fs.rmSync("./temp", { recursive: true, force: true });
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
