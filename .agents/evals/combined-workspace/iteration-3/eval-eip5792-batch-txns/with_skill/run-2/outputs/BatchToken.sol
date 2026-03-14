// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * An ERC-20 token for demonstrating EIP-5792 batch transactions.
 * Includes open minting so anyone can get tokens to test approve+transfer batching.
 */
contract BatchToken is ERC20 {
    event TokensMinted(address indexed to, uint256 amount);
    event TokensTransferredFrom(address indexed from, address indexed to, uint256 amount);

    constructor() ERC20("BatchToken", "BATCH") {
        // Mint initial supply to deployer for testing
        _mint(msg.sender, 1000 * 10 ** decimals());
    }

    /**
     * Open mint function — anyone can mint tokens to themselves for demo purposes.
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint (in wei units, 18 decimals)
     */
    function mint(address to, uint256 amount) public {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
}
