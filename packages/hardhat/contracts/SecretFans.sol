//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; // ? NO ?
import "@openzeppelin/contracts/utils/Strings.sol";

// ! import safe math

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract SecretFans is ERC1155("") {
	uint256 public constant _TIMELOCK = 1 days; // ? 1 day ?
	uint256 public constant defaultMinSubFee = 0.01 ether;
	uint256 public constant maxSubs = 128;
	uint256 public currentTokenId = 0;

	struct ContentCreatorChannel {
		uint256 nSubs;
		uint256 maxSubs; // ! inutil ?
		uint256 minSubFee;
		uint256 totalETH;
		uint256 totalShares;
		bytes32[128 * 2 - 1] subsMerkleTree;
	}

	struct NftRegister {
		string uri;
		address contentCreator;
		bytes32 subsMerkleRoot;
	}

	mapping(uint256 => NftRegister) NftRegistry;
	mapping(address => ContentCreatorChannel) public Channels;
	mapping(address => uint256) public timelock;

	//--------------------------------------------Events------------------------------------------------------
	event subscription(
		address indexed contentCreator,
		uint256 position,
		address subscriber,
		address publicKey,
		uint256 subsShares
	);

	event newNFTPublished(address indexed contentCreator, uint256 tokenId);

	modifier notLocked() {
		require(
			timelock[msg.sender] == 0 ||
				timelock[msg.sender] <= block.timestamp,
			"Function is timelocked"
		);
		_;
	}

	function subscribeSpotsAvaliable(
		address contentCreator,
		address publicKey
	) public payable {
		ContentCreatorChannel storage channel = Channels[contentCreator];
		require(channel.nSubs < maxSubs, ""); //TODO
		require(
			msg.value > channel.minSubFee,
			"Insufficient balance to pay subscription fee"
		);
		uint256 sharesPerETH = 1;
		if (channel.totalETH != 0) {
			 sharesPerETH = channel.totalShares / channel.totalETH;
		} 
		channel.totalETH += msg.value;
		uint256 newSubsShares = msg.value * sharesPerETH;
		channel.totalShares += newSubsShares;

		// add leaf to merkle tree
		// bytes32 merkleLeaf = keccak256(
		// 	abi.encodePacked(
		// 		channel.nSubs,
		// 		msg.sender,
		// 		newSubsShares,
		// 		publicKey
		// 	)
		// );
		// channel.subsMerkleTree[channel.nSubs] = merkleLeaf;

		// uint count = maxSubs; // number of leaves
		// uint offset = 0;

		// while (count > 0) {
		// 	for (uint i = 0; i < count - 1; i += 2) {
		// 		channel.subsMerkleTree[count + i] = keccak256(
		// 			abi.encodePacked(
		// 				channel.subsMerkleTree[offset + i],
		// 				channel.subsMerkleTree[offset + i + 1]
		// 			)
		// 		);
		// 	}
		// 	offset += count;
		// 	count = count / 2;
		// }

		emit subscription(
			contentCreator,
			channel.nSubs,
			msg.sender,
			publicKey,
			newSubsShares
		); // ? emit nSubs ?
		channel.nSubs++;
		// TODO create ERC20
	}

	function subscribeSpotsFull(
		address contentCreator,
		uint256 subscriberOutPosition,
		address subscriberOut,
		uint256 subscriberOutShares,
		address subscriberOutPublicKey,
		address subscriberInPublicKey
	) public payable{
		ContentCreatorChannel storage channel = Channels[contentCreator];
		require(
			subscriberOutPosition < channel.maxSubs,
			"Wrong subscriber position"
		);
		bytes32 leafOut = keccak256(
			abi.encodePacked(
				subscriberOutPosition,
				subscriberOut,
				subscriberOutShares,
				subscriberOutPublicKey
			)
		);
		require(
			leafOut == channel.subsMerkleTree[subscriberOutPosition],
			"Incorrect leaf data"
		);

		uint256 sharesPerETH = channel.totalShares / channel.totalETH;
		require(
			msg.value >= subscriberOutShares * sharesPerETH * 3 / 2,
			"Value not enough to pay for subscription"
		); //! Tokenomics

		(bool success, ) = subscriberOut.call{
			value: subscriberOutShares * sharesPerETH *  3 / 2
		}("");
		require(success, "Failed to send Ether.");

		channel.totalETH += msg.value * 1 / 2; //! Tokenomics
		uint256 newSubsShares = msg.value * sharesPerETH *  1 / 2;
		channel.totalShares += newSubsShares;

		uint count = maxSubs; // number of leaves
		uint offset = 0;

		channel.subsMerkleTree[subscriberOutPosition] = keccak256(
			abi.encodePacked(
				subscriberOutPosition,
				msg.sender,
				newSubsShares,
				subscriberInPublicKey
			)
		);
		while (count > 0) {
			// ! can be optimized, no need to redo all merkle tree
			for (uint i = 0; i < count - 1; i += 2) {
				channel.subsMerkleTree[count + i] = keccak256(
					abi.encodePacked(
						channel.subsMerkleTree[offset + i],
						channel.subsMerkleTree[offset + i + 1]
					)
				);
			}
			offset += count;
			count = count / 2;
		}

		emit subscription(
			contentCreator,
			subscriberOutPosition,
			msg.sender,
			subscriberInPublicKey,
			newSubsShares
		);
	}

	function publish(
		string memory _uri,
		bytes calldata encryptedContentEncriptionKeys
	) public notLocked {
		ContentCreatorChannel memory channel = Channels[msg.sender];
		uint256 _currentTokenId = currentTokenId;
		// TODO verify ZKP
		NftRegistry[_currentTokenId] = NftRegister(
			_uri,
			msg.sender,
			channel.subsMerkleTree[channel.subsMerkleTree.length]
		);

		(bool success, ) = msg.sender.call{ value: channel.totalETH * 3 / 20 }(
			""
		);
		require(success, "Failed to send Ether.");
		channel.totalETH -= channel.totalETH * 3 / 20;
		currentTokenId++;
		timelock[msg.sender] = block.timestamp + _TIMELOCK;
		emit newNFTPublished(msg.sender, _currentTokenId);
	}

	function uri(uint256 tokenId) public view override returns (string memory) {
		return (NftRegistry[tokenId].uri);
	}

	function mint(uint256 tokenId, bytes32 leaf, uint256 leafPosition) public {
		ContentCreatorChannel memory channel = Channels[
			NftRegistry[tokenId].contentCreator
		];
		require(
			balanceOf(msg.sender, tokenId) == 0,
			"You already minted this NFT!"
		);
		require(
			channel.subsMerkleTree[leafPosition] == leaf,
			"You already minted this NFT!"
		);
		_mint(msg.sender, tokenId, 1, "");
	}

	/**
	 * Function that allows the contract to receive ETH
	 */
	receive() external payable {}

    function getMerkleTree(address channelAddress) public view returns (bytes32[255] memory) {
        return Channels[channelAddress].subsMerkleTree;
    }
}
