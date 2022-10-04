import type { NextPage } from "next";
import Balance from "../components/scaffold-eth/Balance";

const EthComponents: NextPage = () => {
  return (
    <div className="px-8 flex flex-col items-center justify-center">
      <h2 className="text-xl">Balance component</h2>
      <Balance address="0x0fAb64624733a7020D332203568754EB1a37DB89" price={1350} wrapperClasses="" minimized={false} />
    </div>
  );
};

export default EthComponents;
