// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * An ERC-20 token for demonstrating EIP-5792 batch transactions.
 * Anyone can mint tokens to themselves for testing approve+transfer batching.
 */
contract BatchToken is ERC20 {
    constructor() ERC20("BatchToken", "BATCH") {}

    /**
     * Open mint for demo purposes — lets any user get tokens to test with.
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint (in wei, 18 decimals)
     */
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
