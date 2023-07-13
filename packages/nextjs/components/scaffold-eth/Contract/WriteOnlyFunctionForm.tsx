import { useEffect, useState } from "react";
import { Abi, AbiFunction } from "abitype";
import { Address, TransactionReceipt } from "viem";
import { useContractWrite, useNetwork, useWaitForTransaction } from "wagmi";
import {
  ContractInput,
  IntegerInput,
  TxReceipt,
  getFunctionInputKey,
  getInitialFormState,
  getParsedContractFunctionArgs,
  getParsedError,
} from "~~/components/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { getTargetNetwork, notification } from "~~/utils/scaffold-eth";

type WriteOnlyFunctionFormProps = {
  abiFunction: AbiFunction;
  onChange: () => void;
  contractAddress: Address;
};

export const WriteOnlyFunctionForm = ({ abiFunction, onChange, contractAddress }: WriteOnlyFunctionFormProps) => {
  const [form, setForm] = useState<Record<string, any>>(() => getInitialFormState(abiFunction));
  const [txValue, setTxValue] = useState<string | bigint>("");
  const { chain } = useNetwork();
  const writeTxn = useTransactor();
  const writeDisabled = !chain || chain?.id !== getTargetNetwork().id;

  const {
    data: result,
    isLoading,
    writeAsync,
  } = useContractWrite({
    chainId: getTargetNetwork().id,
    address: contractAddress,
    functionName: abiFunction.name,
    abi: [abiFunction] as Abi,
    args: getParsedContractFunctionArgs(form),
  });

  const handleWrite = async () => {
    if (writeAsync) {
      try {
        const makeWriteWithParams = () => writeAsync({ value: BigInt(txValue) });
        await writeTxn(makeWriteWithParams);
        onChange();
      } catch (e: any) {
        const message = getParsedError(e);
        notification.error(message);
      }
    }
  };

  const [displayedTxResult, setDisplayedTxResult] = useState<TransactionReceipt>();
  const { data: txResult } = useWaitForTransaction({
    hash: result?.hash,
  });
  useEffect(() => {
    setDisplayedTxResult(txResult);
  }, [txResult]);

  // TODO use `useMemo` to optimize also update in ReadOnlyFunctionForm
  const inputs = abiFunction.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
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
  const zeroInputs = inputs.length === 0 && abiFunction.stateMutability !== "payable";

  return (
    <div className="py-5 space-y-3 first:pt-0 last:pb-1">
      <div className={`flex gap-3 ${zeroInputs ? "flex-row justify-between items-center" : "flex-col"}`}>
        <p className="font-medium my-0 break-words">{abiFunction.name}</p>
        {inputs}
        {abiFunction.stateMutability === "payable" ? (
          <IntegerInput
            value={txValue}
            onChange={updatedTxValue => {
              setDisplayedTxResult(undefined);
              setTxValue(updatedTxValue);
            }}
            placeholder="value (wei)"
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
              onClick={handleWrite}
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
