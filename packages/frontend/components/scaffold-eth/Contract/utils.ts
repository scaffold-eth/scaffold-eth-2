import { FunctionFragment } from "ethers/lib/utils";
import ContractData from "~~/contracts/hardhat_contracts.json";

type GeneratedContractType = {
  address: string;
  abi: [];
};

// TODO Add checks if the contract is not present at `contracts` directory
/**
 * @param chainId - deployed contract chainId
 * @param contractName - name of deployed contract
 * @returns object containing contract address and abi
 */
function getGeneratedContract(
  chainId: string | undefined,
  contractName: string | undefined | null,
): GeneratedContractType {
  if (!chainId || !contractName) {
    return { address: "", abi: [] };
  }

  const contractsAtChain = ContractData[chainId as keyof typeof ContractData];

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // ! remove hardcoding of index 0
  const contractData: GeneratedContractType = contractsAtChain[0].contracts[contractName];

  return contractData;
}

function isQueryable(fn: FunctionFragment): boolean {
  return (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length === 0;
}

function getAllContractFunctions(contract: any) {
  return contract ? Object.values(contract.interface.functions).filter(fn => fn.type === "function") : [];
}

export { getGeneratedContract, isQueryable, getAllContractFunctions };
