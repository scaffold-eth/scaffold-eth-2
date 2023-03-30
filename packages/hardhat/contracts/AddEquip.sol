//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "../node_modules/hardhat/console.sol";
// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LendingPlatform {
    struct Equipment {
        uint256 timeCreated;
        address owner;
        string name;
        uint256 price;
        bool isLent;
    }

    IERC20 public paymentToken;
    mapping(uint256 => Equipment) public equipmentList;
    uint256 public nextEquipmentId;

    event EquipmentAdded(uint256 indexed equipmentId, uint256 timeCreated, address indexed owner, string name, uint256 price);

    constructor(IERC20 _paymentToken) {
        paymentToken = _paymentToken;
    }

    function addEquipment(string memory _name, uint256 _price) external {
        Equipment memory newEquipment = Equipment(block.timestamp, msg.sender, _name, _price, false);
        equipmentList[nextEquipmentId] = newEquipment;
        emit EquipmentAdded(nextEquipmentId, block.timestamp ,msg.sender, _name, _price);
        nextEquipmentId++;
    }
}
