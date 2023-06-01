import { useState } from "react";
import { useRouter } from "next/router";
import { ethers } from "ethers";
import { localhost } from "wagmi/chains";
import { getLocalProvider } from "~~/utils/scaffold-eth";

const provider = getLocalProvider(localhost);

export const useSearchHandler = () => {
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

  return {
    handleSearch,
    searchInput,
    setSearchInput,
  };
};
