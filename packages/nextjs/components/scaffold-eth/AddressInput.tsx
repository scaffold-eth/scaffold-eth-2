import { ChangeEvent, useState } from "react";
import Blockies from "react-blockies";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import { isAddress } from "ethers/lib/utils";

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
  // Controlled vs Uncontrolled input.
  const currentValue = value !== undefined ? value : address || "";

  const isEns = isENS(currentValue);

  const { data: ensAddress, isLoading: isEnsAddressLoading } = useEnsAddress({
    name: currentValue,
    enabled: isEns,
    chainId: 1,
    cacheTime: 30_000,
  });

  const { data: ensName, isLoading: isEnsNameLoading } = useEnsName({
    address: currentValue,
    enabled: isAddress(address) && !isEns,
    chainId: 1,
    cacheTime: 30_000,
  });

  const { data: ensAvatar } = useEnsAvatar({
    address: ensAddress || currentValue,
    enabled: !!ensAddress || isAddress(currentValue),
    chainId: 1,
    cacheTime: 30_000,
  });

  const isLoading = isEnsAddressLoading || isEnsNameLoading;

  const isEnsValid = !isLoading && ((isEns && ensAddress !== null) || (currentValue && ensName));

  // since it could be lots of ENSs for one address, we show ENS entered by user
  const visibleEnsAddress = isEns ? currentValue : ensName;

  const onChangeAddress = async (event: ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value);
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <div className="rounded-full border-2 border-base-300">
      <div className="form-control grow">
        <div className="flex w-full">
          {isEnsValid && (
            <div className="flex bg-secondary rounded-l-full items-center">
              <span className={ensAvatar ? "w-[35px]" : ""}>
                {/* Don't want to use nextJS Image here (and adding remote patterns for the URL) */}
                {/* eslint-disable-next-line  */}
                {ensAvatar && <img className="w-full rounded-full" src={ensAvatar} alt={`${ensAddress} avatar`} />}
              </span>
              <span className="text-accent px-2">{visibleEnsAddress}</span>
            </div>
          )}
          <input
            name={name}
            type="text"
            placeholder={placeholder}
            className={`input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] border w-full font-medium placeholder:text-accent/50 text-gray-400 grow ${
              ensAddress === null ? "input-error" : ""
            }`}
            value={ensAddress || currentValue}
            onChange={onChangeAddress}
            disabled={isEnsAddressLoading}
          />
          {currentValue && (
            <span className="p-0 bg-base-100">
              <Blockies className="!rounded-full" seed={currentValue?.toLowerCase() as string} size={7} scale={5} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressInput;
