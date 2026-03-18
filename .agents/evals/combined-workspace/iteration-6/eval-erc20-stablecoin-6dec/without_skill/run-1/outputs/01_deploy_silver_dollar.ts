import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the SilverDollar (SLVR) stablecoin contract.
 * The deployer becomes the initial owner who can mint tokens.
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deploySilverDollar: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("SilverDollar", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
};

export default deploySilverDollar;

deploySilverDollar.tags = ["SilverDollar"];
