import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("Mock_USDC", {
    from: deployer,
    // Contract constructor arguments
    args: ["0x82AE2D14e2fdeA02f84A03a35Bcb869d199bb01A"], //[deployer],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  await deploy("Backed_bTTDC", {
    from: deployer,
    // Contract constructor arguments
    args: ["0x82AE2D14e2fdeA02f84A03a35Bcb869d199bb01A"], //[deployer],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  await deploy("Vaulted_vTTDC", {
    from: deployer,
    // Contract constructor arguments
    args: [], //[deployer],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  await deploy("VART", {
    from: deployer,
    // Contract constructor arguments
    args: [], //[deployer],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  await deploy("Vault", {
    from: deployer,
    // Contract constructor arguments
    args: ["0x610178dA211FEF7D417bC0e6FeD39F05609AD788", "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e", "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0", "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82"], //[deployer],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });



  // Get the deployed contract
  // const yourContract = await hre.ethers.getContract("YourContract", deployer);
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
//deployYourContract.tags = ["Mock_USDC"];
