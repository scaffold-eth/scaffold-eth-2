import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the GoldToken contract using the deployer account.
 * The deployer becomes the owner and sole minter.
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployGoldToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("GoldToken", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
};

export default deployGoldToken;

deployGoldToken.tags = ["GoldToken"];
