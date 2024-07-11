//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Script, console } from "forge-std/Script.sol";
import { Vm } from "forge-std/Vm.sol";

contract ScaffoldETHDeploy is Script {
  error InvalidChain();
  error DeployerHasNoBalance();

  event AnvilSetBalance(address account, uint256 amount);
  event FailedAnvilRequest();

  struct Deployment {
    string name;
    address addr;
  }

  string root;
  string path;
  Deployment[] public deployments;
  uint256 constant ANVIL_BASE_BALANCE = 10000 ether;

  function _startBroadcast() internal returns (address deployer) {
    vm.startBroadcast();
    (, deployer,) = vm.readCallers();

    if (block.chainid == 31337 && deployer.balance == 0) {
      try this.anvil_setBalance(deployer, ANVIL_BASE_BALANCE) {
        emit AnvilSetBalance(deployer, ANVIL_BASE_BALANCE);
      } catch {
        emit FailedAnvilRequest();
      }
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

  function anvil_setBalance(address addr, uint256 amount) public {
    string memory addressString = vm.toString(addr);
    string memory amountString = vm.toString(amount);
    string memory requestPayload = string.concat(
      '{"method":"anvil_setBalance","params":["',
      addressString,
      '","',
      amountString,
      '"],"id":1,"jsonrpc":"2.0"}'
    );

    string[] memory inputs = new string[](8);
    inputs[0] = "curl";
    inputs[1] = "-X";
    inputs[2] = "POST";
    inputs[3] = "http://localhost:8545";
    inputs[4] = "-H";
    inputs[5] = "Content-Type: application/json";
    inputs[6] = "--data";
    inputs[7] = requestPayload;

    vm.ffi(inputs);
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
