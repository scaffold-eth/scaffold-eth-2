// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FundingRound
 * @dev This contract allows investors to deposit USDC until a capital raised goal is reached.
 * Optionally, an investor whitelist can be specified at construction.
 */
contract FundingRound is Ownable {
    using SafeERC20 for IERC20;

    /// @notice Address of the USDC token contract.
    IERC20 public immutable usdc;
    /// @notice Capital raised goal in USDC.
    uint256 public immutable goal;
    /// @notice Indicates if a whitelist is used.
    bool public immutable whitelistEnabled;
    /// @notice Total amount of USDC raised.
    uint256 public totalRaised;
    /// @notice Mapping to track individual contributions.
    mapping(address => uint256) public contributions;
    /// @notice Mapping for whitelist of approved investors.
    mapping(address => bool) public whitelist;
    /// @notice Mapping for the equitiy recievers
    mapping(address => uint) public capTable;

    /**
     * @dev Emitted when an investor makes a contribution.
     * @param investor The address of the investor.
     * @param amount The amount of USDC contributed.
     */
    event Contribution(address indexed investor, uint256 amount);

    /**
     * @dev Initializes the contract with the USDC token address, funding goal, and optionally a whitelist.
     * @param _usdc The address of the USDC token contract.
     * @param _goal The funding goal in USDC.
     * @param _whitelistEnabled Boolean indicating if whitelist is enabled.
     * @param _whitelistAddresses List of addresses to be whitelisted if whitelist is enabled.
     */
    constructor(
        address _usdc,
        uint256 _goal,
        bool _whitelistEnabled,
        address[] memory _whitelistAddresses
    ) {
        require(_usdc != address(0), "USDC address cannot be zero.");
        require(_goal > 0, "Goal must be greater than zero.");

        usdc = IERC20(_usdc);
        goal = _goal;
        whitelistEnabled = _whitelistEnabled;

        if (whitelistEnabled) {
            for (uint256 i = 0; i < _whitelistAddresses.length; i++) {
                whitelist[_whitelistAddresses[i]] = true;
            }
        }
    }

    /**
     * @notice Allows an investor to contribute USDC to the funding round.
     * @param amount The amount of USDC to contribute.
     */
    function contribute(uint256 amount) external {
        require(amount > 0, "Contribution amount must be greater than zero.");
        require(totalRaised + amount <= goal, "Contribution exceeds funding goal.");

        if (whitelistEnabled) {
            require(whitelist[msg.sender], "Investor is not whitelisted.");
        }

        usdc.safeTransferFrom(msg.sender, address(this), amount);
        contributions[msg.sender] += amount;
        totalRaised += amount;

        emit Contribution(msg.sender, amount);
    }

    /**
     * @notice Allows the owner to add addresses to the whitelist.
     * @param _addresses List of addresses to be added to the whitelist.
     */
    function addToWhitelist(address[] calldata _addresses) external onlyOwner {
        require(whitelistEnabled, "Whitelist is not enabled.");

        for (uint256 i = 0; i < _addresses.length; i++) {
            whitelist[_addresses[i]] = true;
        }
    }

    /**
     * @notice Allows the owner to remove addresses from the whitelist.
     * @param _addresses List of addresses to be removed from the whitelist.
     */
    function removeFromWhitelist(address[] calldata _addresses) external onlyOwner {
        require(whitelistEnabled, "Whitelist is not enabled.");

        for (uint256 i = 0; i < _addresses.length; i++) {
            whitelist[_addresses[i]] = false;
        }
    }

    /**
     * @notice Allows the owner to add someone to the capex
     * @param _addresses List of addresses to be removed from the whitelist.
     * @param _addresses List of equity percentages
     */
    function addToCapex(address[] calldata _addresses, uint[] calldata _percentages) external onlyOwner {
	// TODO: Establish a percentage limit
	//TODO: Establish when capex is not modifiable


        for (uint256 i = 0; i < _addresses.length; i++) {
            capTable[_addresses[i]] = _percentages[i];
        }
    }

    /**
     * @notice Allows investors to check their contribution amount.
     * @param investor The address of the investor.
     * @return The amount of USDC contributed by the investor.
     */
    function getContribution(address investor) external view returns (uint256) {
        return contributions[investor];
    }
}

