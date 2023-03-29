// /SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
//import "hardhat/console.sol";
// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract YourContract {
  // State Variables
  address public owner;
  uint256 public checkedInNow;
  mapping(address => bool) hasCheckedIn;

  // Constructor: Called once on contract deployment
  // Check packages/hardhat/deploy/00_deploy_your_contract.ts
  constructor(address _owner) {
    owner = _owner;
  }

  // Modifier: used to define a set of rules that must be met before or after a function is executed
  // Check the withdraw() function
  modifier isOwner() {
    // msg.sender: predefined variable that represents address of the account that called the current function
    require(msg.sender == owner, "Not the Owner");
    _;
  }

  function setNewOwner(address someAddress) public isOwner {
    owner = someAddress;
  }

  function checkin() public payable {
    require(!hasCheckedIn[msg.sender], "Already checked in");
    require(msg.value == 0.001 ether, "Must pay 0.001 ether to check in");
    hasCheckedIn[msg.sender] = true;
    checkedInNow++;
  }

  function checkout() public {
    require(hasCheckedIn[msg.sender], "Not checked in");
    hasCheckedIn[msg.sender] = false;
    checkedInNow--;

    (bool success, ) = msg.sender.call{value: 0.001 ether}("");
    require(success, "Failed to send Ether");
  }

  /**
   * Function that allows the owner to withdraw all the Ether in the contract
   * The function can only be called by the owner of the contract as defined by the isOwner modifier
   */
  function rug() public isOwner {
    (bool success, ) = owner.call{value: address(this).balance}("");
    require(success, "Failed to send Ether");
  }

  /**
   * Function that allows the contract to receive ETH
   */
  receive() external payable {}
}
