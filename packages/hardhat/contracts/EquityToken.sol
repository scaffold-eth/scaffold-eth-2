// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract EquityToken is ERC20Burnable {

    address[] public partners;
    address public founder;
    mapping(address => PartnerDetails) public partnersDetails;

    struct PartnerDetails {
        uint tokensAmount;
        uint cliffPeriod;
        uint vestingPeriod;
    }

    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {
        founder = tx.origin;
    }


    function addPartner(address _partner, uint _tokensAmount, uint _cliffPeriod, uint _vestingPeriod) external {
        if (partners.length == 0) {
            require(msg.sender == founder, "Only the founder can add the first partner.");
        }
        require(_partner != address(0), "Invalid partner address");
        require(_tokensAmount > 0, "Invalid tokens amount");
        require(_cliffPeriod <= _vestingPeriod, "Cliff period must be less than or equal to vesting period");

        partners.push(_partner);
        partnersDetails[_partner] = PartnerDetails(_tokensAmount, (block.timestamp + _cliffPeriod), (block.timestamp + _vestingPeriod));

        if (_cliffPeriod == 0 && _vestingPeriod == 0) {
            _mint(_partner, _tokensAmount);
        }
    }
}
