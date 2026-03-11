// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * An ERC-20 token used to demonstrate EIP-5792 batch transactions.
 * The owner can mint tokens, and any holder can approve + transfer in a single
 * batched wallet_sendCalls request.
 */
contract BatchToken is ERC20 {
    address public immutable owner;

    event TokensMinted(address indexed to, uint256 amount);

    constructor(address _owner) ERC20("BatchToken", "BATCH") {
        owner = _owner;
        // Mint an initial supply to the deployer so there are tokens to demo with
        _mint(_owner, 1000 * 10 ** decimals());
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    /**
     * Mint new tokens. Restricted to the contract owner.
     * @param to The address to receive the minted tokens
     * @param amount The amount of tokens to mint (in wei units, i.e. 18 decimals)
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
}
