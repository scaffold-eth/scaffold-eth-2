import { ContractFunction } from "ethers";
import { FunctionFragment } from "ethers/lib/utils";
import React, { FC, SetStateAction, useCallback, useEffect, useState, Dispatch } from "react";
// import { useIsMounted } from "usehooks-ts";
import { tryToDisplay } from "./displayUtils";

interface IDisplayVariableProps {
  contractFunction: ContractFunction | undefined;
  functionInfo: FunctionFragment;
  refreshRequired: boolean;
  setTriggerRefresh: Dispatch<SetStateAction<boolean>>;
}

// TODO Check for the need of useIsMounted

export const DisplayVariable: FC<IDisplayVariableProps> = ({
  contractFunction,
  refreshRequired,
  setTriggerRefresh,
  functionInfo,
}) => {
  const [variable, setVariable] = useState("");
  // const isMounted = useIsMounted();

  const refresh = useCallback(async () => {
    try {
      if (contractFunction) {
        const contractReturnValue = await contractFunction();
        setVariable(contractReturnValue);
        setTriggerRefresh(false);

        // if (isMounted()) {
        // }
      }
    } catch (e: any) {
      console.log(e?.message);
    }
  }, [contractFunction, setTriggerRefresh]);

  useEffect((): void => {
    void refresh();
  }, [refresh, refreshRequired, contractFunction]);

  // TODO add refresh button for each variables
  // TODO fix warning "<div> cannot appear descendant of <p>"(Reason : <Address> component rendered inside p tag due tryToDisplay func)
  return (
    <div className="border-b-2 border-black space-y-1 pb-2">
      <p className="text-black text-lg">{functionInfo.name}</p>
      <p className="text-black font-normal">{tryToDisplay(variable)}</p>
    </div>
  );
};

export default DisplayVariable;
