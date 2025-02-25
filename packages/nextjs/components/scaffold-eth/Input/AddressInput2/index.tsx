import { AddressInputPrefix } from "./_components/AddressInputPrefix";
import { AddressInputSuffix } from "./_components/AddressInputSuffix";
import { InputBase2 } from "./_components/InputBase2";
import { useAddressInput } from "./_hooks/useAddressInput";
import { Address } from "viem";
import { CommonInputProps } from "~~/components/scaffold-eth";

/**
 * Address input with ENS name resolution
 */
export const AddressInput2 = ({ value, name, placeholder, onChange, disabled }: CommonInputProps<Address | string>) => {
  const { ensAddress, ensName, ensAvatar, isEnsLoadingAddressOrName, reFocus, isEnsAvatarLoading, enteredEnsName } =
    useAddressInput({
      value,
      onChange,
    });

  return (
    <InputBase2<Address>
      name={name}
      placeholder={placeholder}
      error={ensAddress === null}
      value={value as Address}
      onChange={onChange}
      disabled={isEnsLoadingAddressOrName || disabled}
      reFocus={reFocus}
      prefix={
        <AddressInputPrefix
          ensName={ensName}
          ensAvatar={ensAvatar}
          isEnsAvatarLoading={isEnsAvatarLoading}
          isEnsLoadingAddressOrName={isEnsLoadingAddressOrName}
          enteredEnsName={enteredEnsName}
        />
      }
      suffix={<AddressInputSuffix value={value as Address} />}
    />
  );
};
