import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("YourContract", {
    from: deployer,
    // Constructor args.
    // Use your frontend address
    args: ["0x15f6228130de8ddD0F25710cc122d066dC6f3C5d"],
    log: true,
    // Speed up deployment on local network, no effect on live networks
    autoMine: true,
  });

  // Get the deployed contract.
  // const yourContract = await hre.ethers.getContract("YourContract", deployer);
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["YourContract"];
