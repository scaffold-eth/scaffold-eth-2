import { useEffect, useState } from "react";
import { AbiFunction, AbiParameter, ExtractAbiFunctionNames } from "abitype";
import { TransactionReceipt } from "viem";
import { useNetwork, useWaitForTransaction } from "wagmi";
import {
  ContractInput,
  EtherInput,
  TxReceipt,
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
} from "~~/components/scaffold-eth";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";
import { ContractAbi, ContractName, WriteAbiStateMutability } from "~~/utils/scaffold-eth/contract";

// TODO: WIP - Fix this Properly
type WriteOnlyFunctionFormProps = {
  abiFunction: AbiFunction;
  contractName: ContractName;
  functionName: ExtractAbiFunctionNames<ContractAbi<ContractName>, WriteAbiStateMutability>;
  inputs: readonly AbiParameter[];
  isPayable: boolean;
  onChange: () => void;
};

export const WriteOnlyFunctionForm = ({
  abiFunction,
  contractName,
  functionName,
  inputs,
  isPayable,
  onChange,
}: WriteOnlyFunctionFormProps) => {
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(abiFunction));
  const [txValue, setTxValue] = useState<string>("");
  const { chain } = useNetwork();
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;

  const {
    data: result,
    isLoading,
    writeAsync,
  } = useScaffoldContractWrite({
    contractName,
    functionName,
    args: getParsedContractFunctionArgs(form) as any,
    value: txValue as any, // TODO: fix value type
    onBlockConfirmation: () => {
      onChange();
    },
  });

  const [displayedTxResult, setDisplayedTxResult] = useState<TransactionReceipt>();
  const { data: txResult } = useWaitForTransaction({
    hash: result?.hash,
  });
  useEffect(() => {
    setDisplayedTxResult(txResult);
  }, [txResult]);

  // TODO use `useMemo` to optimize also update in ReadOnlyFunctionForm
  const inputElements = inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(functionName, input, inputIndex);
    return (
      <ContractInput
        key={key}
        setForm={updatedFormValue => {
          setDisplayedTxResult(undefined);
          setForm(updatedFormValue);
        }}
        form={form}
        stateObjectKey={key}
        paramType={input}
      />
    );
  });
  const zeroInputs = inputs.length === 0 && !isPayable;

  return (
    <div className="py-5 space-y-3 first:pt-0 last:pb-1">
      <div className={`flex gap-3 ${zeroInputs ? "flex-row justify-between items-center" : "flex-col"}`}>
        <p className="font-medium my-0 break-words">{functionName}</p>
        {inputElements}
        {isPayable ? (
          <EtherInput
            value={txValue}
            onChange={updatedTxValue => {
              setDisplayedTxResult(undefined);
              setTxValue(updatedTxValue);
            }}
            placeholder="value (ether)"
          />
        ) : null}
        <div className="flex justify-between gap-2">
          {!zeroInputs && (
            <div className="flex-grow basis-0">
              {displayedTxResult ? <TxReceipt txResult={displayedTxResult} /> : null}
            </div>
          )}
          <div
            className={`flex ${
              writeDisabled &&
              "tooltip before:content-[attr(data-tip)] before:right-[-10px] before:left-auto before:transform-none"
            }`}
            data-tip={`${writeDisabled && "Wallet not connected or in the wrong network"}`}
          >
            <button
              className={`btn btn-secondary btn-sm ${isLoading ? "loading" : ""}`}
              disabled={writeDisabled}
              onClick={writeAsync}
            >
              Send 💸
            </button>
          </div>
        </div>
      </div>
      {zeroInputs && txResult ? (
        <div className="flex-grow basis-0">
          <TxReceipt txResult={txResult} />
        </div>
      ) : null}
    </div>
  );
};
