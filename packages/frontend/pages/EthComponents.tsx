import type { NextPage } from "next";
import { useState } from "react";
import AddressInput from "../components/scaffold-eth/AddressInput";

const EthComponents: NextPage = () => {
  const [address, setAddress] = useState<string>("");
  return (
    <div className="px-8 flex flex-col items-center justify-center">
      <h2 className="text-xl">Address Input</h2>
      <AddressInput value={address} onChange={setAddress} placeholder="Enter address" wrapperClasses="" />
    </div>
  );
};

export default EthComponents;
