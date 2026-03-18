// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/// @title CoolNFT - An on-chain SVG NFT collection with unique colors
/// @notice Each NFT has a unique color derived from its token ID, with on-chain SVG metadata
contract CoolNFT is ERC721Enumerable, Ownable {
	using Strings for uint256;

	uint256 public constant MAX_SUPPLY = 100;
	uint256 public constant MINT_PRICE = 0.01 ether;

	uint256 private _tokenIdCounter;

	event Minted(address indexed minter, uint256 indexed tokenId);

	constructor() ERC721("CoolNFT", "COOL") Ownable(msg.sender) {}

	/// @notice Mint a new CoolNFT by paying the mint price
	function mintItem() public payable returns (uint256) {
		require(msg.value >= MINT_PRICE, "Not enough ETH sent");
		require(_tokenIdCounter < MAX_SUPPLY, "Max supply reached");

		_tokenIdCounter++;
		uint256 newTokenId = _tokenIdCounter;

		_safeMint(msg.sender, newTokenId);

		emit Minted(msg.sender, newTokenId);
		return newTokenId;
	}

	/// @notice Generate a deterministic color from a token ID
	function generateColor(uint256 tokenId) public pure returns (string memory) {
		bytes32 hash = keccak256(abi.encodePacked(tokenId));
		bytes memory hashBytes = abi.encodePacked(hash);
		string memory color = string(
			abi.encodePacked(
				_toHexChar(uint8(hashBytes[0]) >> 4),
				_toHexChar(uint8(hashBytes[0]) & 0x0f),
				_toHexChar(uint8(hashBytes[1]) >> 4),
				_toHexChar(uint8(hashBytes[1]) & 0x0f),
				_toHexChar(uint8(hashBytes[2]) >> 4),
				_toHexChar(uint8(hashBytes[2]) & 0x0f)
			)
		);
		return color;
	}

	/// @notice Returns the on-chain SVG image for a given token
	function renderSVG(uint256 tokenId) public pure returns (string memory) {
		string memory color = generateColor(tokenId);
		return string(
			abi.encodePacked(
				'<svg xmlns="http://www.w3.org/2000/svg" width="350" height="350">'
				'<rect width="350" height="350" fill="#',
				color,
				'" rx="20" ry="20"/>'
				'<text x="175" y="160" font-family="Arial,sans-serif" font-size="24" fill="white" '
				'text-anchor="middle" dominant-baseline="middle" font-weight="bold">COOL #',
				tokenId.toString(),
				"</text>"
				'<text x="175" y="200" font-family="Arial,sans-serif" font-size="16" fill="white" '
				'text-anchor="middle" dominant-baseline="middle">#',
				color,
				"</text>"
				"</svg>"
			)
		);
	}

	/// @notice Returns the full on-chain metadata JSON (base64-encoded data URI)
	function tokenURI(uint256 tokenId) public view override(ERC721) returns (string memory) {
		_requireOwned(tokenId);

		string memory svg = renderSVG(tokenId);
		string memory color = generateColor(tokenId);

		string memory json = string(
			abi.encodePacked(
				'{"name":"COOL #',
				tokenId.toString(),
				'","description":"A CoolNFT with a unique on-chain color.","image":"data:image/svg+xml;base64,',
				Base64.encode(bytes(svg)),
				'","attributes":[{"trait_type":"Color","value":"#',
				color,
				'"}]}'
			)
		);

		return string(abi.encodePacked("data:application/json;base64,", Base64.encode(bytes(json))));
	}

	/// @notice Owner can withdraw collected ETH
	function withdraw() public onlyOwner {
		(bool success, ) = owner().call{value: address(this).balance}("");
		require(success, "Withdraw failed");
	}

	/// @dev Convert a nibble (0-15) to its hex character
	function _toHexChar(uint8 value) internal pure returns (bytes1) {
		if (value < 10) {
			return bytes1(value + 0x30); // '0'-'9'
		} else {
			return bytes1(value + 0x57); // 'a'-'f'
		}
	}

	/// @notice Allow the contract to receive ETH
	receive() external payable {}
}
