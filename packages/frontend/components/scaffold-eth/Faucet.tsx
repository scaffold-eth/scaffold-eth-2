import { ethers } from "ethers";
import React, { useMemo } from "react";
import { chain, useAccount, useNetwork } from "wagmi";
import { getLocalProvider } from "~~/utils";
// todo: Add condition for burner wallet
// todo: Update Comments

/**
  Faucet button which lets you grab 1 eth.
**/

export default function Faucet() {
  const { address } = useAccount();
  const { chain: ConnectedChain } = useNetwork();

  // const provider = useProvider();
  // console.log("⚡️ ~ file: Faucet.tsx ~ line 20 ~ Faucet ~ provider", provider.getSigner());

  // const { config } = usePrepareSendTransaction({
  //   request: { to: address, value: ethers.utils.parseEther("1") },
  // });
  // console.log("⚡️ ~ file: Faucet.tsx ~ line 25 ~ Faucet ~ config", config);

  const provider = useMemo(() => getLocalProvider(chain.localhost), []);

  // const { data, isLoading, isSuccess, sendTransaction } = useSendTransaction(config);
  // console.log("⚡️ ~ file: Faucet.tsx ~ line 24 ~ Faucet ~ data", data);

  // If not on local chain return empty element
  if (ConnectedChain?.id === 31337 && provider) {
    return (
      <button
        className="btn btn-primary"
        onClick={async () => {
          const signer = provider.getSigner();
          await signer.sendTransaction({
            value: ethers.utils.parseEther("1"),
            to: address,
            gasPrice: ethers.utils.parseUnits("4.1", "gwei"),
            gasLimit: ethers.utils.hexlify(120000),
          });
        }}
      >
        Grab 1 eth
      </button>
    );
  } else {
    return <></>;
  }
}
