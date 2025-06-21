import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);

const main = async () => {
  const args = process.argv.slice(2).filter(arg => !arg.startsWith("-"));
  const network = args[0];
  const contractName = args[1];

  if (!network) {
    console.log("Usage: yarn hardhat-verify <network> [optional: contractName]");
    return;
  }

  const deploymentsPath = path.join(__dirname, "../deployments", network);

  if (!fs.existsSync(deploymentsPath)) {
    console.log(`❌ No deployments found for network: ${network}`);
    return;
  }

  const deploymentFiles = fs
    .readdirSync(deploymentsPath)
    .filter(file => file.endsWith(".json") && !file.includes("solcInputs"));

  if (deploymentFiles.length === 0) {
    console.log(`❌ No contracts found for network: ${network}`);
    return;
  }

  const filesToVerify = contractName
    ? deploymentFiles.filter(file => path.basename(file, ".json") === contractName)
    : deploymentFiles;

  if (contractName && filesToVerify.length === 0) {
    console.log(`❌ Contract '${contractName}' not found`);
    return;
  }

  for (const file of filesToVerify) {
    const name = path.basename(file, ".json");
    const filePath = path.join(deploymentsPath, file);

    try {
      const deployment = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const args = (deployment.args || []).join(" ");
      const command = `yarn hh-verify --network ${network} ${deployment.address} ${args}`;

      console.log(`🔍 Verifying ${name}...`);
      const { stdout } = await execAsync(command);
      console.log(stdout);
    } catch (error: any) {
      console.log(`❌ Failed to verify ${name}: ${error.message}`);
    }
  }
};

main().catch(console.error);
