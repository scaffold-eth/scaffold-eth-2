// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * A simple ERC20 token used to demonstrate EIP-5792 batch transactions.
 * The deployer receives the initial supply and can distribute tokens to test
 * approve + transferFrom in a single batched wallet_sendCalls request.
 */
contract BatchToken is ERC20 {
    constructor(address _initialOwner) ERC20("BatchToken", "BATCH") {
        _mint(_initialOwner, 1_000_000 * 10 ** decimals());
    }
}
