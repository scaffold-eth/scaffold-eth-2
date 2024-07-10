//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import { Script, console } from "forge-std/Script.sol";
import { Vm } from "forge-std/Vm.sol";

contract ScaffoldETHDeploy is Script {
  error InvalidChain();
  error FailedAnvilRequest();
  error DeployerHasNoBalance();

  event AnvilSetBalance(address account, uint256 amount);

  struct Deployment {
    string name;
    address addr;
  }

  string root;
  string path;
  Deployment[] public deployments;
  uint256 constant ANVIL_LAST_PK =
    0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6;
  address constant ANVIL_LAST_ACCOUNT =
    0xa0Ee7A142d267C1f36714E4a8F75612F20a79720;
  uint256 constant ANVIL_BASE_BALANCE = 1000 ether;

  function _startBroadcast() internal returns (address deployer) {
    vm.startBroadcast();
    (, deployer,) = vm.readCallers();

    if (block.chainid == 31337 && deployer.balance) {
      vm.stopBroadcast();

      // ------------- FUND DEPLOYER ACCOUNT -------------
      vm.startBroadcast(ANVIL_LAST_PK);
      (bool success,) = deployer.call{ value: ANVIL_BASE_BALANCE / 2 }("");
      if (!success) {
        revert DeployerHasNoBalance();
      } else {
        try this.anvil_setBalance(ANVIL_LAST_ACCOUNT, ANVIL_BASE_BALANCE) {
          emit AnvilSetBalance(ANVIL_LAST_ACCOUNT, ANVIL_BASE_BALANCE);
        } catch {
          revert FailedAnvilRequest();
        }
      }
      vm.stopBroadcast();
      // ------------------------------------------------

      vm.startBroadcast(deployer);
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
      '", ',
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
