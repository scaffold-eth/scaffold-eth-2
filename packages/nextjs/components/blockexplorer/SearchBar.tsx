import { useState } from "react";
import { useRouter } from "next/router";
import { isAddress, isHex } from "viem";
import { usePublicClient } from "wagmi";
import { hardhat } from "wagmi/chains";

export const SearchBar = () => {
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();

  const client = usePublicClient({ chainId: hardhat.id });

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isHex(searchInput)) {
      try {
        const tx = await client.getTransaction({ hash: searchInput });
        if (tx) {
          router.push(`/blockexplorer/transaction/${searchInput}`);
          return;
        }
      } catch (error) {
        console.error("Failed to fetch transaction:", error);
      }
    }

    if (isAddress(searchInput)) {
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
