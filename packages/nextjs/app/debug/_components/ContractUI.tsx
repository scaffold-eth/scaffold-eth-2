/**
 * ContractUI
 *
 * Client-side wrapper component for rendering an interactive UI
 * for a deployed smart contract.
 *
 * High-level flow:
 * 1. Receives a contract name as input
 * 2. Determines the currently selected target network
 * 3. Fetches deployed contract metadata (ABI + address) for that network
 * 4. Displays a loading state while contract data is being resolved
 * 5. Renders a generic Contract UI once deployment data is available
 *
 * This component acts as a bridge between network configuration,
 * deployed contract information, and the debug contract interaction UI.
 */
"use client";

// @refresh reset
import { Contract } from "@scaffold-ui/debug-contracts";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { ContractName } from "~~/utils/scaffold-eth/contract";

/**
 * ContractUI
 *
 * Client-side wrapper component for rendering an interactive UI
 * for a deployed smart contract.
 *
 * High-level flow:
 * 1. Receives a contract name as input
 * 2. Determines the currently selected target network
 * 3. Fetches deployed contract metadata (ABI + address) for that network
 * 4. Displays a loading state while contract data is being resolved
 * 5. Renders a generic Contract UI once deployment data is available
 *
 * This component acts as a bridge between network configuration,
 * deployed contract information, and the debug contract interaction UI.
 */

/**
 * ContractUI
 *
 * Client-side wrapper component for rendering an interactive UI
 * for a deployed smart contract.
 *
 * High-level flow:
 * 1. Receives a contract name as input
 * 2. Determines the currently selected target network
 * 3. Fetches deployed contract metadata (ABI + address) for that network
 * 4. Displays a loading state while contract data is being resolved
 * 5. Renders a generic Contract UI once deployment data is available
 *
 * This component acts as a bridge between network configuration,
 * deployed contract information, and the debug contract interaction UI.
 */

/**
 * ContractUI
 *
 * Client-side wrapper component for rendering an interactive UI
 * for a deployed smart contract.
 *
 * High-level flow:
 * 1. Receives a contract name as input
 * 2. Determines the currently selected target network
 * 3. Fetches deployed contract metadata (ABI + address) for that network
 * 4. Displays a loading state while contract data is being resolved
 * 5. Renders a generic Contract UI once deployment data is available
 *
 * This component acts as a bridge between network configuration,
 * deployed contract information, and the debug contract interaction UI.
 */

/**
 * ContractUI
 *
 * Client-side wrapper component for rendering an interactive UI
 * for a deployed smart contract.
 *
 * High-level flow:
 * 1. Receives a contract name as input
 * 2. Determines the currently selected target network
 * 3. Fetches deployed contract metadata (ABI + address) for that network
 * 4. Displays a loading state while contract data is being resolved
 * 5. Renders a generic Contract UI once deployment data is available
 *
 * This component acts as a bridge between network configuration,
 * deployed contract information, and the debug contract interaction UI.
 */

/**
 * ContractUI
 *
 * Client-side wrapper component for rendering an interactive UI
 * for a deployed smart contract.
 *
 * High-level flow:
 * 1. Receives a contract name as input
 * 2. Determines the currently selected target network
 * 3. Fetches deployed contract metadata (ABI + address) for that network
 * 4. Displays a loading state while contract data is being resolved
 * 5. Renders a generic Contract UI once deployment data is available
 *
 * This component acts as a bridge between network configuration,
 * deployed contract information, and the debug contract interaction UI.
 */

/**
 * ContractUI
 *
 * Client-side wrapper component for rendering an interactive UI
 * for a deployed smart contract.
 *
 * High-level flow:
 * 1. Receives a contract name as input
 * 2. Determines the currently selected target network
 * 3. Fetches deployed contract metadata (ABI + address) for that network
 * 4. Displays a loading state while contract data is being resolved
 * 5. Renders a generic Contract UI once deployment data is available
 *
 * This component acts as a bridge between network configuration,
 * deployed contract information, and the debug contract interaction UI.
 */

/**
 * ContractUI
 *
 * Client-side wrapper component for rendering an interactive UI
 * for a deployed smart contract.
 *
 * High-level flow:
 * 1. Receives a contract name as input
 * 2. Determines the currently selected target network
 * 3. Fetches deployed contract metadata (ABI + address) for that network
 * 4. Displays a loading state while contract data is being resolved
 * 5. Renders a generic Contract UI once deployment data is available
 *
 * This component acts as a bridge between network configuration,
 * deployed contract information, and the debug contract interaction UI.
 */

/**
 * ContractUI
 *
 * Client-side wrapper component for rendering an interactive UI
 * for a deployed smart contract.
 *
 * High-level flow:
 * 1. Receives a contract name as input
 * 2. Determines the currently selected target network
 * 3. Fetches deployed contract metadata (ABI + address) for that network
 * 4. Displays a loading state while contract data is being resolved
 * 5. Renders a generic Contract UI once deployment data is available
 *
 * This component acts as a bridge between network configuration,
 * deployed contract information, and the debug contract interaction UI.
 */

/**
 * ContractUI
 *
 * Client-side wrapper component for rendering an interactive UI
 * for a deployed smart contract.
 *
 * High-level flow:
 * 1. Receives a contract name as input
 * 2. Determines the currently selected target network
 * 3. Fetches deployed contract metadata (ABI + address) for that network
 * 4. Displays a loading state while contract data is being resolved
 * 5. Renders a generic Contract UI once deployment data is available
 *
 * This component acts as a bridge between network configuration,
 * deployed contract information, and the debug contract interaction UI.
 */

/**
 * ContractUI
 *
 * Client-side wrapper component for rendering an interactive UI
 * for a deployed smart contract.
 *
 * High-level flow:
 * 1. Receives a contract name as input
 * 2. Determines the currently selected target network
 * 3. Fetches deployed contract metadata (ABI + address) for that network
 * 4. Displays a loading state while contract data is being resolved
 * 5. Renders a generic Contract UI once deployment data is available
 *
 * This component acts as a bridge between network configuration,
 * deployed contract information, and the debug contract interaction UI.
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
