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
  renderOrder?: ("blockie" | "address" | "copy")[];
};

const blockieSizeMap = {
  xs: 6,
  sm: 7,
  base: 8,
  lg: 9,
  xl: 10,
  "2xl": 12,
  "3xl": 15,
};

export const ScaffoldAddress = ({
  address,
  disableAddressLink,
  format,
  size = "base",
  renderOrder = ["blockie", "address", "copy"],
}: ScaffoldAddressProps) => {
  const wrapperClassName = "flex items-center";
  const textClassName = `ml-1.5 text-${size} font-normal`;
  const duplicateIconSize = 5;

  const blockieSize = (blockieSizeMap[size] * 24) / blockieSizeMap["base"];
  // const renderOrder: any[] = ["blockie", "address", "copy"];

  return (
    <BaseAddress
      address={address}
      disableAddressLink={disableAddressLink}
      format={format}
      blockieSize={blockieSize}
      textClassName={textClassName}
      wrapperClassName={wrapperClassName}
      duplicateIconSize={duplicateIconSize}
      renderOrder={renderOrder}
    />
  );
};
