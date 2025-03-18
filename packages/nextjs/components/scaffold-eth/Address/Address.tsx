"use client";

import { AddressCopyIcon } from "./AddressCopyIcon";
import { AddressLinkWrapper } from "./AddressLinkWrapper";
import { Address as AddressType } from "viem";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { AddressSize, blockieSizeMap, copyIconSizeMap, textSizeMap, useAddress } from "~~/hooks/scaffold-eth";

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
  format,
  size = "base",
  onlyEnsOrAddress = false,
}: AddressProps) => {
  const {
    checkSumAddress,
    ens,
    ensAvatar,
    isEnsNameLoading,
    displayAddress,
    displayEnsOrAddress,
    showSkeleton,
    addressSize,
    ensSize,
    blockieSize,
    blockExplorerAddressLink,
    isValidAddress,
  } = useAddress({
    address,
    format,
    size,
    onlyEnsOrAddress,
  });

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
