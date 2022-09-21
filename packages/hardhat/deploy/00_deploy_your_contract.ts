import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployYourContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // proxy only in non-live network (localhost and hardhat network) enabling HCR (Hot Contract Replacement)
  // in live network, proxy is disabled and constructor is invoked
  await deploy("YourContract", {
    from: deployer,
    // Constructor args.
    args: [],
    log: true,
    // Speed up deployment on local network, no effect on live networks
    autoMine: true,
  });

  // Get the deployed contract.
  const yourContract = await hre.ethers.getContract("YourContract", deployer);
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["YourContract"];
