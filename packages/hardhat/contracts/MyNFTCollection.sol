// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MyNFTCollection is ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    Ownable
{
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mapping from owner address to list of owned NFT IDs
    mapping(address => uint256[]) private _ownedTokens;

    // Event emitted when an NFT is minted
    event NFTMinted(uint256 tokenId, address owner, string tokenURI, uint256 cost);

    constructor() ERC721("MyNFTCollection", "MNFT") {}

    // Function to mint a new NFT
    function mintNFT(string memory tokenURI, uint256 cost) public {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        // Mint the NFT
        _mint(msg.sender, newItemId);

        // Set the token URI (metadata URL)
        _setTokenURI(newItemId, tokenURI);

        // Add the NFT ID to the list of NFTs owned by the user
        _ownedTokens[msg.sender].push(newItemId);

        // Emit event for the frontend to capture
        emit NFTMinted(newItemId, msg.sender, tokenURI, cost);
    }

    // Function to get the NFTs owned by a user
    function getUserNFTs(address user) public view returns (uint256[] memory) {
        return _ownedTokens[user];
    }
}
