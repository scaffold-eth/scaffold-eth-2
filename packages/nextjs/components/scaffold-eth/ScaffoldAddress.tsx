"use client";

import { Address as AddressType } from "viem";
import { BaseAddress } from "~~/components/scaffold-eth";

/**
 * Displays an address (or ENS) with a Blockie image and option to copy address.
 */

export type ScaffoldAddressProps = {
  address?: AddressType;
  disableAddressLink?: boolean;
  format?: "short" | "long";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
};

export const ScaffoldAddress = ({ address, disableAddressLink, format, size = "base" }: ScaffoldAddressProps) => {
  const wrapperClassName = "flex items-center";
  const textClassName = `ml-1.5 text-${size} font-normal`;
  const duplicateIconSize = 5;

  return (
    <BaseAddress
      address={address}
      disableAddressLink={disableAddressLink}
      format={format}
      blockieSize={size}
      textClassName={textClassName}
      wrapperClassName={wrapperClassName}
      duplicateIconSize={duplicateIconSize}
    />
  );
};
