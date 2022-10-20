import { useEffect } from "react";
import { useContractWrite, useContractRead, chain } from "wagmi";
import { tempContract } from "~~/generated/tempContract";
import { useAppStore } from "~~/services/store/store";

// todo remove this, this is until we have contract element

const testChainId = chain.hardhat.id;

export const useTempTestContract = () => {
  const tempState = useAppStore(state => state.tempState);
  const setTempState = useAppStore(state => state.setTempState);

  console.log(tempState.tempStuff);

  const cRead = useContractRead({
    addressOrName: tempContract.address,
    contractInterface: tempContract.abi,
    functionName: "purpose",
    chainId: testChainId,
    watch: true,
    cacheOnBlock: false,
  });

  const cWrite = useContractWrite({
    mode: "recklesslyUnprepared",
    addressOrName: tempContract.address,
    contractInterface: tempContract.abi,
    functionName: "setPurpose",
    args: "new purpose",
    chainId: testChainId,
  });

  useEffect(() => {
    if (cRead.isSuccess) {
      console.log("read contract:  ", cRead.data);
    }
  }, [cRead.data, cRead.isSuccess]);

  const onClick = () => {
    console.log("...attempting to write");
    cWrite.write?.();
    setTempState({ tempStuff: "wow i set the state" });
  };
  return { onClick };
};
