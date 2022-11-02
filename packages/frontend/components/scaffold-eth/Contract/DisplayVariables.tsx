import { ContractFunction } from "ethers";
import { FunctionFragment } from "ethers/lib/utils";
import React, { SetStateAction, useCallback, useEffect, useState, Dispatch } from "react";
import { tryToDisplay } from "./displayUtils";

type DisplayVariableProps = {
  contractFunction: ContractFunction | undefined;
  functionInfo: FunctionFragment;
  refreshRequired: boolean;
  setTriggerRefresh: Dispatch<SetStateAction<boolean>>;
};

// TODO Check for the need of useIsMounted

const DisplayVariable = ({
  contractFunction,
  refreshRequired,
  setTriggerRefresh,
  functionInfo,
}: DisplayVariableProps) => {
  const [variable, setVariable] = useState("");

  const refresh = useCallback(async () => {
    try {
      if (contractFunction) {
        const contractReturnValue = await contractFunction();
        setVariable(contractReturnValue);
        setTriggerRefresh(false);
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
      <h3 className="text-black text-lg">{functionInfo.name}</h3>
      <div className="text-black font-normal">
        <span>{tryToDisplay(variable)}</span>
      </div>
    </div>
  );
};

export default DisplayVariable;
