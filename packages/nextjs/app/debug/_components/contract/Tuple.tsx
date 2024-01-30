import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ContractInput } from "./ContractInput";
import { getFunctionInputKey, getInitalTupleFormState } from "./utilsContract";
import { AbiParameter } from "abitype";
import { replacer } from "~~/utils/scaffold-eth/common";

type TupleProps = {
  abiTupleParameter: Extract<AbiParameter, { type: "tuple" | `tuple[${string}]` }>;
  setParentForm: Dispatch<SetStateAction<Record<string, any>>>;
  parentStateObjectKey: string;
  parentForm: Record<string, any> | undefined;
};

export const Tuple = ({ abiTupleParameter, setParentForm, parentStateObjectKey }: TupleProps) => {
  const [form, setForm] = useState<Record<string, any>>(() => getInitalTupleFormState(abiTupleParameter));
  useEffect(() => {
    const values = Object.values(form);
    const argsStruct: Record<string, any> = {};
    abiTupleParameter.components.forEach((component, componentIndex) => {
      argsStruct[component.name || `input_${componentIndex}_`] = values[componentIndex];
    });

    setParentForm(parentForm => ({ ...parentForm, [parentStateObjectKey]: JSON.stringify(argsStruct, replacer) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(form, replacer)]);
  return (
    <div>
      <div className="collapse collapse-arrow">
        <input type="checkbox" className="min-h-fit peer" />
        <div className="collapse-title p-0 min-h-fit peer-checked:mb-2">
          <p className="m-0 p-0">{abiTupleParameter.internalType}</p>
        </div>
        <div className="ml-3 flex-col space-y-2 border-gray-100 border-l-2 pl-2 collapse-content">
          {abiTupleParameter?.components?.map((param, index) => {
            const key = getFunctionInputKey(abiTupleParameter.name || "tuple", param, index);
            return <ContractInput setForm={setForm} form={form} key={key} stateObjectKey={key} paramType={param} />;
          })}
        </div>
      </div>
    </div>
  );
};
