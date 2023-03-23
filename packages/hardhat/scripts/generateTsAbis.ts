import * as fs from "fs";
//@ts-expect-error  This script runs after `hardhat deploy --export` therefore its deterministic that it will present
import allGeneratedContracts from "../../nextjs/generated/hardhat_contracts.json";
import prettier from "prettier";

function main() {
  const GENERATED_PATH = "../nextjs/generated/hardhat_contracts";

  const fileContent = Object.entries(allGeneratedContracts).reduce((content, [chainId, chainConfig]) => {
    return `${content}${parseInt(chainId).toFixed(0)}:${JSON.stringify(chainConfig, null, 2)},`;
  }, "");

  fs.writeFileSync(
    `${GENERATED_PATH}.ts`,
    prettier.format(`export default {${fileContent}} as const;`, { parser: "typescript" }),
  );
  // remove json file due to ambiguity
  fs.unlinkSync(`${GENERATED_PATH}.json`);
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
