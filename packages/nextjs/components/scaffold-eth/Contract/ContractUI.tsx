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
      <div className="mt-14">
        <span className="loading loading-spinner loading-lg"></span>
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
    <>
      <div className={`grid grid-cols-1 lg:grid-cols-6 px-6 lg:px-10 lg:gap-6 w-full max-w-7xl my-0 ${className}`}>
        <div className="col-span-5 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="col-span-1 flex flex-col">
          
                
                <div className="overflow-x-auto">
                
                
                
                
<div className="grid grid-cols-1 divide-y divide-base-300 border border-base-300 mb-8">
  
                
<div className="grid grid-cols-3 lg:grid-cols-1">
    <div className="data-label py-6 col-span-1 p-4 flex items-center lg:pb-0">
    Contract Name:
    </div>
  <code className="data-value col-span-2 p-4 text-lg md:text-sm">
  {contractName}
  </code>
</div>

           
<div className="grid grid-cols-3 lg:grid-cols-1">
    <div className="data-label py-6 col-span-1 flex items-center p-4 lg:pb-0">
    Contract Address:
    </div>
  <code className="data-value col-span-2 p-4 text-lg md:text-sm">
  <Address address={deployedContractData.address} />
  </code>
  </div>
  
             
<div className="grid grid-cols-3 lg:grid-cols-1">
    <div className="data-label py-6 col-span-1 flex items-center p-4 lg:pb-0">
    Contract Balance:
    </div>
  <code className="data-value col-span-2 p-4 text-lg md:text-sm">
  <Balance address={deployedContractData.address} />
  </code>
  </div>

      {targetNetwork && (
<div className="grid grid-cols-3 lg:grid-cols-1">
    <div className="data-label py-6 col-span-1 flex items-center p-4 lg:pb-0">
    Network:
    </div>{" "}
  <code className="data-value col-span-2 p-4 text-lg md:text-sm" style={{ color: networkColor }}>
  {targetNetwork.name}
  </code>
  </div>
  )}
  
  </div>
  
  </div>
  
                  
                    
                  

  
  
                  
<div className="grid grid-cols-1 divide-y divide-base-300 border border-base-300 mb-8">
                
<ContractVariables
                refreshDisplayVariables={refreshDisplayVariables}
                deployedContractData={deployedContractData}
                />
  
  </div>
  
  
                
              
              
              
          
              
          </div>

          <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
            <div className="space-y-4">
            
              <div className="collapse collapse-plus bg-base-200 rounded border-2 border-base-300">
                <input type="checkbox" />
                <div className="collapse-title text-sm flex">Read</div>
                <div className="collapse-content">
                  <div className="p-4 divide-y-2 divide-dashed divide-base-300">
                    <ContractReadMethods deployedContractData={deployedContractData} />
                  </div>
                </div>
              </div>

              <div className="collapse collapse-plus bg-base-200 rounded border-2 border-base-300">
                <input type="checkbox" />
                <div className="collapse-title text-sm flex">Write</div>

                <div className="collapse-content">
                  <div className="p-4 divide-y-2 divide-dashed divide-base-300">
                    <ContractWriteMethods
                      deployedContractData={deployedContractData}
                      onChange={triggerRefreshDisplayVariables}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            
          </div>
        </div>
      </div>
    </>
  );
};
