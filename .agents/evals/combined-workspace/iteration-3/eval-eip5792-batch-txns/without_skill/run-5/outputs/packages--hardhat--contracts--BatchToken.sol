// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * An ERC20 token used to demonstrate EIP-5792 batch transactions.
 * The deployer receives an initial supply and can mint more tokens.
 * Users can approve and transfer tokens in a single batch call
 * via wallet_sendCalls (EIP-5792).
 */
contract BatchToken is ERC20, Ownable {
    constructor(
        address _owner,
        uint256 _initialSupply
    ) ERC20("BatchToken", "BATCH") Ownable(_owner) {
        _mint(_owner, _initialSupply);
    }

    /**
     * Allows the owner to mint additional tokens.
     * @param _to Recipient address
     * @param _amount Amount of tokens to mint
     */
    function mint(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
    }
}
