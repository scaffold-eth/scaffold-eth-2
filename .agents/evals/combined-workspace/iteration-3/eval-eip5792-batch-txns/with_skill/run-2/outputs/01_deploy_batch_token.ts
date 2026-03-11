import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the BatchToken ERC-20 contract for EIP-5792 batch transaction demos.
 * The deployer receives an initial supply of 1000 BATCH tokens.
 */
const deployBatchToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("BatchToken", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
};

export default deployBatchToken;

deployBatchToken.tags = ["BatchToken"];
