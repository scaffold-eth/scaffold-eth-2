import type { NextPage } from "next";
import { displayTxResult } from "~~/components/scaffold-eth/Contract/utilsDisplay";
import Spinner from "~~/components/Spinner";
import useScaffoldContractRead from "~~/hooks/scaffold-eth/useScaffoldContractRead";

const DemoExample: NextPage = () => {
  const { data, isLoading, refetch } = useScaffoldContractRead("YourContract", "purpose");
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl my-5">Example UI</h1>
      {isLoading ? <Spinner /> : <p>{displayTxResult(data)}</p>}
      <button
        disabled={isLoading}
        className="btn btn-primary"
        onClick={async () => {
          console.log("Refetching...");
          await refetch();
        }}
      >
        Refetch
      </button>
    </div>
  );
};

export default DemoExample;
