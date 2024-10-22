import { withDefaults } from "../../../../../utils.js";

const content = ({ deploymentsScriptsImports, deploymentsLogic }) => `//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
${deploymentsScriptsImports.filter(Boolean).join("\n")}

contract DeployScript is ScaffoldETHDeploy {
  function run() external {
    ${deploymentsLogic.filter(Boolean).join("\n")}

    // deploy more contracts here
    // DeployMyContract deployMyContract = new DeployMyContract();
    // deployMyContract.run();
  }
}`;

export default withDefaults(content, {
  deploymentsScriptsImports: "",
  deploymentsLogic: "",
});
