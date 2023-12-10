import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param The module ID.
 * @param The module builder callback function
 */
export default buildModule("DeployYourContract", m => {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY with a random private key in the .env file (then used on hardhat.config.ts) You can run the `yarn account` command to check your balance in every network.
  */
  const deployer = m.getAccount(0);

  const yourContract = m.contract("YourContract", [deployer], { from: deployer });
  return { yourContract };
});
