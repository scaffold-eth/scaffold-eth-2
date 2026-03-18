import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the GoldToken contract with the deployer as the initial owner.
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

  const goldToken = await hre.ethers.getContract<Contract>("GoldToken", deployer);
  console.log("🪙 GoldToken deployed. Cap:", await goldToken.cap());
};

export default deployGoldToken;

deployGoldToken.tags = ["GoldToken"];
