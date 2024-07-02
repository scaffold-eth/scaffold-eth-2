//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Script, console } from "forge-std/Script.sol";
import { Vm } from "forge-std/Vm.sol";

contract ScaffoldETHDeploy is Script {
  error InvalidChain();

  struct Deployment {
    string name;
    address addr;
  }

  string root;
  string path;
  Deployment[] public deployments;
  uint256 constant SCAFFOLD_BASE_BALANCE = 9999 * 1e18;

  function _startBroadcast() internal returns (address deployer) {
    if (block.chainid == 31337) {
      // starts a broadcast and reads the caller
      vm.startBroadcast();
      (, deployer,) = vm.readCallers();
      vm.stopBroadcast();
      // check balance of first anvil account
      // if balance is not 0, is the first run
      uint256 balance = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266.balance;
      uint256 anvilFirstPk =
        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
      if (balance > 1 ether && deployer != vm.addr(anvilFirstPk)) {
        vm.startBroadcast(anvilFirstPk);
        deployer.call{ value: SCAFFOLD_BASE_BALANCE }("");
        vm.stopBroadcast();
      }
      vm.startBroadcast(deployer);
    } else {
      vm.startBroadcast();
      (, deployer,) = vm.readCallers();
    }
  }

  function _stopBroadcast() internal {
    vm.stopBroadcast();
  }

  function exportDeployments() internal {
    // fetch already existing contracts
    root = vm.projectRoot();
    path = string.concat(root, "/deployments/");
    string memory chainIdStr = vm.toString(block.chainid);
    path = string.concat(path, string.concat(chainIdStr, ".json"));

    string memory jsonWrite;

    uint256 len = deployments.length;

    for (uint256 i = 0; i < len; i++) {
      vm.serializeString(
        jsonWrite, vm.toString(deployments[i].addr), deployments[i].name
      );
    }

    string memory chainName;

    try this.getChain() returns (Chain memory chain) {
      chainName = chain.name;
    } catch {
      chainName = findChainName();
    }
    jsonWrite = vm.serializeString(jsonWrite, "networkName", chainName);
    vm.writeJson(jsonWrite, path);
  }

  function getChain() public returns (Chain memory) {
    return getChain(block.chainid);
  }

  function findChainName() public returns (string memory) {
    uint256 thisChainId = block.chainid;
    string[2][] memory allRpcUrls = vm.rpcUrls();
    for (uint256 i = 0; i < allRpcUrls.length; i++) {
      try vm.createSelectFork(allRpcUrls[i][1]) {
        if (block.chainid == thisChainId) {
          return allRpcUrls[i][0];
        }
      } catch {
        continue;
      }
    }
    revert InvalidChain();
  }
}
