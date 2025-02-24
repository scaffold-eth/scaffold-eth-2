import { ComponentType, ReactNode } from "react";
import { AddressInputPrefix } from "./_components/AddressInputPrefix";
import { AddressInputSuffix } from "./_components/AddressInputSuffix";
import { InputBase2 } from "./_components/InputBase2";
import { useAddressInput } from "./_hooks/useAddressInput";
import { Address } from "viem";
import { CommonInputProps } from "~~/components/scaffold-eth";

type InputBaseProps<T> = CommonInputProps<T> & {
  error?: boolean;
  reFocus?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
};

type InputPrefixComponentProps = {
  ensName?: string | null;
  ensAvatar?: string | null;
  isEnsAvatarLoading: boolean;
  isEnsLoadingAddressOrName: boolean;
  enteredEnsName?: string;
  ensAddress?: Address;
};

type InputSuffixComponentProps = {
  value: Address;
};

type AddressInput2Props = CommonInputProps<Address | string> & {
  InputComponent?: ComponentType<InputBaseProps<Address>>;
  InputPrefixComponent?: ComponentType<InputPrefixComponentProps>;
  InputSuffixComponent?: ComponentType<InputSuffixComponentProps>;
};

/**
 * Address input with ENS name resolution
 */
export const AddressInput2 = ({
  value,
  name,
  placeholder,
  onChange,
  disabled,
  InputComponent = InputBase2,
  InputPrefixComponent = AddressInputPrefix,
  InputSuffixComponent = AddressInputSuffix,
}: AddressInput2Props) => {
  const { ensAddress, ensName, ensAvatar, isEnsLoadingAddressOrName, reFocus, isEnsAvatarLoading, enteredEnsName } =
    useAddressInput({
      value,
      onChange,
    });

  return (
    <InputComponent
      name={name}
      placeholder={placeholder}
      error={ensAddress === null}
      value={value as Address}
      onChange={onChange}
      disabled={isEnsLoadingAddressOrName || disabled}
      reFocus={reFocus}
      prefix={
        <InputPrefixComponent
          ensName={ensName}
          ensAvatar={ensAvatar}
          isEnsAvatarLoading={isEnsAvatarLoading}
          isEnsLoadingAddressOrName={isEnsLoadingAddressOrName}
          enteredEnsName={enteredEnsName}
        />
      }
      suffix={<InputSuffixComponent value={value as Address} />}
    />
  );
};
