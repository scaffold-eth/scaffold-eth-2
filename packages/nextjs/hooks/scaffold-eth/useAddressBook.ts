import { useEffect, useMemo, useState } from "react";
import { readContract } from "@wagmi/core";
import { useIsMounted } from "usehooks-ts";
import { Abi } from "viem";
import { useAccount } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";
import { contracts } from "~~/utils/scaffold-eth/contract";

function getContractAddresses(contractsData: ContractsData) {
  return contractsData
    ? Object.entries(contractsData).map(([name, { address }]) => ({ description: `${name} address`, address }))
    : [];
}

function getWalletAddress(address: string) {
  return address ? [{ description: "Connected wallet", address }] : [];
}

async function getContractOwners(contractsData: ContractsData) {
  return Promise.all(
    contractsData
      ? Object.entries(contractsData).map(async ([name, { address, abi }]) => {
          const ownerAddress = await readContract({
            address,
            abi,
            functionName: "owner",
          });
          return {
            description: `${name} owner`,
            address: ownerAddress as string,
          };
        })
      : [],
  );
}

type AddressBookEntry = {
  description: string;
  address: string;
};
type ContractsData = {
  [key: string]: {
    address: string;
    abi: Abi;
  };
};

export const useAddressBook = (): AddressBookEntry[] => {
  const isMounted = useIsMounted();
  const { address } = useAccount();
  const [addressBook, setAddressBook] = useState<AddressBookEntry[]>([]);
  const data = contracts?.[scaffoldConfig.targetNetwork.id]?.[0]?.contracts;
  const contractsData = useMemo(() => data || [], [data]) as ContractsData;

  useEffect(() => {
    async function getAddressBook() {
      if (isMounted() && address && contractsData) {
        const contractOwners = await getContractOwners(contractsData);
        setAddressBook(
          [...getContractAddresses(contractsData), ...getWalletAddress(address), ...contractOwners].sort(
            ({ description: a }, { description: b }) => a.localeCompare(b),
          ),
        );
      }
    }
    getAddressBook();
  }, [isMounted, address, contractsData]);
  return addressBook;
};
