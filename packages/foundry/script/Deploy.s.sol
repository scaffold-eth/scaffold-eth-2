pragma solidity ^0.8.19;

import "../src/YourContract.sol";
import "./DeployHelpers.s.sol";

contract DeployScript is ScaffoldETHDeploy {
    // mapping(address => string) contractNames;

    function run() external {
        uint256 deployerPrivateKey = setupLocalhostEnv();

        vm.startBroadcast(deployerPrivateKey);
        YourContract yourContract1 = new YourContract(vm.addr(1));
        YourContract yourContract2 = new YourContract(vm.addr(1));
        vm.stopBroadcast();

        deployments.push(Deployment("YourContract1", address(yourContract1)));
        deployments.push(Deployment("YourContract2", address(yourContract2)));

        exportDeployments();
    }

    function test() public {}
}
