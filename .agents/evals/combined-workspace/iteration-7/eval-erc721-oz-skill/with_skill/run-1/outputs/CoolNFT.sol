// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/// @title CoolNFT - An on-chain SVG NFT collection with unique colors per token
/// @notice Each NFT has a unique color derived from its token ID, with on-chain SVG metadata
contract CoolNFT is ERC721Enumerable, Ownable {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = 100;
    uint256 public constant MINT_PRICE = 0.01 ether;

    uint256 public tokenIdCounter;

    event Minted(address indexed minter, uint256 tokenId);

    constructor(address initialOwner) ERC721("CoolNFT", "COOL") Ownable(initialOwner) {}

    /// @notice Mint a new CoolNFT by paying the mint price
    function mintItem() public payable returns (uint256) {
        require(msg.value >= MINT_PRICE, "Not enough ETH sent");
        require(tokenIdCounter < MAX_SUPPLY, "Max supply reached");

        tokenIdCounter++;
        uint256 newTokenId = tokenIdCounter;

        _safeMint(msg.sender, newTokenId);

        emit Minted(msg.sender, newTokenId);

        return newTokenId;
    }

    /// @notice Generate a unique color from a token ID using a hash
    function generateColor(uint256 tokenId) public pure returns (string memory) {
        bytes32 hash = keccak256(abi.encodePacked(tokenId));
        bytes memory hexColor = new bytes(6);
        bytes memory hexChars = "0123456789abcdef";
        for (uint256 i = 0; i < 6; i++) {
            hexColor[i] = hexChars[uint8(hash[i]) & 0x0f];
        }
        return string(hexColor);
    }

    /// @notice Generate the SVG image for a given token ID
    function generateSVG(uint256 tokenId) public pure returns (string memory) {
        string memory color = generateColor(tokenId);
        return string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="350" height="350">',
                '<rect width="350" height="350" fill="#',
                color,
                '"/>',
                '<text x="175" y="160" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">CoolNFT</text>',
                '<text x="175" y="200" font-family="Arial" font-size="48" fill="white" text-anchor="middle" dominant-baseline="middle">#',
                tokenId.toString(),
                "</text>",
                '<text x="175" y="240" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">#',
                color,
                "</text>",
                "</svg>"
            )
        );
    }

    /// @notice Returns the on-chain metadata as a base64-encoded JSON data URI
    function tokenURI(uint256 tokenId) public view override(ERC721) returns (string memory) {
        _requireOwned(tokenId);

        string memory svg = generateSVG(tokenId);
        string memory color = generateColor(tokenId);

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "CoolNFT #',
                        tokenId.toString(),
                        '", "description": "A cool on-chain SVG NFT with a unique color.", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(svg)),
                        '", "attributes": [{"trait_type": "Color", "value": "#',
                        color,
                        '"}]}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    /// @notice Allow the owner to withdraw collected ETH
    function withdraw() public onlyOwner {
        (bool success, ) = owner().call{ value: address(this).balance }("");
        require(success, "Withdraw failed");
    }

    /// @dev Required override for ERC721Enumerable
    function supportsInterface(bytes4 interfaceId) public view override(ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
