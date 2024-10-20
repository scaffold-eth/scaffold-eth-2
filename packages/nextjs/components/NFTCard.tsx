import React from "react";

interface NFTCardProps {
  imageUrl: string;
  name: string;
  description: string;
  owner: string;
  tokenId: number;
  onBuy: (tokenId: number) => void;
}

const NFTCard: React.FC<NFTCardProps> = ({ imageUrl, name, description, owner, tokenId, onBuy }) => {
  return (
    <div className="border p-4 bg-white rounded-lg shadow-lg w-full">
      <img src={imageUrl} alt={name} className="w-full h-64 object-cover rounded-md" />
      <h3 className="text-lg font-bold mt-4">{name}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="text-sm mt-2">Owner: {owner}</p>
      <button className="btn btn-secondary mt-4" onClick={() => onBuy(tokenId)}>
        Buy NFT
      </button>
    </div>
  );
};

export default NFTCard;