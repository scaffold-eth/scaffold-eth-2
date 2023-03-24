import * as fs from "fs";
//@ts-expect-error  This script runs after `hardhat deploy --export` therefore its deterministic that it will present
import allGeneratedContracts from "../generated/hardhat_contracts.json";
import prettier from "prettier";

function main() {
  const TARGET_DIR = "../nextjs/generated/";

  const fileContent = Object.entries(allGeneratedContracts).reduce((content, [chainId, chainConfig]) => {
    return `${content}${parseInt(chainId).toFixed(0)}:${JSON.stringify(chainConfig, null, 2)},`;
  }, "");

  fs.mkdirSync(TARGET_DIR);
  fs.writeFileSync(
    `${TARGET_DIR}hardhat_contracts.ts`,
    prettier.format(`export default {${fileContent}} as const;`, { parser: "typescript" }),
  );
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
