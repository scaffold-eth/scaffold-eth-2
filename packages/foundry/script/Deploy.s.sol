pragma solidity ^0.8.19;

import "../src/YourContract.sol";
import "./DeployHelpers.s.sol";

contract DeployScript is ScaffoldETHDeploy {
    function run() external {
        uint256 deployerPrivateKey = setupLocalhostEnv();

        vm.startBroadcast(deployerPrivateKey);
        YourContract yourContract = new YourContract(vm.addr(1));
        vm.stopBroadcast();
        exportDeployments();
    }

    function test() public {}
}
