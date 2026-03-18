import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployCoolNFT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("CoolNFT", {
    from: deployer,
    args: [deployer],
    log: true,
    autoMine: true,
  });
};

export default deployCoolNFT;

deployCoolNFT.tags = ["CoolNFT"];
