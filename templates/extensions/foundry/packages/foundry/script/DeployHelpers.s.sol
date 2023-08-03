//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/Vm.sol";

contract ScaffoldETHDeploy is Script {
    struct Deployment {
        string name;
        address addr;
    }

    string root;
    string path;
    Deployment[] public deployments;

    function setupLocalhostEnv()
        internal
        returns (uint256 localhostPrivateKey)
    {
        if (block.chainid == 31337) {
            root = vm.projectRoot();
            path = string.concat(root, "/localhost.json");
            string memory json = vm.readFile(path);
            bytes memory mnemonicBytes = vm.parseJson(json, ".wallet.mnemonic");
            string memory mnemonic = abi.decode(mnemonicBytes, (string));
            return vm.deriveKey(mnemonic, 0);
        } else {
            return vm.envUint("DEPLOYER_PRIVATE_KEY");
        }
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
                jsonWrite,
                vm.toString(deployments[i].addr),
                deployments[i].name
            );
        }

        string memory chainName = getChain(block.chainid).name;
        jsonWrite = vm.serializeString(jsonWrite, "networkName", chainName);
        vm.writeJson(jsonWrite, path);
    }

    function exportDeployments(string memory customChainName) internal {
        // fetch already existing contracts
        root = vm.projectRoot();
        path = string.concat(root, "/deployments/");
        string memory chainIdStr = vm.toString(block.chainid);
        path = string.concat(path, string.concat(chainIdStr, ".json"));

        string memory jsonWrite;

        uint256 len = deployments.length;

        for (uint256 i = 0; i < len; i++) {
            vm.serializeString(
                jsonWrite,
                vm.toString(deployments[i].addr),
                deployments[i].name
            );
        }
        jsonWrite = vm.serializeString(
            jsonWrite,
            "networkName",
            customChainName
        );
        vm.writeJson(jsonWrite, path);
    }
}
