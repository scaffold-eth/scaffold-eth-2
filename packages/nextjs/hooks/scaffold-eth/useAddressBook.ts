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

async function getContractPublicAddresses(contractsData: ContractsData) {
  if (!contractsData) return [];
  const publicAddresses = [];
  for (const [contractName, { address, abi }] of Object.entries(contractsData)) {
    for (const item of abi) {
      // TODO: multiple outputs
      if (item.type === "function" && item.stateMutability === "view" && item.outputs[0].type === "address") {
        console.log("item", item);
        const outputAddress = await readContract({
          address,
          abi,
          functionName: item.name || "",
        });
        publicAddresses.push({
          description: `${contractName} ${item.name}`,
          address: outputAddress as string,
        });
      }
    }
  }
  return publicAddresses;
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
        const contractPublicAddresses = await getContractPublicAddresses(contractsData);
        setAddressBook(
          [...getContractAddresses(contractsData), ...getWalletAddress(address), ...contractPublicAddresses].sort(
            ({ description: a }, { description: b }) => a.localeCompare(b),
          ),
        );
      }
    }
    getAddressBook();
  }, [isMounted, address, contractsData]);
  return addressBook;
};
