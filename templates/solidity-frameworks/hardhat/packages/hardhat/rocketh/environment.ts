import { type Accounts, type Data, type Extensions, extensions } from "./config.js";
import { setupEnvironmentFromFiles } from "@rocketh/node";
import { setupHardhatDeploy } from "hardhat-deploy/helpers";

const { loadEnvironmentFromFiles, loadAndExecuteDeploymentsFromFiles } = setupEnvironmentFromFiles<
  Extensions,
  Accounts,
  Data
>(extensions);

const { loadEnvironmentFromHardhat } = setupHardhatDeploy<Extensions, Accounts, Data>(extensions);

export { loadEnvironmentFromFiles, loadAndExecuteDeploymentsFromFiles, loadEnvironmentFromHardhat };
