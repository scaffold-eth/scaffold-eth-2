"use client";

import { useEffect, useState } from "react";
import { AddressCopyIcon } from "./AddressCopyIcon";
import { AddressLinkWrapper } from "./AddressLinkWrapper";
import { Address as AddressType, getAddress, isAddress } from "viem";
import { normalize } from "viem/ens";
import { useEnsAvatar, useEnsName } from "wagmi";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

const sizeMap = {
  xs: 0,
  sm: 1,
  base: 2,
  lg: 3,
  xl: 4,
  "2xl": 5,
  "3xl": 6,
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

const copyIconSizeMap = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  base: "h-[18px] w-[18px]",
  lg: "h-5 w-5",
  xl: "h-[22px] w-[22px]",
  "2xl": "h-6 w-6",
  "3xl": "h-[26px] w-[26px]",
};

const getNextSize = (currentSize: keyof typeof sizeMap, step = 1): keyof typeof sizeMap => {
  const sizes = Object.keys(sizeMap) as Array<keyof typeof sizeMap>;
  const currentIndex = sizes.indexOf(currentSize);
  const nextIndex = Math.min(currentIndex + step, sizes.length - 1);
  return sizes[nextIndex];
};

type AddressProps = {
  address?: AddressType;
  disableAddressLink?: boolean;
  format?: "short" | "long";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  showBoth?: boolean;
};

export const Address = ({ address, disableAddressLink, format, size, showBoth = false }: AddressProps) => {
  const [ens, setEns] = useState<string | null>();
  const [ensAvatar, setEnsAvatar] = useState<string | null>();
  const checkSumAddress = address ? getAddress(address) : undefined;

  const { targetNetwork } = useTargetNetwork();

  const { data: fetchedEns } = useEnsName({
    address: checkSumAddress,
    chainId: 1,
    query: {
      enabled: isAddress(checkSumAddress ?? ""),
    },
  });
  const { data: fetchedEnsAvatar } = useEnsAvatar({
    name: fetchedEns ? normalize(fetchedEns) : undefined,
    chainId: 1,
    query: {
      enabled: Boolean(fetchedEns),
      gcTime: 30_000,
    },
  });

  useEffect(() => {
    setEns(fetchedEns);
  }, [fetchedEns]);

  useEffect(() => {
    setEnsAvatar(fetchedEnsAvatar);
  }, [fetchedEnsAvatar]);

  if (!checkSumAddress) {
    return (
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-md bg-slate-300 h-6 w-6"></div>
        <div className="flex items-center space-y-6">
          <div className="h-2 w-28 bg-slate-300 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAddress(checkSumAddress)) {
    return <span className="text-error">Wrong address</span>;
  }

  const blockExplorerAddressLink = getBlockExplorerAddressLink(targetNetwork, checkSumAddress);
  const shortAddress = checkSumAddress?.slice(0, 6) + "..." + checkSumAddress?.slice(-4);
  const displayAddress = ens || (format === "long" ? checkSumAddress : shortAddress);

  size = size ?? (showBoth && ens ? "xs" : "base");
  const addressSize = size;
  const blockieSize = showBoth && ens ? getNextSize(size, 4) : size;
  const ensSize = showBoth && ens ? getNextSize(size) : size;

  return (
    <div className="flex items-center flex-shrink-0">
      <div className="flex-shrink-0">
        <BlockieAvatar
          address={checkSumAddress}
          ensImage={ensAvatar}
          size={(blockieSizeMap[blockieSize] * 24) / blockieSizeMap["base"]}
        />
      </div>
      {showBoth && ens ? (
        <div className="flex flex-col">
          <span className={`ml-1.5 text-${ensSize} font-bold`}>
            <AddressLinkWrapper
              disableAddressLink={disableAddressLink}
              blockExplorerAddressLink={blockExplorerAddressLink}
            >
              {ens}
            </AddressLinkWrapper>
          </span>
          <div className="flex">
            <span className={`ml-1.5 text-${addressSize} font-normal`}>
              <AddressLinkWrapper
                disableAddressLink={disableAddressLink}
                blockExplorerAddressLink={blockExplorerAddressLink}
              >
                {shortAddress}
              </AddressLinkWrapper>
            </span>
            <AddressCopyIcon
              className={`ml-1 text-sky-600 ${copyIconSizeMap[size]} cursor-pointer`}
              address={checkSumAddress}
            />
          </div>
        </div>
      ) : (
        <>
          <span className={`ml-1.5 text-${addressSize} font-normal`}>
            <AddressLinkWrapper
              disableAddressLink={disableAddressLink}
              blockExplorerAddressLink={blockExplorerAddressLink}
            >
              {displayAddress}
            </AddressLinkWrapper>
          </span>
          {!(showBoth && ens) && (
            <AddressCopyIcon address={checkSumAddress} className="ml-1.5 text-sky-600 h-5 w-5 cursor-pointer" />
          )}
        </>
      )}
    </div>
  );
};
