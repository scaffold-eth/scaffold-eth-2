import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ContractInput } from "./ContractInput";
import { getFunctionInputKey, getInitalTupleArrayFormState } from "./utilsContract";
import { AbiParameter } from "abitype";
import { replacer } from "~~/utils/scaffold-eth/common";

type TupleArrayProps = {
  abiTupleParameter: Extract<AbiParameter, { type: "tuple" | `tuple[${string}]` }>;
  setParentForm: Dispatch<SetStateAction<Record<string, any>>>;
  parentStateObjectKey: string;
  parentForm: Record<string, any> | undefined;
};

export const TupleArray = ({ abiTupleParameter, setParentForm, parentStateObjectKey }: TupleArrayProps) => {
  const [form, setForm] = useState<Record<string, any>>(() => getInitalTupleArrayFormState(abiTupleParameter));
  const [additionalInputs, setAdditionalInputs] = useState<Array<typeof abiTupleParameter.components>>([]);

  useEffect(() => {
    // Extract and group fields based on index prefix
    const groupedFields = Object.keys(form).reduce((acc, key) => {
      const [indexPrefix, ...restArray] = key.split("_");
      const componentName = restArray.join("_");
      if (!acc[indexPrefix]) {
        acc[indexPrefix] = {};
      }
      acc[indexPrefix][componentName] = form[key];
      return acc;
    }, {} as Record<string, Record<string, string>>);

    const argsArray: Array<Record<string, any>> = [];

    Object.keys(groupedFields).forEach(key => {
      const currentKeyValues = Object.values(groupedFields[key]);
      const argsStruct: Record<string, any> = {};
      abiTupleParameter.components.forEach((component, componentIndex) => {
        argsStruct[component.name || `input_${componentIndex}_`] = currentKeyValues[componentIndex];
      });
      argsArray.push(argsStruct);
    });

    setParentForm(parentForm => {
      return { ...parentForm, [parentStateObjectKey]: JSON.stringify(argsArray, replacer) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(form, replacer)]);

  const addInput = () => {
    setAdditionalInputs(previousValue => {
      const newAdditionalInputs = [...previousValue, abiTupleParameter.components];

      // Add the new inputs to the form
      setForm(form => {
        const newForm = { ...form };
        abiTupleParameter.components.forEach((component, componentIndex) => {
          console.log("The additionalInputs are", additionalInputs.length);
          const key = getFunctionInputKey(
            `${newAdditionalInputs.length}_${abiTupleParameter.name || "tuple"}`,
            component,
            componentIndex,
          );
          newForm[key] = "";
        });
        return newForm;
      });

      return newAdditionalInputs;
    });
  };

  const removeInput = () => {
    // Remove the last inputs from the form
    setForm(form => {
      const newForm = { ...form };
      abiTupleParameter.components.forEach((component, componentIndex) => {
        const key = getFunctionInputKey(
          `${additionalInputs.length}_${abiTupleParameter.name || "tuple"}`,
          component,
          componentIndex,
        );
        delete newForm[key];
      });
      return newForm;
    });
    setAdditionalInputs(inputs => inputs.slice(0, -1));
  };

  return (
    <div>
      <div className="collapse collapse-arrow">
        <input type="checkbox" className="min-h-fit peer" />
        <div className="collapse-title p-0 min-h-fit peer-checked:mb-2">
          <p className="m-0">{abiTupleParameter.internalType}</p>
        </div>
        <div className="ml-3 flex-col space-y-2 border-gray-100 border-l-2 pl-2 collapse-content">
          {abiTupleParameter?.components?.map((param, index) => {
            const key = getFunctionInputKey("0_" + abiTupleParameter.name || "tuple", param, index);
            return <ContractInput setForm={setForm} form={form} key={key} stateObjectKey={key} paramType={param} />;
          })}
          {additionalInputs.map((additionalInput, additionalIndex) =>
            additionalInput.map((param, index) => {
              const key = getFunctionInputKey(
                `${additionalIndex + 1}_${abiTupleParameter.name || "tuple"}`,
                param,
                index,
              );
              return <ContractInput setForm={setForm} form={form} key={key} stateObjectKey={key} paramType={param} />;
            }),
          )}
          <div className="flex space-x-2">
            <button className="btn btn-sm" onClick={addInput}>
              +
            </button>
            {additionalInputs.length > 0 && (
              <button className="btn btn-sm" onClick={removeInput}>
                -
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
