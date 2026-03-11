import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the BatchToken ERC-20 contract using the deployer account.
 * The deployer receives an initial supply of 1000 BATCH tokens.
 *
 * @param hre HardhatRuntimeEnvironment object.
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

  const batchToken = await hre.ethers.getContract<Contract>("BatchToken", deployer);
  const totalSupply = await batchToken.totalSupply();
  console.log("BatchToken deployed with total supply:", totalSupply.toString());
};

export default deployBatchToken;

deployBatchToken.tags = ["BatchToken"];
