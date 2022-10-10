import { useEffect } from "react";
import { usePrepareContractWrite, useContractWrite, useContractRead } from "wagmi";
import { useBurnerWallet } from "~~/components/hooks/useBurnerWallet";
import { tempContract } from "~~/generated/tempContract";

// todo remove this, this is until we have contract element

const newPurpose = "new puropose j18";

export const useTempTestContract = () => {
  useBurnerWallet();

  const testContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const { config } = usePrepareContractWrite({
    addressOrName: testContractAddress,
    contractInterface: tempContract.abi,
    functionName: "setPurpose",
    args: newPurpose,
  });
  const cw = useContractWrite(config);

  const cr = useContractRead({
    addressOrName: testContractAddress,
    contractInterface: tempContract.abi,
    functionName: "purpose",
  });

  useEffect(() => {
    if (cr.isSuccess) {
      console.log(cr.data);
    }
  }, [cr.status, cw.status]);

  const onClick = () => {
    cw.write?.();
  };
  return { onClick };
};
