// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.0 <0.9.0;


import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";



contract carbonTrade is ERC721URIStorage, Ownable{

    using Counters for Counters.Counter;
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using Strings for uint256;

      struct CarbonBondMetadata {
        string projectType;
        string description;
        string location;
        string expectedImpact;
        string permissions;
        string endorsements;
        string studies;
        string receipt; // Campo para el recibo o factura
        bytes32 metadataHash; // Hash de los metadatos
    }

    // Mapeo de tokens a sus metadatos
    mapping(uint256 => CarbonBondMetadata) private _tokenMetadata;
    mapping(bytes32 => bool) private _uniqueMetadataHashes;
     
     // Conjuntos para rastrear metadatos únicos
    EnumerableSet.Bytes32Set private _uniqueImages;
    EnumerableSet.Bytes32Set private _uniquePermissions;
    EnumerableSet.Bytes32Set private _uniqueEndorsements;
    EnumerableSet.Bytes32Set private _uniqueStudies;

    Counters.Counter private _tokenCounter;
   
    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {}

   function calculateMetadataHash(
        string memory  projectType,
        string memory expectedImpact,
        string memory permissions,
        string memory endorsements,
        string memory studies,
        string memory receipt
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                   projectType,
                    expectedImpact,
                    permissions,
                    endorsements,
                    studies,
                    receipt
                )
            );
    }



     

 function registerCarbonBond(
        string memory projectType,
        string memory description,
        string memory location,
        string memory expectedImpact,
        string memory permissions,
        string memory endorsements,
        string memory studies,
        string memory receipt,
        string memory tokenURI
    ) external onlyOwner {
        
    

        bytes32 permissionsHash = keccak256(bytes(permissions));
        require(!_uniquePermissions.contains(permissionsHash), "Permissions already registered");
        _uniquePermissions.add(permissionsHash);

        bytes32 endorsementsHash = keccak256(bytes(endorsements));
        require(!_uniqueEndorsements.contains(endorsementsHash), "Endorsements already registered");
        _uniqueEndorsements.add(endorsementsHash);

        bytes32 studiesHash = keccak256(bytes(studies));
        require(!_uniqueStudies.contains(studiesHash), "Studies already registered");
        _uniqueStudies.add(studiesHash);
       
        bytes32 metadataHash = calculateMetadataHash(
            projectType,
            expectedImpact,
            permissions,
            endorsements,
            studies,
            receipt
        );
        
        
        require(!_uniqueMetadataHashes[metadataHash] , "Metadata already registered");
        uint256 tokenId = _tokenCounter.current();
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        CarbonBondMetadata storage metadata = _tokenMetadata[tokenId];
        metadata.projectType = projectType;
        metadata.description = description;
       metadata.location = location;
        metadata.expectedImpact = expectedImpact;
        metadata.permissions = permissions;
        metadata.endorsements = endorsements;
        metadata.studies = studies;
        metadata.receipt = receipt;
        metadata.metadataHash = metadataHash;

        _uniqueMetadataHashes[metadataHash] = true;
        _tokenCounter.increment();
    }
  // Función para quemar un token de bono de carbono
    function burnCarbonBond(uint256 tokenId) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _burn(tokenId);
        delete _tokenMetadata[tokenId];
    }
    
    
    // Función para transferir un token de bono de carbono a otra dirección y registrar un recibo o factura
    function transferCarbonBond(address to, uint256 tokenId, string memory receipt) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not approved or not the owner");
        require(_exists(tokenId), "Token does not exist");
        _safeTransfer(msg.sender, to, tokenId, "");

        // Actualizar el recibo o factura asociado al token
        _tokenMetadata[tokenId].receipt = receipt;
    }


 // Función para obtener los metadatos de un token de bono de carbono
    function getCarbonBondMetadata(uint256 tokenId) external view returns (CarbonBondMetadata memory) {
        require(_exists(tokenId), "Token does not exist");
        return _tokenMetadata[tokenId];
    }

}
