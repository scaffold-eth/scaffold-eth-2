import type { NextPage } from "next";
import Spinner from "~~/components/Spinner";
import useScaffoldRead from "~~/hooks/scaffold-eth/useScaffoldRead";

const DemoExample: NextPage = () => {
  const { data, isLoading, refetch } = useScaffoldRead("YourContract", "purpose");
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-2xl my-5">Example UI</h1>
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
