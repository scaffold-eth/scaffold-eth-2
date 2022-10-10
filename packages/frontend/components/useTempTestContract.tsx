/* eslint-disable no-unused-vars */
import { useEffect } from "react";
import { usePrepareContractWrite, useContractWrite, useContractRead, chain } from "wagmi";
import { useBurnerWallet } from "~~/components/hooks/useBurnerWallet";
import { tempContract } from "~~/generated/tempContract";

// todo remove this, this is until we have contract element

let inc = 0;
const newPurpose = (): string => {
  inc++;
  return "new puropose " + inc;
};

const testChainId = chain.hardhat.id;

export const useTempTestContract = () => {
  const cRead = useContractRead({
    addressOrName: tempContract.address,
    contractInterface: tempContract.abi,
    functionName: "purpose",
    chainId: testChainId,
    watch: true,
    cacheOnBlock: true,
  });

  const { config } = usePrepareContractWrite({
    addressOrName: tempContract.address,
    contractInterface: tempContract.abi,
    functionName: "setPurpose",
    args: newPurpose(),
    chainId: testChainId,
  });
  const cWrite = useContractWrite(config);

  useEffect(() => {
    if (cRead.isSuccess) {
      console.log("read contract:  ", cRead.data);
    }
  }, [cRead.data, cRead.status]);

  const onClick = () => {
    console.log("...attempting to write");
    cWrite.write?.();
  };
  return { onClick };
};
