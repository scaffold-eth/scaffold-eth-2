import * as fs from "fs";

import allGeneratedContracts from "../../nextjs/generated/hardhat_contracts.json";

async function main() {
  const tsAbisDir = "../nextjs/generated/abi";

  if (!fs.existsSync(tsAbisDir)) {
    fs.mkdirSync(tsAbisDir);
  }

  const localChaiContracts = allGeneratedContracts["31337"][0];
  Object.entries(localChaiContracts.contracts).forEach(async ([key, value]) => {
    await fs.writeFileSync(
      `../nextjs/generated/abi/${key}.ts`,
      `const erc721Abi = ${JSON.stringify(value, null, 2)} as const;

export default erc721Abi;
`,
    );
  });
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
