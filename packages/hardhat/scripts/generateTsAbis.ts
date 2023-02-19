import * as fs from "fs";
//@ts-expect-error - This script runs after `hardhat deploy --export` therefore its deterministic that it will preset
import allGeneratedContracts from "../../nextjs/generated/hardhat_contracts.json";

async function main() {
  const GENERATED_PATH = "../nextjs/generated/hardhat_contracts";
  fs.writeFileSync(
    `${GENERATED_PATH}.json`,
    `export default ${JSON.stringify(allGeneratedContracts, null, 2)} as const;`,
  );
  // remove json file due to ambiguity
  fs.unlinkSync(`${GENERATED_PATH}.json`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
