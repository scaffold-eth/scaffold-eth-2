//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

contract YourContract {
  /* ========== TYPE DECLARATIONS ========== */

  /* ========== STATE VARIABLES ========== */
  uint256 public immutable i_changePurposePrice;
  string public purpose;
  mapping(address => string) public addressToPurpose;

  /* ========== EVENTS ========== */
  event PurposeChange(address purposeSetter, string newPurpose, uint256 value);

  /* ========== CONTRUCTOR & MODIFIERS ========== */
  constructor(string memory _purpose, uint256 _changePurposePrice) {
    purpose = _purpose;
    i_changePurposePrice = _changePurposePrice;
  }

  modifier costs() {
    require(msg.value >= i_changePurposePrice, "Not enough ETH provided");
    _;
  }

  receive() external payable {
    // ...
  }

  fallback() external {
    // ...
  }

  /* ========== EXTERNAL FUNCTIONS ========== */

  /* ========== PUBLIC FUNCTIONS ========== */
  function changePurpose(string memory newPurpose) public payable costs {
    addressToPurpose[msg.sender] = newPurpose;
    purpose = newPurpose;
    emit PurposeChange(msg.sender, newPurpose, msg.value);
  }

  /* ========== INTERNAL FUNCTIONS ========== */

  /* ========== PRIVATE FUNCTIONS ========== */
}
