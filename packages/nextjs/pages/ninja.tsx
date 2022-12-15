import type { NextPage } from "next";
import { NContractUI } from "~~/components/scaffold-eth";
import { useState } from "react";
import { ethers } from "ethers";
import { useNetwork, useSwitchNetwork } from "wagmi";

const ESKey = process.env.NEXT_PUBLIC_ETHERSCAN_KEY;

const Ninja: NextPage = () => {
  const { switchNetwork, isLoading } = useSwitchNetwork();
  const { chain } = useNetwork();
  const [ABI, setABI] = useState();
  const [Address, setAddress] = useState("");
  const [uiAddress, uiSetAddress] = useState("");
  const [isDisabled, setDisabled] = useState(true);
  const [fReq, setFail] = useState(false);

  const changeNetwork = () => {
    if (switchNetwork && chain && chain.id != 1) {
      switchNetwork(1);
    }
  };

  const verifyAddress = (address: string) => {
    uiSetAddress(address);
    const verifyA = ethers.utils.isAddress(address);

    if (!verifyA) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  };

  const fetchABI = async (address: string) => {
    console.log("chain: ", chain);
    const res = await fetch(
      `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${ESKey}`,
      {
        method: "GET",
        mode: "cors",
      },
    );

    const data = await res.json();
    if (data.status == "0") {
      setFail(true);
      return;
    }

    setFail(false);

    const abi = JSON.parse(data.result);

    setABI(abi);
    setAddress(address);

    return abi;
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-center text-2xl my-4">Ninja: Interact with a contract on Ethereum</h1>
      <p className="text-center mx-2">
        Note: If your target contract is a proxy, please input the implementation address
      </p>
      <input
        placeholder="Address"
        autoComplete="off"
        className="text-center text-md input input-bordered mt-4 w-1/2"
        type="text"
        value={uiAddress}
        onChange={e => verifyAddress(e.target.value)}
      />
      {chain && chain.id == 1 ? (
        <button disabled={isDisabled} className="btn btn-primary btn-sm my-4" onClick={() => fetchABI(uiAddress)}>
          Submit
        </button>
      ) : (
        <button disabled={isLoading} className="btn btn-primary btn-sm my-4" onClick={() => changeNetwork()}>
          Switch Network
        </button>
      )}

      {fReq ? (
        <strong className="font-bold text-red-600 mb-4">Error fetching ABI, is this a contract address?</strong>
      ) : (
        <></>
      )}

      {ABI && Address ? <NContractUI _address={Address} _abi={ABI} /> : <div></div>}
    </div>
  );
};

export default Ninja;
