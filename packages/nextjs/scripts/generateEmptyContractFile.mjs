/**
 * This script creates the 'generated/hardhat_contracts.ts' file
 * if the file doesn't exist already.
 *
 * This way we avoid import errors when running the Next app.
 */
import fs from "fs";
import path from "path";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const nextJsDir = path.resolve(__dirname, "..");

const contractsFilePath = path.join(nextJsDir, "generated", "hardhat_contracts.ts");
const content = "const contracts = null;\nexport default contracts;\n";

if (!fs.existsSync(contractsFilePath)) {
  // Create the 'generated' directory if it doesn't exist
  const generatedPath = path.join(nextJsDir, "generated");
  if (!fs.existsSync(generatedPath)) {
    fs.mkdirSync(generatedPath);
  }

  // Create the 'hardhat_contracts.ts'
  fs.writeFileSync(contractsFilePath, content);
}
