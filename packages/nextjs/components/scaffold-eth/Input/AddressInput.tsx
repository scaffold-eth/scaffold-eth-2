import { useEffect, useState } from "react";
import Blockies from "react-blockies";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import { isAddress } from "ethers/lib/utils";
import { InputBase } from "./InputBase";
import { CommonInputProps } from "./utils";

// ToDo:  move this function to an utility file
const isENS = (address = "") => address.endsWith(".eth") || address.endsWith(".xyz");

/**
 * Address input with ENS name resolution
 */
export const AddressInput = ({ value, name, placeholder, onChange }: CommonInputProps) => {
  const [address, setAddress] = useState("");
  const [resolvedEns, setResolvedEns] = useState("");

  // Controlled vs Uncontrolled input.
  const currentValue = value !== undefined ? value : address || "";

  const { data: ensAddress, isLoading: isEnsAddressLoading } = useEnsAddress({
    name: address,
    enabled: isENS(address),
    chainId: 1,
    cacheTime: 30_000,
  });

  const { data: ensName, isLoading: isEnsNameLoading } = useEnsName({
    address,
    enabled: isAddress(address),
    chainId: 1,
    cacheTime: 30_000,
  });

  const { data: ensAvatar } = useEnsAvatar({
    address,
    enabled: isAddress(address),
    chainId: 1,
    cacheTime: 30_000,
  });

  const isLoading = isEnsAddressLoading || isEnsNameLoading;

  useEffect(() => {
    // Reset when clearing controlled input
    if (!currentValue) {
      setResolvedEns("");
      setAddress("");
    }
  }, [currentValue]);

  // ens => address
  useEffect(() => {
    if (!ensAddress) return;

    // ENS resolved successfully
    setResolvedEns(address);
    setAddress(ensAddress);
    if (onChange) {
      onChange(ensAddress);
    }
    // We don't want to run it on address change
    // eslint-disable-next-line
  }, [ensAddress, onChange]);

  // address => ens
  useEffect(() => {
    if (!ensName || resolvedEns) return;

    setResolvedEns(ensName);
  }, [ensName, resolvedEns]);

  const handleChange = async (newValue: string) => {
    setResolvedEns("");
    setAddress(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <InputBase
      name={name}
      placeholder={placeholder}
      error={ensAddress === null}
      value={currentValue}
      onChange={handleChange}
      disabled={isLoading}
      prefix={
        resolvedEns && (
          <div className="flex bg-base-300 rounded-l-full items-center">
            {ensAvatar ? (
              <span className="w-[35px]">
                {
                  // eslint-disable-next-line
                  <img className="w-full rounded-full" src={ensAvatar} alt={`${ensAddress} avatar`} />
                }
              </span>
            ) : null}
            <span className="text-accent px-2">{resolvedEns}</span>
          </div>
        )
      }
      suffix={
        address && <Blockies className="!rounded-full" seed={address?.toLowerCase() as string} size={7} scale={5} />
      }
    />
  );
};
