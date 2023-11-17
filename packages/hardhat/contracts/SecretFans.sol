//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract SecretFans is ERC1155 {
	uint256 constant defaultMinSubFee = 0.01 ether;
	uint256 constant maxSubs = 128;
	uint256 public currentTokenId = 0;

	struct ContentCreatorChannel {
		uint256 nSubs;
		uint256 maxSubs;
		uint256 minSubFee;
		uint256 totalETH;
		uint256 totalShares;
		bytes32[maxSubs * 2 - 1] subsMerkleTree;
	}

	struct NftRegister {
		string uri;
		address contentCreator;
		bytes32 subsMerkleRoot;
	}

	mapping(uint256 => NftRegister) NftRegistry;
	mapping(address => ContentCreatorChannel) Channels;
	//--------------------------------------------Events------------------------------------------------------
	event subscription(
		address indexed contentCreator,
		address subscriber,
		bytes32 publicKey,
		uint256 subsShares
	);

	event newNFTPublished(address indexed contentCreator, uint256 tokenId);

	function subscribeSpotsAvaliable(
		address contentCreator,
		bytes32 publicKey
	) public payable {
		ContentCreatorChannel channel = channels[contentCreator];
		require(channel.nSubs < maxSubs, ""); //TODO
		require(
			msg.value > channel.minSubFee,
			"Insufficient balance to pay subscription fee"
		);
		channel.totalETH += msg.value;
		uint256 sharesPerETH = channel.totalShares / channel.totalETH;
		uint256 newSubsShares = msg.value * sharesPerETH;
		channel.totalShares += newSubsShares;

		//TODO add leaf to merkle tree

		emit subscription(contentCreator, msg.sender, publicKey, newSubsShares);
	}

	function subscribeSpotsFull(uint256 _subscriptionFee) public {}

	function publish(
		string memory uri,
		bytes calldata encryptedContentEncriptionKeys
	) public {
		uint256 _currentTokenId = currentTokenId;
		// TODO verify ZKP
		NftRegistry[_currentTokenId] = NftRegister(
			uri,
			msg.sender,
			channels[contentCreator].subsMerkleRoot
		);
		//TODO withdraw money form totalETH (transfer, actualize pool)
		currentTokenId++;
		emit newNFTPublished(msg.sender, _currentTokenId);
	}

	function uri(uint256 tokenId) public view override returns (string memory) {
		return (NftRegistry[tokenId].uri);
	}

	/**
	 * Function that allows the contract to receive ETH
	 */
	receive() external payable {}
}
