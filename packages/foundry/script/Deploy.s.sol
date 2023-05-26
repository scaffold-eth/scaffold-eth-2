pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/YourContract.sol";

contract DeployScript is Script {
    struct Deployment {
        string name;
        address addr;
    }

    Deployment[] public deployments;

    // mapping(address => string) contractNames;

    function run() external {
        uint256 deployerPrivateKey;
        string memory root;
        string memory path;
        if (block.chainid == 31337) {
            root = vm.projectRoot();
            path = string.concat(root, "/localhost.json");
            string memory json = vm.readFile(path);
            bytes memory mnemonicBytes = vm.parseJson(json, ".wallet.mnemonic");
            string memory mnemonic = abi.decode(mnemonicBytes, (string));
            deployerPrivateKey = vm.deriveKey(mnemonic, 0);
        } else {
            deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        }
        vm.startBroadcast(deployerPrivateKey);

        YourContract yourContract1 = new YourContract(vm.addr(1));
        YourContract yourContract2 = new YourContract(vm.addr(1));

        console.logAddress(address(yourContract1));
        console.logAddress(address(yourContract2));

        deployments.push(Deployment("YourContract1", address(yourContract1)));
        deployments.push(Deployment("YourContract2", address(yourContract2)));

        string memory jsonWrite = "deployments";

        console.logUint(deployments.length);

        for (uint256 i = 0; i < deployments.length - 1; i++) {
            vm.serializeString(
                jsonWrite,
                vm.toString(deployments[i].addr),
                deployments[i].name
            );
        }
        string memory finalJson = vm.serializeString(
            jsonWrite,
            vm.toString(deployments[deployments.length - 1].addr),
            deployments[deployments.length - 1].name
        );
        root = vm.projectRoot();
        path = string.concat(root, "/deployments.json");
        finalJson = vm.serializeString(
            finalJson,
            vm.toString(block.chainid),
            finalJson
        );
        vm.writeJson(finalJson, path);
    }

    function test() public {}
}
