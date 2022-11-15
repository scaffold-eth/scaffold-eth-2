import { useEffect } from "react";
import { useContractRead, chain } from "wagmi";
import { FarmMainRegularMinStakeABI } from "~~/contracts/farmingContract";
import { useAppStore } from "~~/services/store/store";

// todo remove this, this is until we have contract element

const testChainId = chain.mainnet.id;
// uses app store to create a slice of the contract state
export const useTempTestContract = () => {
  const tempState = useAppStore(state => state.tempSlice.tempState);
  //const setTempState = useAppStore(state => state.tempSlice.setTempState);

  useEffect(() => {
    console.log("test state, in useTempTestContract: " + tempState.tempStuff);
  }, [tempState?.tempStuff]);
  // reads contract state
  const cRead = useContractRead({
    addressOrName: FarmMainRegularMinStakeABI.address,
    contractInterface: FarmMainRegularMinStakeABI.abi,
    functionName: "setups",
    chainId: testChainId,
    watch: true,
    cacheOnBlock: false,
  });
  /*//writes contract state
  const cWrite = useContractWrite({
    mode: "recklesslyUnprepared",
    addressOrName: tempContract.address,
    contractInterface: tempContract.abi,
    functionName: "setPurpose",
    args: "new purpose",
    chainId: testChainId,
  });
  //*/
  //when loading... read state
  useEffect(() => {
    if (cRead.isSuccess) {
      console.log("read contract:  ", cRead.data);
    }
  }, [cRead.data, cRead.isSuccess]);
  /*// on click -> write state
  const onClick = () => {
    console.log("...attempting to write");
    cWrite.write?.();
    setTempState({ tempStuff: "wow i set the state" });
  };
  return { onClick };
    //*/
};
