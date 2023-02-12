import { ethers } from "ethers";
import React, { useState } from "react";
import { useNetwork } from "wagmi";
import { hardhat, localhost } from "wagmi/chains";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { getLocalProvider, toast } from "~~/utils/scaffold-eth";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import AddressInput from "./AddressInput";
import EtherInput from "./EtherInput";
import { getParsedEthersError } from "./Contract/utilsContract";
import Address from "./Address";
import Balance from "./Balance";

const FAUCET_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

/**
 * Faucet button which lets you grab eth.
 */
export default function Faucet() {
  const { chain: ConnectedChain } = useNetwork();
  const [loading, setLoading] = useState(false);
  const [inputAddress, setInputAddress] = useState("");
  const [sendValue, setSendValue] = useState("");
  const provider = getLocalProvider(localhost);
  const signer = provider?.getSigner();
  const faucetTxn = useTransactor(signer);

  const sendETH = async () => {
    try {
      setLoading(true);
      if (faucetTxn) {
        await faucetTxn({ to: inputAddress, value: ethers.utils.parseEther(sendValue) });
      }
      setLoading(false);
    } catch (error) {
      const parsedError = getParsedEthersError(error);
      console.error("⚡️ ~ file: Faucet.tsx ~ line 26 ~ sendETH ~ error", error);
      toast.error(parsedError);
      setLoading(false);
    }
  };

  // Render only on local chain
  if (!ConnectedChain || ConnectedChain.id !== hardhat.id) {
    return null;
  }

  return (
    <div>
      <label htmlFor="faucet-modal" className="btn btn-primary btn-sm px-2 rounded-full space-x-2">
        {!loading && <BanknotesIcon className="h-4 w-4" />}
        <span>Faucet</span>
      </label>
      <input type="checkbox" id="faucet-modal" className="modal-toggle" />
      <label htmlFor="faucet-modal" className="modal cursor-pointer">
        <label className="modal-box relative">
          {/* dummy input to capture event onclick on modal box */}
          <input className="h-0 w-0 absolute top-0 left-0" />
          <h3 className="text-xl font-bold mb-3">Local Faucet</h3>
          <label htmlFor="faucet-modal" className="btn btn-secondary btn-sm btn-circle absolute right-3 top-3">
            ✕
          </label>
          <div className="space-y-3">
            <div className="grid grid-cols-2">
              <div>
                <p className="my-0 text-lg">Faucet address : </p>
                <Address address={FAUCET_ADDRESS} />
              </div>
              <div>
                <p className="my-0 text-lg ml-3">Faucet balance : </p>
                <Balance address={FAUCET_ADDRESS} />
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <AddressInput placeholder="address" value={inputAddress} onChange={value => setInputAddress(value)} />
              <EtherInput onChange={value => setSendValue(value)} />
              <button
                className={`h-10 btn btn-primary btn-sm px-2 rounded-full space-x-3 ${
                  loading ? "loading before:!w-4 before:!h-4 before:!mx-0" : ""
                }`}
                onClick={sendETH}
                disabled={loading}
              >
                {!loading && <BanknotesIcon className="h-6 w-6" />}
                <span>Send</span>
              </button>
            </div>
          </div>
        </label>
      </label>
    </div>
  );
}
