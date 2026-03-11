import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { parseUnits } from "ethers";

/**
 * Deploys the BatchToken ERC20 contract used for EIP-5792 batch transaction demos.
 * Mints 1,000,000 tokens to the deployer address.
 */
const deployBatchToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const TOKEN_NAME = "BatchToken";
  const TOKEN_SYMBOL = "BATCH";
  const TOKEN_DECIMALS = 18;
  const INITIAL_SUPPLY = parseUnits("1000000", TOKEN_DECIMALS);

  await deploy("BatchToken", {
    from: deployer,
    args: [TOKEN_NAME, TOKEN_SYMBOL, TOKEN_DECIMALS, INITIAL_SUPPLY, deployer],
    log: true,
    autoMine: true,
  });
};

export default deployBatchToken;

deployBatchToken.tags = ["BatchToken"];
