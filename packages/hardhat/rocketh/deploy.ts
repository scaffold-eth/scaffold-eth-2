import { type Accounts, type Data, type Extensions, extensions } from "./config.js";
import { setupDeployScripts } from "rocketh";

const { deployScript } = setupDeployScripts<Extensions, Accounts, Data>(extensions);
export { deployScript };
