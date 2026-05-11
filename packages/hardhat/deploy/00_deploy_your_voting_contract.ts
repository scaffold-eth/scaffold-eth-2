import { deployScript } from "../rocketh/deploy.js";
import * as artifacts from "../generated/artifacts/index.js";

/**
 * Deploys the Voting contract (and its dependencies) using the deployer account.
 *
 * @param env Rocketh environment object.
 */
export default deployScript(
  async env => {
    const { deployer } = env.namedAccounts;

    const ownerAddress = "0x0000000000000000000000000000000000000001";

    /// checkpoint 6 //////
    const verifierAddress = "0x0000000000000000000000000000000000000002"; // placeholder
    await env.deploy("HonkVerifier", {
      account: deployer,
      artifact: artifacts.HonkVerifier,
    });

    /// checkpoint 2 //////
    const leanIMTAddress = "0x0000000000000000000000000000000000000003"; // placeholder
    const poseidon3 = await env.deploy("PoseidonT3", {
      account: deployer,
      artifact: artifacts.PoseidonT3,
    });

    await env.deploy(
      "LeanIMT",
      {
        account: deployer,
        artifact: artifacts.LeanIMT,
      },
      {
        libraries: {
          PoseidonT3: poseidon3.address,
        },
      },
    );

    await env.deploy(
      "Voting",
      {
        account: deployer,
        artifact: artifacts.Voting,
        // Contract constructor arguments
        /// checkpoint 6 //////
        args: [ownerAddress, verifierAddress, "Should we build zk apps?"],
      },
      {
        libraries: {
          /// checkpoint 2 //////
          LeanIMT: leanIMTAddress,
        },
      },
    );
  },
  {
    // Tags are useful if you have multiple deploy files and only want to run some of them.
    // e.g. yarn deploy --tags YourVotingContract
    tags: ["YourVotingContract"],
  },
);
