// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2; //Do not change the solidity version as it negatively impacts submission grading

//// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";
//
//// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
//// import "@openzeppelin/contracts/access/Ownable.sol";
//

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract YourCollectible is
ERC721,
ERC721Enumerable,
ERC721URIStorage,
Ownable
{
	using Counters for Counters.Counter;

	Counters.Counter public tokenIdCounter;

	constructor() ERC721("YourCollectible", "YCB") {}

	function _baseURI() internal pure override returns (string memory) {
		return "https://ipfs.io/ipfs/";
	}

	function mintItem(address to, string memory uri) public returns (uint256) {
		tokenIdCounter.increment();
		uint256 tokenId = tokenIdCounter.current();
		_safeMint(to, tokenId);
		_setTokenURI(tokenId, uri);
		return tokenId;
	}

	// The following functions are overrides required by Solidity.

	function _beforeTokenTransfer(
		address from,
		address to,
		uint256 tokenId,
		uint256 quantity
	) internal override(ERC721, ERC721Enumerable) {
		super._beforeTokenTransfer(from, to, tokenId, quantity);
	}

	function _burn(
		uint256 tokenId
	) internal override(ERC721, ERC721URIStorage) {
		super._burn(tokenId);
	}

	function tokenURI(
		uint256 tokenId
	) public view override(ERC721, ERC721URIStorage) returns (string memory) {
		return super.tokenURI(tokenId);
	}

	function supportsInterface(
		bytes4 interfaceId
	)
	public
	view
	override(ERC721, ERC721Enumerable, ERC721URIStorage)
	returns (bool)
	{
		return super.supportsInterface(interfaceId);
	}
}

