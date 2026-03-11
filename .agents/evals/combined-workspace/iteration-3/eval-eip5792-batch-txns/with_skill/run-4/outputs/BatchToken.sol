// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * An ERC-20 token used to demonstrate EIP-5792 batch transactions.
 * Anyone can mint tokens for testing. In production, restrict minting with access control.
 */
contract BatchToken is ERC20 {
    event TokensMinted(address indexed to, uint256 amount);

    constructor() ERC20("BatchToken", "BATCH") {
        // Mint an initial supply to the deployer for testing
        _mint(msg.sender, 1000 * 10 ** decimals());
    }

    /**
     * Open mint function for testing — lets anyone mint tokens to any address.
     * @param to The address to receive the minted tokens
     * @param amount The amount of tokens to mint (in wei units, i.e. 18 decimals)
     */
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
}
