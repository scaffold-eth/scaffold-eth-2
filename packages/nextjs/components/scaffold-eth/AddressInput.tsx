import { ChangeEvent, useEffect, useState } from "react";
import Blockies from "react-blockies";
import { useEnsAddress } from "wagmi";

type TAddressInputProps = {
  onChange?: (arg: string) => void;
  placeholder?: string;
  name?: string;
  value?: string;
};

// ToDo:  move this function to an utility file
const isENS = (address = "") => address.endsWith(".eth") || address.endsWith(".xyz");

/**
 * Address input with ENS name resolution
 */
const AddressInput = ({ value, name, placeholder, onChange }: TAddressInputProps) => {
  const [address, setAddress] = useState("");
  const [resolvedEns, setResolvedEns] = useState("");

  const isControlledInput = value !== undefined;

  const { data: ensData, isLoading } = useEnsAddress({
    name: address,
    enabled: isENS(address),
    chainId: 1,
    cacheTime: 30_000,
  });

  const onChangeAddress = async (event: ChangeEvent<HTMLInputElement>) => {
    setResolvedEns("");
    setAddress(event.target.value);
    if (onChange) {
      onChange(event.target.value);
    }
  };

  useEffect(() => {
    if (!ensData) return;

    // ENS resolved successfully
    setResolvedEns(address);
    setAddress(ensData);
    if (onChange) {
      onChange(ensData);
    }
    // We don't want to run it on address change
    // eslint-disable-next-line
  }, [ensData, onChange]);

  return (
    <>
      <div className="form-control grow">
        <label className="input-group">
          {resolvedEns && <span className="text-accent">{resolvedEns}</span>}
          <input
            name={name}
            type="text"
            placeholder={placeholder}
            className={`input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] border w-full font-medium placeholder:text-accent/50 text-gray-400 grow ${
              ensData === null ? "input-error" : ""
            }`}
            value={isControlledInput ? value : address || ""}
            onChange={onChangeAddress}
            disabled={isLoading}
          />
          <span className="p-0 bg-base-100">
            <Blockies className="!rounded-full" seed={address?.toLowerCase() as string} size={7} scale={5} />
          </span>
        </label>
      </div>
    </>
  );
};

export default AddressInput;
