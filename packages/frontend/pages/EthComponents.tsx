import type { NextPage } from "next";
import Balance from "../components/scaffold-eth/Balance";
import AddressInput from "../components/scaffold-eth/AddressInput";
import { useState } from "react";

const EthComponents: NextPage = () => {
  const [address, setAddress] = useState<string>("0x0fAb64624733a7020D332203568754EB1a37DB89");
  return (
    <div className="px-8 flex flex-col items-center justify-center">
      <h2 className="text-xl">Balance component</h2>
      <Balance address="0x0fAb64624733a7020D332203568754EB1a37DB89" price={1350} wrapperClasses="" />

      <h2 className="text-xl">Address Input</h2>
      <AddressInput value={address} onChange={setAddress} placeholder="Enter address" wrapperClasses="" />
    </div>
  );
};

export default EthComponents;
