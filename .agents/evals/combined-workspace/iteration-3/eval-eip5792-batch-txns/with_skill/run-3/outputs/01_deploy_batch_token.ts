import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { parseUnits } from "ethers";

/**
 * Deploys the BatchToken ERC20 contract.
 * The deployer receives 1,000,000 tokens (18 decimals) for testing batch transfers.
 */
const deployBatchToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("BatchToken", {
    from: deployer,
    args: ["BatchToken", "BATCH", 18, parseUnits("1000000", 18), deployer],
    log: true,
    autoMine: true,
  });
};

export default deployBatchToken;

deployBatchToken.tags = ["BatchToken"];
