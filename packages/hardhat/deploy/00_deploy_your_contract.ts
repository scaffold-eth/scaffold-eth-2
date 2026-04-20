import { deployScript } from "../rocketh/deploy.js";
import * as artifacts from "../generated/artifacts/index.js";

/**
 * Deploys a contract named "YourContract" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param env Rocketh environment object.
 */
export default deployScript(
  async env => {
    /*
      On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

      When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
      should have sufficient balance to pay for the gas fees for contract creation.

      You can generate a random account with `yarn generate` or `yarn account:import` to import your
      existing PK which will fill DEPLOYER_PRIVATE_KEY_ENCRYPTED in the .env file (then used on hardhat.config.ts)
      You can run the `yarn account` command to check your balance in every network.
    */
    const { deployer } = env.namedAccounts;

    const yourContract = await env.deploy("YourContract", {
      account: deployer,
      artifact: artifacts.YourContract,
      // Contract constructor arguments
      args: [deployer],
    });

    // Read back from the deployed contract
    const greeting = await env.read(yourContract, { functionName: "greeting" });
    console.log("👋 Initial greeting:", greeting);
  },
  {
    // Tags are useful if you have multiple deploy files and only want to run one of them.
    // e.g. yarn deploy --tags YourContract
    tags: ["YourContract"],
  },
);
