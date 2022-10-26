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

export const DisplayVariable: FC<IDisplayVariableProps> = props => {
  const [variable, setVariable] = useState("");
  // const isMounted = useIsMounted();

  const refresh = useCallback(async () => {
    try {
      if (props.contractFunction) {
        const contractReturnValue = await props.contractFunction();
        setVariable(contractReturnValue);
        props.setTriggerRefresh(false);

        // if (isMounted()) {
        // }
      }
    } catch (e: any) {
      console.log(e?.message);
    }
  }, [props]);

  useEffect((): void => {
    void refresh();
  }, [refresh, props.refreshRequired, props.contractFunction]);

  // TODO add refresh button for each variables
  // TODO fix warning "<div> cannot appear descendant of <p>"(Reason : <Address> component)
  return (
    <div className="border-b-2 border-black space-y-1 pb-2">
      <p className="text-black text-lg">{props.functionInfo.name}</p>
      <p className="text-black font-normal">{tryToDisplay(variable)}</p>
    </div>
  );
};

export default DisplayVariable;
