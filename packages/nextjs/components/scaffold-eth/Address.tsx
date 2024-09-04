"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Address as AddressType, getAddress, isAddress } from "viem";
import { hardhat } from "viem/chains";
import { normalize } from "viem/ens";
import { useEnsAvatar, useEnsName } from "wagmi";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";

const CopyIcon = ({ className, address }: { className?: string; address: string }) => {
  const [addressCopied, setAddressCopied] = useState(false);
  return (
    <CopyToClipboard
      text={address}
      onCopy={() => {
        setAddressCopied(true);
        setTimeout(() => {
          setAddressCopied(false);
        }, 800);
      }}
    >
      <button onClick={e => e.stopPropagation()}>
        {addressCopied ? (
          <CheckCircleIcon className={className} aria-hidden="true" />
        ) : (
          <DocumentDuplicateIcon className={className} aria-hidden="true" />
        )}
      </button>
    </CopyToClipboard>
  );
};

type AddressProps = {
  address?: AddressType;
  disableAddressLink?: boolean;
  format?: "short" | "long";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  showBoth?: boolean;
};

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
  xs: "h-[14px] w-[14px]",
  sm: "h-[16px] w-[16px]",
  base: "h-[18px] w-[18px]",
  lg: "h-[20px] w-[20px]",
  xl: "h-[22px] w-[22px]",
  "2xl": "h-[24px] w-[24px]",
  "3xl": "h-[26px] w-[26px]",
};

const getCopyIconSize = (currentSize: keyof typeof copyIconSizeMap) => {
  return copyIconSizeMap[currentSize];
};

const getNextSize = (currentSize: keyof typeof sizeMap, step = 1): keyof typeof sizeMap => {
  const sizes = Object.keys(sizeMap) as Array<keyof typeof sizeMap>;
  const currentIndex = sizes.indexOf(currentSize);
  const nextIndex = Math.min(currentIndex + step, sizes.length - 1);
  return sizes[nextIndex];
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

  const LinkWrapper = ({ children }: { children: React.ReactNode }) => {
    return disableAddressLink ? (
      <>{children}</>
    ) : (
      <Link
        href={blockExplorerAddressLink}
        target={targetNetwork.id === hardhat.id ? undefined : "_blank"}
        rel={targetNetwork.id === hardhat.id ? undefined : "noopener noreferrer"}
      >
        {children}
      </Link>
    );
  };

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
            <LinkWrapper>{ens}</LinkWrapper>
          </span>
          <div className="flex">
            <span className={`ml-1.5 text-${addressSize} font-normal`}>
              <LinkWrapper>{shortAddress}</LinkWrapper>
            </span>
            <CopyIcon
              className={`ml-1 text-sky-600 ${getCopyIconSize(size)} ${getCopyIconSize(size)} cursor-pointer`}
              address={checkSumAddress}
            />
          </div>
        </div>
      ) : (
        <>
          <span className={`ml-1.5 text-${addressSize} font-normal`}>
            <LinkWrapper>{displayAddress}</LinkWrapper>
          </span>
          {!(showBoth && ens) && (
            <CopyIcon address={checkSumAddress} className="ml-1.5 text-sky-600 h-5 w-5 cursor-pointer" />
          )}
        </>
      )}
    </div>
  );
};
