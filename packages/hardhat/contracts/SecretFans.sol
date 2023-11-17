//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract SecretFans {

	uint256 constant defaultMinSubFee = 0.01 ether;
	uint256 constant maxSubs = 128;

	struct ContentCreatorChannel {
		uint256 nSubs;
		uint256 maxSubs;
		uint256 minSubFee;
		uint256 totalETH;
		uint256 totalShares;
		bytes32[maxSubs * 2 - 1] subsMerkleTree;
	}

	mapping(address => ContentCreatorChannel) Channels;
	//--------------------------------------------Events------------------------------------------------------
	event subscription(uint16 indexed tournamentID);

	function subscribeSpotsAvaliable(address contentCreator) public payable {
		ContentCreatorChannel channel = channels[contentCreator];
		require(channel.nSubs<maxSubs,""); //TODO
		require(
			msg.value > channel.minSubFee,
			"Insufficient balance to pay subscription fee"
		);
		channel.totalETH += msg.value;
		uint256 sharesPerETH = channel.totalShares/channel.totalETH;
		uint256 newSubsShares = msg.value*sharesPerETH;
		channel.totalShares += newSubsShares;

		
		//TODO add leaf to merkle tree
	}

	function subscribeSpotsFull(uint256 _subscriptionFee) public {}

	/**
	 * Function that allows the contract to receive ETH
	 */
	receive() external payable {}
}
