import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";
import NFTCard from "./NFTCard"; // Import the new NFTCard component

// Replace with your contract's ABI and address
// import NFTContractABI from "../contracts/NFTContract.json";
const NFT_CONTRACT_ADDRESS = "YOUR_NFT_CONTRACT_ADDRESS";

export const metadata = getMetadata({
  title: "Available NFTs",
  description: "Browse and buy available NFTs",
});

const Prints: NextPage = () => {
  const [prints, setPrints] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<string>("");

  
  return (
    <>
      <div className="text-center mt-8 p-10">
        <h1 className="text-4xl my-0">Available Prints</h1>
      </div>
    </>
  );
};

export default Prints;