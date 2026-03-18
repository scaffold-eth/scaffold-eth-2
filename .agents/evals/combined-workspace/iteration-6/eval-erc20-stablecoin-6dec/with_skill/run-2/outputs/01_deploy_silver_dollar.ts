import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

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
