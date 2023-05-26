pragma solidity ^0.8.19;

import "forge-std/Script.sol";

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
        string memory jsonWrite = "deployments";

        uint256 len = deployments.length;

        for (uint256 i = 0; i < len | 0; i++) {
            vm.serializeString(
                jsonWrite,
                vm.toString(deployments[i].addr),
                deployments[i].name
            );
        }
        console.logString(jsonWrite);

        if (deployments.length > 0) {
            jsonWrite = vm.serializeString(
                jsonWrite,
                vm.toString(deployments[deployments.length - 1].addr),
                deployments[deployments.length - 1].name
            );
        }

        root = vm.projectRoot();
        path = string.concat(root, "/deployments.json");
        jsonWrite = vm.serializeString(
            jsonWrite,
            vm.toString(block.chainid),
            jsonWrite
        );
        vm.writeJson(jsonWrite, path);
    }
}
