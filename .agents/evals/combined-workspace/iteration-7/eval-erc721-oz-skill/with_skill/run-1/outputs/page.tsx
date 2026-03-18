"use client";

import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const NftCard = ({ tokenId }: { tokenId: bigint }) => {
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

  const { data: color } = useScaffoldReadContract({
    contractName: "CoolNFT",
    functionName: "generateColor",
    args: [tokenId],
  });

  // Parse the base64-encoded metadata to extract the SVG image
  const parsedMetadata = (() => {
    if (!tokenUri) return null;
    try {
      const json = atob(tokenUri.replace("data:application/json;base64,", ""));
      return JSON.parse(json);
    } catch {
      return null;
    }
  })();

  return (
    <div className="card bg-base-100 shadow-xl">
      <figure className="px-4 pt-4">
        {parsedMetadata?.image ? (
          <img src={parsedMetadata.image} alt={`CoolNFT #${tokenId.toString()}`} className="rounded-xl w-full" />
        ) : (
          <div className="w-full h-48 bg-base-300 rounded-xl flex items-center justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}
      </figure>
      <div className="card-body items-center text-center p-4">
        <h2 className="card-title">CoolNFT #{tokenId.toString()}</h2>
        {color && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `#${color}` }}></div>
            <span className="text-sm font-mono">#{color}</span>
          </div>
        )}
        {ownerAddress && (
          <div className="text-sm">
            <span className="opacity-70">Owner: </span>
            <Address address={ownerAddress} />
          </div>
        )}
      </div>
    </div>
  );
};

const Gallery: NextPage = () => {
  const { address: connectedAddress } = useAccount();

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

  const { writeContractAsync, isPending } = useScaffoldWriteContract({
    contractName: "CoolNFT",
  });

  const handleMint = async () => {
    try {
      await writeContractAsync({
        functionName: "mintItem",
        value: parseEther("0.01"),
      });
      notification.success("NFT minted successfully!");
    } catch (e) {
      console.error("Error minting NFT:", e);
      notification.error("Minting failed");
    }
  };

  const tokenIds = totalSupply ? Array.from({ length: Number(totalSupply) }, (_, i) => BigInt(i + 1)) : [];

  return (
    <div className="flex flex-col items-center grow pt-10 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">CoolNFT Gallery</h1>
        <p className="text-lg opacity-70">On-chain SVG NFTs with unique colors</p>
      </div>

      <div className="card bg-base-100 shadow-xl mb-10 w-full max-w-md">
        <div className="card-body items-center text-center">
          <h2 className="card-title">Mint a CoolNFT</h2>
          <p className="text-sm opacity-70">
            {totalSupply !== undefined && maxSupply !== undefined
              ? `${totalSupply.toString()} / ${maxSupply.toString()} minted`
              : "Loading..."}
          </p>
          {mintPrice !== undefined && <p className="text-sm opacity-70">Price: 0.01 ETH</p>}
          <button
            className={`btn btn-primary btn-wide ${isPending ? "loading" : ""}`}
            onClick={handleMint}
            disabled={isPending || !connectedAddress}
          >
            {isPending ? (
              <span className="loading loading-spinner"></span>
            ) : connectedAddress ? (
              "Mint NFT"
            ) : (
              "Connect Wallet to Mint"
            )}
          </button>
        </div>
      </div>

      {tokenIds.length > 0 ? (
        <div className="w-full max-w-6xl">
          <h2 className="text-2xl font-bold mb-4 text-center">Minted NFTs ({totalSupply?.toString()})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
            {tokenIds.map(tokenId => (
              <NftCard key={tokenId.toString()} tokenId={tokenId} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl opacity-70">No NFTs minted yet. Be the first!</p>
        </div>
      )}
    </div>
  );
};

export default Gallery;
