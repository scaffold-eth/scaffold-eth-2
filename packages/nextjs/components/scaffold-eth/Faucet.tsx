"use client";

import { useEffect, useState } from "react";
import { Button } from "../Button";
import { Modal } from "../Modal";
import { Address as AddressType, createWalletClient, http, parseEther } from "viem";
import { hardhat } from "viem/chains";
import { useAccount } from "wagmi";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { Loading } from "~~/components/Loading";
import { Address, AddressInput, Balance, EtherInput } from "~~/components/scaffold-eth";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

// Account index to use from generated hardhat accounts.
const FAUCET_ACCOUNT_INDEX = 0;

const localWalletClient = createWalletClient({
  chain: hardhat,
  transport: http(),
});

/**
 * Faucet modal which lets you send ETH to any address.
 */
export const Faucet = () => {
  const [loading, setLoading] = useState(false);
  const [inputAddress, setInputAddress] = useState<AddressType>();
  const [faucetAddress, setFaucetAddress] = useState<AddressType>();
  const [sendValue, setSendValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { chain: ConnectedChain } = useAccount();

  const faucetTxn = useTransactor(localWalletClient);

  useEffect(() => {
    const getFaucetAddress = async () => {
      try {
        const accounts = await localWalletClient.getAddresses();
        setFaucetAddress(accounts[FAUCET_ACCOUNT_INDEX]);
      } catch (error) {
        notification.error(
          <>
            <p className="font-bold mt-0 mb-1">Cannot connect to local provider</p>
            <p className="m-0">
              - Did you forget to run <code className="italic bg-base-300 text-base font-bold">yarn chain</code> ?
            </p>
            <p className="mt-1 break-normal">
              - Or you can change <code className="italic bg-base-300 text-base font-bold">targetNetwork</code> in{" "}
              <code className="italic bg-base-300 text-base font-bold">scaffold.config.ts</code>
            </p>
          </>,
        );
        console.error("⚡️ ~ file: Faucet.tsx:getFaucetAddress ~ error", error);
      }
    };
    getFaucetAddress();
  }, []);

  const sendETH = async () => {
    if (!faucetAddress || !inputAddress) {
      return;
    }
    try {
      setLoading(true);
      await faucetTxn({
        to: inputAddress,
        value: parseEther(sendValue as `${number}`),
        account: faucetAddress,
      });
      setLoading(false);
      setInputAddress(undefined);
      setSendValue("");
    } catch (error) {
      console.error("⚡️ ~ file: Faucet.tsx:sendETH ~ error", error);
      setLoading(false);
    }
  };

  // Render only on local chain
  if (ConnectedChain?.id !== hardhat.id) {
    return null;
  }

  return (
    <div>
      <Button variant="primary" size="sm" className="font-normal gap-1" onClick={() => setIsModalOpen(true)}>
        <BanknotesIcon className="h-4 w-4" />
        <span>Faucet</span>
      </Button>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Local faucet">
        <div className="space-y-3">
          <div className="flex space-x-4">
            <div>
              <span className="text-sm font-bold">From:</span>
              <Address address={faucetAddress} onlyEnsOrAddress />
            </div>
            <div>
              <span className="text-sm font-bold pl-3">Available:</span>
              <Balance address={faucetAddress} />
            </div>
          </div>
          <div className="flex flex-col space-y-3">
            <AddressInput
              placeholder="Destination Address"
              value={inputAddress ?? ""}
              onChange={value => setInputAddress(value as AddressType)}
            />
            <EtherInput placeholder="Amount to send" value={sendValue} onChange={value => setSendValue(value)} />
            <Button
              variant="primary"
              size="sm"
              className="h-10 px-2 rounded-full gap-1"
              onClick={sendETH}
              disabled={loading}
            >
              {!loading ? <BanknotesIcon className="h-6 w-6" /> : <Loading size="sm" />}
              <span>Send</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
