"use client";

// @refresh reset
import { Contract } from "@scaffold-ui/debug-contracts";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { ContractName } from "~~/utils/scaffold-eth/contract";

/**
 * ContractUI
 *
 * Client-side wrapper component that renders an interactive UI
 * for a deployed smart contract.
 *
 * Behavior:
 * - Accepts a contract name as input
 * - Resolves the active target network
 * - Loads deployed contract metadata (ABI and address)
 * - Shows a loading indicator while data is being fetched
 * - Renders a generic contract interaction UI once ready
 *
 * Acts as a bridge between network configuration, deployed
 * contract information, and the debug contract interaction UI.
 */

type ContractUIProps = {
  contractName: ContractName;
  className?: string;
};

/**
 * UI component to interface with deployed contracts.
 **/
export const ContractUI = ({ contractName }: ContractUIProps) => {
  const { targetNetwork } = useTargetNetwork();
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo({ contractName });

  if (deployedContractLoading) {
    return (
      <div className="mt-14">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!deployedContractData) {
    return (
      <p className="text-3xl mt-14">
        No contract found by the name of {contractName} on chain {targetNetwork.name}!
      </p>
    );
  }

  return <Contract contractName={contractName as string} contract={deployedContractData} chainId={targetNetwork.id} />;
};
