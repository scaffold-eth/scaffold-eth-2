import { useCallback, useEffect, useState } from "react";
import { blo } from "blo";
import { useDebounce } from "usehooks-ts";
import { Address, isAddress } from "viem";
import { useEnsAddress, useEnsAvatar, useEnsName } from "wagmi";
import { CommonInputProps, InputBase, isENS } from "~~/components/scaffold-eth";

/**
 * Address input with ENS name resolution
 */
export const AddressInput = ({ value, name, placeholder, onChange, disabled }: CommonInputProps<Address | string>) => {
  // Debounce the input to keep clean RPC calls when resolving ENS names
  // If the input is an address, we don't need to debounce it
  const _debouncedValue = useDebounce(value, 500);
  const debouncedValue = isAddress(value) ? value : _debouncedValue;
  const isDebouncedValueLive = debouncedValue === value;

  // If the user changes the input after an ENS name is already resolved, we want to remove the stale result
  const settledValue = isDebouncedValueLive ? debouncedValue : undefined;

  const { data: ensAddress, isLoading: isEnsAddressLoading } = useEnsAddress({
    name: settledValue,
    enabled: isENS(debouncedValue),
    chainId: 1,
    cacheTime: 30_000,
  });

  const [enteredEnsName, setEnteredEnsName] = useState<string>();
  const { data: ensName, isLoading: isEnsNameLoading } = useEnsName({
    address: settledValue,
    enabled: isAddress(debouncedValue),
    chainId: 1,
    cacheTime: 30_000,
  });

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName,
    enabled: Boolean(ensName),
    chainId: 1,
    cacheTime: 30_000,
  });

  // ens => address
  useEffect(() => {
    if (!ensAddress) return;

    // ENS resolved successfully
    setEnteredEnsName(debouncedValue);
    onChange(ensAddress);
  }, [ensAddress, onChange, debouncedValue]);

  const handleChange = useCallback(
    (newValue: Address) => {
      setEnteredEnsName(undefined);
      onChange(newValue);
    },
    [onChange],
  );

  return (
    <InputBase<Address>
      name={name}
      placeholder={placeholder}
      error={ensAddress === null}
      value={value}
      onChange={handleChange}
      disabled={isEnsAddressLoading || isEnsNameLoading || disabled}
      prefix={
        ensName && (
          <div className="flex bg-base-300 rounded-l-full items-center">
            {ensAvatar ? (
              <span className="w-[35px]">
                {
                  // eslint-disable-next-line
                  <img className="w-full rounded-full" src={ensAvatar} alt={`${ensAddress} avatar`} />
                }
              </span>
            ) : null}
            <span className="text-accent px-2">{enteredEnsName ?? ensName}</span>
          </div>
        )
      }
      suffix={
        // Don't want to use nextJS Image here (and adding remote patterns for the URL)
        // eslint-disable-next-line @next/next/no-img-element
        value && <img alt="" className="!rounded-full" src={blo(value as `0x${string}`)} width="35" height="35" />
      }
    />
  );
};
