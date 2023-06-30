import { useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import { localhost } from "wagmi/chains";
import { getLocalProvider } from "~~/utils/scaffold-eth";

const provider = getLocalProvider(localhost);
export const SearchBar = () => {
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (ethers.utils.isHexString(searchInput)) {
      try {
        const tx = await provider?.getTransaction(searchInput);
        if (tx) {
          router.push(`/blockexplorer/transaction/${searchInput}`);
          return;
        }
      } catch (error) {
        console.error("Failed to fetch transaction:", error);
      }
    }

    if (ethers.utils.isAddress(searchInput)) {
      router.push(`/blockexplorer/address/${searchInput}`);
      return;
    }
  };

  return (
    <form onSubmit={handleSearch} className="mb-5 flex items-center justify-end space-x-3">
      <input
        className="mr-2 w-full rounded-md border-primary bg-base-100 p-2 text-base-content shadow-md focus:outline-none focus:ring-2 focus:ring-accent md:w-1/2 lg:w-1/3"
        type="text"
        value={searchInput}
        placeholder="Search by hash or address"
        onChange={e => setSearchInput(e.target.value)}
      />
      <button className="btn btn-primary btn-sm" type="submit">
        Search
      </button>
    </form>
  );
};
