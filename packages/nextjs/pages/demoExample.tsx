import type { NextPage } from "next";
import Spinner from "~~/components/Spinner";
import useScaffoldContractRead from "~~/hooks/scaffold-eth/useScaffoldContractRead";

const DemoExample: NextPage = () => {
  const { data, isLoading, refetch } = useScaffoldContractRead("YourContract", "purpose");
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl my-5">Example UI</h1>
      {/* @ts-expect-error data is unknown is for and will get proper type once the is typed correctly */}
      {isLoading ? <Spinner /> : <p>{data}</p>}
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
