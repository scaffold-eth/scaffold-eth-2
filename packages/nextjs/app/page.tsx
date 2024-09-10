"use client";

import { ReactNode, useState } from "react";
import type { NextPage } from "next";
import { formatEther, parseEther } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { Address, AddressInput, Balance, EtherInput, InputBase } from "~~/components/scaffold-eth";
import {
  useScaffoldContract,
  useScaffoldEventHistory,
  useScaffoldReadContract,
  useScaffoldWriteContract,
  useTransactor,
} from "~~/hooks/scaffold-eth";

const ExampleWrapper = ({ children }: { children: ReactNode }) => {
  return <div className="flex flex-col gap-4 bg-base-100 shadow-xl rounded-xl p-5">{children}</div>;
};

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  // ------ State ------
  const [newGreeting, setNewGreeting] = useState("");
  const [greetingValue, setNewGreetingValue] = useState("");
  const [counterAddress, setCounterAddress] = useState("");

  // --------------------- SE-2 Custom Hook -------------------
  const transactorWrite = useTransactor();

  // ---- WRITE METHODS ----
  // TEST: Autocompleteion for contractName
  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract("YourContract");

  const { data: walletClient } = useWalletClient();
  const { data: YourContract } = useScaffoldContract({
    // TEST: Autocompleteion for contractName
    contractName: "YourContract",
    // TEST: If you remove walletClient, this it should give TS error at line 115 that `write` is not defined property
    walletClient,
  });

  // --- READ METHODS ---
  const { data: userGreetingCounter, refetch } = useScaffoldReadContract({
    // TEST: Autocompleteion for contractName and functionName
    contractName: "YourContract",
    functionName: "userGreetingCounter",
    args: [counterAddress],
    query: {
      enabled: false,
    },
  });

  const { data: connectedAddressCounter } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "userGreetingCounter",
    args: [connectedAddress],
  });

  const { data: greetingsChangeLogs } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "GreetingChange",
    watch: true,
    fromBlock: 0n,
  });

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10 gap-8">
        <div className="px-5 flex flex-col items-center">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
          </h1>
          <div className="flex gap-2">
            <span>Connected Address: </span>
            <Address address={connectedAddress} />
          </div>
          <div className="flex gap-2 mt-2 items-center">
            <span>Balance: </span>
            <Balance address={connectedAddress} />
          </div>
          <div className="flex gap-2 mb-3">
            <span>My counter</span>
            <span>{connectedAddressCounter?.toString() || 0}</span>
          </div>

          <button
            className="btn btn-primary"
            onClick={async () => {
              try {
                await transactorWrite({
                  to: "0x55b9CB0bCf56057010b9c471e7D42d60e1111EEa",
                  value: parseEther("5"),
                });
              } catch (error) {}
            }}
          >
            Send 5 ETH
          </button>
        </div>
        {/*--------- Write Demo -------------- */}
        {/*Demo with useScaffoldContractWrite Input + Value*/}
        <ExampleWrapper>
          <h1 className="text-center text-lg underline">UseScaffoldContractWrite Example</h1>
          <InputBase placeholder="Set new greeting" value={newGreeting} onChange={value => setNewGreeting(value)} />
          <EtherInput value={greetingValue} onChange={value => setNewGreetingValue(value)} />
          <button
            className="btn btn-primary btn-md"
            onClick={async () => {
              try {
                await writeYourContractAsync({
                  // TEST: TS autocompletion and types for functioName, args and value
                  functionName: "setGreeting",
                  args: [newGreeting],
                  value: greetingValue ? parseEther(greetingValue) : undefined,
                });
              } catch (error) {
                console.error("Error setting greeting", error);
              }
            }}
          >
            Set Greeting
          </button>
        </ExampleWrapper>

        {/*Demo with bare useScaffolContract */}
        <ExampleWrapper>
          <h1 className="text-center text-lg underline">useScaffoldContract Example</h1>
          <InputBase placeholder="Set new greeting" value={newGreeting} onChange={value => setNewGreeting(value)} />
          <EtherInput value={greetingValue} onChange={value => setNewGreetingValue(value)} />
          <button
            className="btn btn-primary btn-md"
            onClick={async () => {
              try {
                if (!YourContract) throw new Error("YourContract not loaded");
                await transactorWrite(() =>
                  YourContract.write.setGreeting([newGreeting], {
                    value: greetingValue ? parseEther(greetingValue) : undefined,
                  }),
                );
              } catch (error) {
                console.error("Error setting greeting", error);
              }
            }}
          >
            Set Greeting
          </button>
        </ExampleWrapper>

        {/*--------- Read Demo -------------- */}
        <ExampleWrapper>
          <h1 className="text-center text-lg underline">useScaffoldContractRead Example</h1>
          <AddressInput placeholder="Counter for address" value={counterAddress} onChange={setCounterAddress} />
          <p>Counter: {userGreetingCounter?.toString()} </p>
          <button className="btn btn-primary btn-md" onClick={() => refetch()}>
            Read
          </button>
        </ExampleWrapper>

        <ExampleWrapper>
          <h1 className="text-center text-lg underline">useScaffoldEventHistory Example</h1>
          <div className="overflow-x-auto">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th></th>
                  <th>Address</th>
                  <th>Greetings</th>
                  <th>Premium</th>
                </tr>
              </thead>
              <tbody>
                {greetingsChangeLogs?.map((log, index) => (
                  <tr key={index}>
                    <th>{index + 1}</th>
                    <th>
                      <Address address={log.args.greetingSetter} />
                    </th>
                    <th>{log.args.newGreeting}</th>
                    <th>{log.args.value ? formatEther(log.args.value) : "0"} ETH</th>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ExampleWrapper>
      </div>
    </>
  );
};

export default Home;
