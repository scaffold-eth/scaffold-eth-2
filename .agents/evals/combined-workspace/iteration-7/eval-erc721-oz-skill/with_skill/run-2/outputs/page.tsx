"use client";

import { useState } from "react";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const NftCard = ({ tokenId }: { tokenId: bigint }) => {
  const { targetNetwork } = useTargetNetwork();

  const { data: tokenUri } = useScaffoldReadContract({
    contractName: "CoolNFT",
    functionName: "tokenURI",
    args: [tokenId],
  });

  const { data: ownerAddress } = useScaffoldReadContract({
    contractName: "CoolNFT",
    functionName: "ownerOf",
    args: [tokenId],
  });

  // Decode the base64 JSON from the data URI to extract the SVG image
  const metadata = (() => {
    if (!tokenUri) return null;
    try {
      const jsonBase64 = tokenUri.replace("data:application/json;base64,", "");
      const json = atob(jsonBase64);
      return JSON.parse(json);
    } catch {
      return null;
    }
  })();

  const svgDataUri = metadata?.image || "";
  const color = metadata?.attributes?.[0]?.value || "";

  return (
    <div className="card bg-base-100 shadow-xl">
      <figure className="px-4 pt-4">
        {svgDataUri ? (
          <img src={svgDataUri} alt={`COOL #${tokenId.toString()}`} className="rounded-xl w-full" />
        ) : (
          <div className="skeleton h-48 w-full rounded-xl" />
        )}
      </figure>
      <div className="card-body items-center text-center p-4">
        <h2 className="card-title text-lg">COOL #{tokenId.toString()}</h2>
        {color && (
          <div className="badge badge-outline gap-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            {color}
          </div>
        )}
        {ownerAddress && (
          <div className="text-sm">
            <span className="opacity-70">Owner: </span>
            <Address
              address={ownerAddress}
              chain={targetNetwork}
              blockExplorerAddressLink={
                targetNetwork.id === hardhat.id ? `/blockexplorer/address/${ownerAddress}` : undefined
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

const Gallery: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [isMinting, setIsMinting] = useState(false);

  const { data: totalSupply } = useScaffoldReadContract({
    contractName: "CoolNFT",
    functionName: "totalSupply",
  });

  const { data: maxSupply } = useScaffoldReadContract({
    contractName: "CoolNFT",
    functionName: "MAX_SUPPLY",
  });

  const { data: mintPrice } = useScaffoldReadContract({
    contractName: "CoolNFT",
    functionName: "MINT_PRICE",
  });

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "CoolNFT",
  });

  const handleMint = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet");
      return;
    }

    setIsMinting(true);
    try {
      await writeContractAsync({
        functionName: "mintItem",
        value: parseEther("0.01"),
      });
      notification.success("Successfully minted a CoolNFT!");
    } catch (e) {
      console.error("Minting failed:", e);
      notification.error("Minting failed");
    } finally {
      setIsMinting(false);
    }
  };

  const currentSupply = totalSupply ? Number(totalSupply) : 0;
  const max = maxSupply ? Number(maxSupply) : 100;

  // Build array of token IDs from 1 to currentSupply
  const tokenIds = Array.from({ length: currentSupply }, (_, i) => BigInt(i + 1));

  return (
    <div className="flex flex-col items-center pt-10 px-5">
      <h1 className="text-4xl font-bold mb-2">CoolNFT Gallery</h1>
      <p className="text-lg opacity-70 mb-6">On-chain SVG NFTs with unique colors</p>

      {/* Mint Section */}
      <div className="card bg-base-200 shadow-lg w-full max-w-md mb-10">
        <div className="card-body items-center text-center">
          <h2 className="card-title">Mint a CoolNFT</h2>
          <p className="opacity-70">
            {currentSupply} / {max} minted
          </p>
          <progress className="progress progress-primary w-full" value={currentSupply} max={max} />
          <p className="text-sm opacity-60">
            Price: {mintPrice ? (Number(mintPrice) / 1e18).toString() : "0.01"} ETH
          </p>
          <button
            className={`btn btn-primary btn-wide ${isMinting ? "loading" : ""}`}
            onClick={handleMint}
            disabled={isMinting || currentSupply >= max}
          >
            {isMinting ? "Minting..." : currentSupply >= max ? "Sold Out" : "Mint NFT"}
          </button>
        </div>
      </div>

      {/* Gallery */}
      {currentSupply === 0 ? (
        <p className="text-lg opacity-50">No NFTs minted yet. Be the first!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl pb-10">
          {tokenIds.map(tokenId => (
            <NftCard key={tokenId.toString()} tokenId={tokenId} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
