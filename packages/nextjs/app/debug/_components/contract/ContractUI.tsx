"use client";

// @refresh reset
import { useReducer } from "react";
import { ContractReadMethods } from "./ContractReadMethods";
import { ContractVariables } from "./ContractVariables";
import { ContractWriteMethods } from "./ContractWriteMethods";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useNetworkColor } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { ContractName } from "~~/utils/scaffold-eth/contract";

type ContractUIProps = {
  contractName: ContractName;
  className?: string;
};

/**
 * UI component to interface with deployed contracts.
 **/
export const ContractUI = ({ contractName, className = "" }: ContractUIProps) => {
  const [refreshDisplayVariables, triggerRefreshDisplayVariables] = useReducer(value => !value, false);
  const { targetNetwork } = useTargetNetwork();
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo(contractName);
  const networkColor = useNetworkColor();

  if (deployedContractLoading) {
    return (
      <div className="mt-6 ml-6">
        <span className="loading loading-spinner loading-xs loading-primary"></span>
      </div>
    );
  }

  if (!deployedContractData) {
    return (
      <p className="text-3xl mt-14">
        {`No contract found by the name of "${contractName}" on chain "${targetNetwork.name}"!`}
      </p>
    );
  }

  return (
    <div className={`${className} p-6`}>
      <h1 className="text-xs my-0">Debug Contracts</h1>
      <p className="text-primary mt-6">
        You can debug & interact with your deployed contracts here. Check{" "}
        <code className="bg-base-300 font-bold [word-spacing:-0.5rem] px-1">
          packages / nextjs / app / debug / page.tsx
        </code>{" "}
      </p>
      <div className="flex">
        <div className="divide-y divide-base-300 w-1/2 border border-secondary">
          <div className="p-6  min-w-80 ">
            <p className="my-0 text-xs pb-6">Read</p>
            <ContractReadMethods deployedContractData={deployedContractData} />
          </div>
          <div className="p-6  min-w-80 ">
            <p className="my-0 text-xs pb-6">Write</p>
            <ContractWriteMethods
              deployedContractData={deployedContractData}
              onChange={triggerRefreshDisplayVariables}
            />
          </div>
        </div>

        <div className="min-w-80 pl-6 w-1/2">
          <div className="border border-primary p-6 space-y-6 text-primary">
            <div className="flex flex-col space-y-3">
              <div className="contract-name font-[900] pb-6 text-lg lg:text-2xl">{contractName}</div>
              <Address address={deployedContractData.address} onlyEnsOrAddress />
              <div className="flex gap-1 items-center">
                <span className="font-bold text-sm">Balance:</span>
                <Balance address={deployedContractData.address} className="px-0 h-1.5 min-h-[0.375rem]" />
              </div>
            </div>

            {targetNetwork && (
              <p className="my-0 text-sm">
                <span className="font-bold">Network</span>:{" "}
                <span style={{ color: networkColor }}>{targetNetwork.name}</span>
              </p>
            )}

            <div className="pt-8">
              <ContractVariables
                refreshDisplayVariables={refreshDisplayVariables}
                deployedContractData={deployedContractData}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
