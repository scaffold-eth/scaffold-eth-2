"use client";

import { AddressCopyIcon } from "./AddressCopyIcon";
import { AddressLinkWrapper } from "./AddressLinkWrapper";
import { useAddress } from "@scaffold-ui/hook";
import { Address as AddressType } from "viem";
import { BlockieAvatar } from "~~/components/scaffold-eth";

// Size maps moved from the component
export const textSizeMap = {
  "3xs": "text-[10px]",
  "2xs": "text-[11px]",
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
} as const;

export const blockieSizeMap = {
  "3xs": 4,
  "2xs": 5,
  xs: 6,
  sm: 7,
  base: 8,
  lg: 9,
  xl: 10,
  "2xl": 12,
  "3xl": 15,
  "4xl": 17,
  "5xl": 19,
  "6xl": 21,
  "7xl": 23,
} as const;

export const copyIconSizeMap = {
  "3xs": "h-2.5 w-2.5",
  "2xs": "h-3 w-3",
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  base: "h-[18px] w-[18px]",
  lg: "h-5 w-5",
  xl: "h-[22px] w-[22px]",
  "2xl": "h-6 w-6",
  "3xl": "h-[26px] w-[26px]",
  "4xl": "h-7 w-7",
} as const;

type SizeMap = typeof textSizeMap | typeof blockieSizeMap;

export const getNextSize = <T extends SizeMap>(sizeMap: T, currentSize: keyof T, step = 1): keyof T => {
  const sizes = Object.keys(sizeMap) as Array<keyof T>;
  const currentIndex = sizes.indexOf(currentSize);
  const nextIndex = Math.min(currentIndex + step, sizes.length - 1);
  return sizes[nextIndex];
};

export const getPrevSize = <T extends SizeMap>(sizeMap: T, currentSize: keyof T, step = 1): keyof T => {
  const sizes = Object.keys(sizeMap) as Array<keyof T>;
  const currentIndex = sizes.indexOf(currentSize);
  const prevIndex = Math.max(currentIndex - step, 0);
  return sizes[prevIndex];
};

export type AddressSize = "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";

type AddressProps = {
  address?: AddressType;
  disableAddressLink?: boolean;
  format?: "short" | "long";
  size?: AddressSize;
  onlyEnsOrAddress?: boolean;
};

export const Address = ({
  address,
  disableAddressLink,
  format = "short",
  size = "base",
  onlyEnsOrAddress = false,
}: AddressProps) => {
  const { checkSumAddress, ens, ensAvatar, isEnsNameLoading, blockExplorerAddressLink, isValidAddress, shortAddress } =
    useAddress({
      address,
    });

  // UI-specific logic moved from the hook
  const displayAddress = format === "long" ? address : shortAddress;
  const displayEnsOrAddress = ens || displayAddress;
  const showSkeleton = Boolean(!checkSumAddress || (!onlyEnsOrAddress && (ens || isEnsNameLoading)));
  const addressSize = showSkeleton && !onlyEnsOrAddress ? getPrevSize(textSizeMap, size, 2) : size;
  const ensSize = getNextSize(textSizeMap, addressSize);
  const blockieSize = showSkeleton && !onlyEnsOrAddress ? getNextSize(blockieSizeMap, addressSize, 4) : addressSize;

  if (!checkSumAddress) {
    return (
      <div className="flex items-center">
        <div
          className="flex-shrink-0 skeleton rounded-full"
          style={{
            width: (blockieSizeMap[blockieSize] * 24) / blockieSizeMap["base"],
            height: (blockieSizeMap[blockieSize] * 24) / blockieSizeMap["base"],
          }}
        ></div>
        <div className="flex flex-col space-y-1">
          {!onlyEnsOrAddress && (
            <div className={`ml-1.5 skeleton rounded-lg font-bold ${textSizeMap[ensSize]}`}>
              <span className="invisible">0x1234...56789</span>
            </div>
          )}
          <div className={`ml-1.5 skeleton rounded-lg ${textSizeMap[addressSize]}`}>
            <span className="invisible">0x1234...56789</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidAddress) {
    return <span className="text-error">Wrong address</span>;
  }

  return (
    <div className="flex items-center flex-shrink-0">
      <div className="flex-shrink-0">
        <BlockieAvatar
          address={checkSumAddress}
          ensImage={ensAvatar}
          size={(blockieSizeMap[blockieSize] * 24) / blockieSizeMap["base"]}
        />
      </div>
      <div className="flex flex-col">
        {showSkeleton &&
          (isEnsNameLoading ? (
            <div className={`ml-1.5 skeleton rounded-lg font-bold ${textSizeMap[ensSize]}`}>
              <span className="invisible">{displayAddress}</span>
            </div>
          ) : (
            <span className={`ml-1.5 ${textSizeMap[ensSize]} font-bold`}>
              <AddressLinkWrapper
                disableAddressLink={disableAddressLink}
                blockExplorerAddressLink={blockExplorerAddressLink}
              >
                {ens}
              </AddressLinkWrapper>
            </span>
          ))}
        <div className="flex">
          <span className={`ml-1.5 ${textSizeMap[addressSize]} font-normal`}>
            <AddressLinkWrapper
              disableAddressLink={disableAddressLink}
              blockExplorerAddressLink={blockExplorerAddressLink}
            >
              {onlyEnsOrAddress ? displayEnsOrAddress : displayAddress}
            </AddressLinkWrapper>
          </span>
          <AddressCopyIcon
            className={`ml-1 ${copyIconSizeMap[addressSize]} cursor-pointer`}
            address={checkSumAddress}
          />
        </div>
      </div>
    </div>
  );
};
