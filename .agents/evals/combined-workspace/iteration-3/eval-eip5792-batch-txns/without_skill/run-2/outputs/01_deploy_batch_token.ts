import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the BatchToken ERC20 contract for demonstrating EIP-5792 batch transactions.
 */
const deployBatchToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("BatchToken", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
};

export default deployBatchToken;

deployBatchToken.tags = ["BatchToken"];
