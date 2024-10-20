"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";
// import { getUserNFTs, mintNFT } from "~~/utils/scaffold-eth/contractFunctions";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { addToIPFS } from "~~/utils/simpleNFT/ipfs-fetch";
import nftsMetadata from "~~/utils/simpleNFT/nftsMetadata";
import { MyHoldings } from "./_components";

const Collection: NextPage = () => {
  const { address: connectedAddress, isConnected, isConnecting } = useAccount();

  const { writeContractAsync } = useScaffoldWriteContract("YourCollectible");

  const { data: tokenIdCounter } = useScaffoldReadContract({
    contractName: "YourCollectible",
    functionName: "tokenIdCounter",
    watch: true,
  } as any);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    url: "",
    name: "",
    description: "",
    cost: "",
  });
  const [poem, setPoem] = useState("");
  const [userNFTs, setUserNFTs] = useState([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const fetchNFTs = async () => {
      // const nfts = await getUserNFTs();
      const nfts = [];
      setUserNFTs(nfts);
    };
    fetchNFTs();
  }, []);

  const generatePoem = async () => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // messages: [{ role: "user", content: message }],
        messages: [{ role: "user", content: `Create a poem about ${formData.name}: ${formData.description} , and limit it to 50 words or less` }],
      }),
    });
    const data = await res.json();
    console.log(data);
    // setResponse(data.content);
    // setMessage("");
    setPoem(data.content);
  };


  const mint = async () => {
    setShowModal(false);

    // Ensure tokenIdCounter is defined
    if (tokenIdCounter === undefined) return;

    const tokenIdCounterNumber = Number(tokenIdCounter);
    // Get the current NFT metadata
    const currentTokenMetaData = nftsMetadata[tokenIdCounterNumber % nftsMetadata.length];

    // Prepare the updated metadata using the form data
    const updatedMetaData = {
      ...currentTokenMetaData,
      name: formData.name, // Use input form's name
      description: formData.description, // Use input form's description
      image: formData.url, // Use input form's URL
    };
    // updatedMetaData.attributes.push({
    //   trait_type: "Poem",
    //   value: poem,
    // });

    const notificationId = notification.loading("Uploading to IPFS");
    try {
      const uploadedItem = await addToIPFS(updatedMetaData);

      // Remove previous loading notification and show success notification
      notification.remove(notificationId);
      notification.success("Metadata uploaded to IPFS");

      // Call the mintItem function on the smart contract
      await writeContractAsync({
        functionName: "mintItem",
        args: [connectedAddress, uploadedItem.path],
      });

      // Optional: Fetch user NFTs again after minting
      // const nfts = await getUserNFTs();
      // setUserNFTs(nfts);

    } catch (error) {
      notification.remove(notificationId);
      console.error(error);
    }
  };

  return (
    <>
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">My Prints</h1>
        <p className="text-neutral">All of your NFT collections are displayed below</p>
      </div>

      <div className="text-center mt-8">
        <button className="bg-blue-500 text-white py-2 px-4 rounded" onClick={() => setShowModal(true)}>
          +
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
          <div className="modal-box bg-white p-6 rounded shadow-lg">
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">URL:</label>
                <input
                  type="text"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Description:</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Cost (ETH):</label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <button type="button" onClick={generatePoem} className="bg-gray-500 text-white py-2 px-4 rounded">
                Generate Poem
              </button>

              {poem && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <h3 className="text-lg font-semibold text-black">Generated Poem:</h3>
                  <p className="text-black italic">{poem}</p>
                </div>
              )}

              <div className="mt-6">
                <button type="button" onClick={mint} className="bg-green-500 text-white py-2 px-4 rounded">
                  Mint NFT
                </button>
              </div>
            </form>

            <button onClick={() => setShowModal(false)} className="mt-4 bg-red-500 text-white py-2 px-4 rounded">
              Close
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
        {userNFTs.map((nft, index) => (
          <div key={index} className="nft-card bg-white shadow-md rounded p-4">
            <Image src={nft.url} alt={nft.name} width={300} height={300} className="rounded" />
            <h3 className="text-lg font-bold mt-2">{nft.name}</h3>
            <p>{nft.description}</p>
            <p>Price: {nft.cost} ETH</p>
          </div>
        ))}
      </div>
      <MyHoldings />
    </>
  );
};

export default Collection;
