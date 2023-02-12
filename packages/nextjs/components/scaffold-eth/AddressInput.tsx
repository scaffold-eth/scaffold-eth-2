import { ChangeEvent, useEffect, useState } from "react";
import Blockies from "react-blockies";
import { useEnsAddress, useEnsAvatar } from "wagmi";
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
  const [resolvedEns, setResolvedEns] = useState("");

  // Controlled vs Uncontrolled input.
  const currentValue = value !== undefined ? value : address || "";

  const { data: ensData, isLoading } = useEnsAddress({
    name: address,
    enabled: isENS(address),
    chainId: 1,
    cacheTime: 30_000,
  });

  const { data: ensAvatarData } = useEnsAvatar({
    address,
    enabled: isAddress(address),
    chainId: 1,
    cacheTime: 30_000,
  });

  useEffect(() => {
    // Reset when clearing controlled input
    if (!currentValue) {
      setResolvedEns("");
      setAddress("");
    }
  }, [currentValue]);

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

  const onChangeAddress = async (event: ChangeEvent<HTMLInputElement>) => {
    setResolvedEns("");
    setAddress(event.target.value);
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <div className="rounded-full border-2 border-base-300">
      <div className="form-control grow">
        <div className="flex w-full">
          {resolvedEns && (
            <div className="flex bg-secondary rounded-l-full items-center">
              <span className={ensAvatarData ? "w-[35px]" : ""}>
                {/* Don't want to use nextJS Image here (and adding remote patterns for the URL) */}
                {/* eslint-disable-next-line  */}
                {ensAvatarData && <img className="w-full rounded-full" src={ensAvatarData} alt={`${ensData} avatar`} />}
              </span>
              <span className="text-accent px-2">{resolvedEns}</span>
            </div>
          )}
          <input
            name={name}
            type="text"
            placeholder={placeholder}
            className={`input input-ghost focus:outline-none focus:bg-transparent focus:text-gray-400 h-[2.2rem] min-h-[2.2rem] border w-full font-medium placeholder:text-accent/50 text-gray-400 grow ${
              ensData === null ? "input-error" : ""
            }`}
            value={currentValue}
            onChange={onChangeAddress}
            disabled={isLoading}
          />
          {address && (
            <span className="p-0 bg-base-100">
              <Blockies className="!rounded-full" seed={address?.toLowerCase() as string} size={7} scale={5} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressInput;
