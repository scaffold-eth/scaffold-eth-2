// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BatchToken
 * @notice ERC20 token designed to demonstrate EIP-5792 batch transactions.
 * Users can mint tokens, then use wallet_sendCalls to batch an approve + transferFrom
 * in a single user operation.
 */
contract BatchToken is ERC20, Ownable {
    uint256 public constant MINT_AMOUNT = 1000 * 10 ** 18;

    event TokensMinted(address indexed to, uint256 amount);

    constructor(address _owner) ERC20("BatchToken", "BATCH") Ownable(_owner) {
        // Mint initial supply to the deployer
        _mint(_owner, 10000 * 10 ** 18);
    }

    /**
     * @notice Allows anyone to mint a fixed amount of tokens to themselves.
     * This is for demo purposes so users can easily get tokens to test batching.
     */
    function mint() external {
        _mint(msg.sender, MINT_AMOUNT);
        emit TokensMinted(msg.sender, MINT_AMOUNT);
    }
}
