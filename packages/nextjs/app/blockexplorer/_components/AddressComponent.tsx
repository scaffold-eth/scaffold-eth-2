"use client";

import { BackButton } from "./BackButton";
import { ContractTabs } from "./ContractTabs";
import { Address, Balance } from "@scaffold-ui/components";
import { Address as AddressType } from "viem";
import { hardhat } from "viem/chains";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

export const AddressComponent = ({
  address,
  contractData,
}: {
  address: AddressType;
  contractData: { bytecode: string; assembly: string } | null;
}) => {
  const { targetNetwork } = useTargetNetwork();
  return (
    <div className="m-10 mb-20">
      <div className="flex justify-start mb-5">
        <BackButton />
      </div>
      <div className="col-span-5 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
        <div className="col-span-1 flex flex-col">
          <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-6 lg:px-8 mb-6 space-y-1 py-4 overflow-x-auto">
            <div className="flex">
              <div className="flex flex-col gap-1">
                <Address
                  address={address}
                  format="long"
                  onlyEnsOrAddress
                  blockExplorerAddressLink={
                    targetNetwork.id === hardhat.id ? `/blockexplorer/address/${address}` : undefined
                  }
                />
                <div className="flex gap-1 items-center">
                  <span className="font-bold text-sm">Balance:</span>
                  <Balance address={address} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ContractTabs address={address} contractData={contractData} />
    </div>
  );
};
